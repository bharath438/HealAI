"""HealAI - Universal Health Navigator - FastAPI backend."""
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

from data import (
    HOSPITALS, COST_BASELINE, SCHEMES, EMERGENCY_SYMPTOMS, EMERGENCY_CONTACTS,
    AYURVEDA_REMEDIES, SEASONAL_TIPS, PREVENTIVE_TIPS_DAILY,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="HealAI - Universal Health Navigator")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ------------------------------- MODELS ------------------------------- #
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    mode: str = "human"  # "human" or "animal"
    language: str = "en"  # en | hi | kn
    profile: Optional[Dict[str, Any]] = None  # age, gender, location, etc.


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    emergency: bool = False
    emergency_reasons: List[str] = []
    suggestions: List[str] = []
    disclaimer: str


class SymptomAnalyzeRequest(BaseModel):
    symptoms: List[str]
    mode: str = "human"
    age: Optional[int] = None
    gender: Optional[str] = None
    duration_days: Optional[int] = None
    language: str = "en"


class CostEstimateRequest(BaseModel):
    condition_key: str  # e.g. 'cardiac_bypass'
    city: Optional[str] = None
    hospital_type: Optional[str] = None  # 'govt' | 'private' | None(both)


class HospitalQuery(BaseModel):
    city: Optional[str] = None
    specialty: Optional[str] = None
    hospital_type: Optional[str] = None
    scheme: Optional[str] = None
    max_budget: Optional[int] = None
    mode: str = "human"  # human | animal


class SchemeEligibilityRequest(BaseModel):
    income_yearly: Optional[int] = None
    state: Optional[str] = None
    category: Optional[str] = None  # 'BPL', 'farmer', etc.
    is_farmer: bool = False
    mode: str = "human"


class ReportRecord(BaseModel):
    id: str
    user_id: str
    filename: str
    extracted: Dict[str, Any]
    uploaded_at: str
    image_base64: Optional[str] = None


# ----------------------------- UTIL --------------------------------- #
LANG_NAMES = {"en": "English", "hi": "Hindi (Devanagari)", "kn": "Kannada (ಕನ್ನಡ)"}

DISCLAIMER_MAP = {
    "en": "⚕️ This is AI-generated guidance, NOT a medical diagnosis. Please consult a licensed doctor/veterinarian for serious concerns.",
    "hi": "⚕️ यह केवल AI सुझाव है, चिकित्सकीय निदान नहीं। गंभीर स्थिति में डॉक्टर/पशुचिकित्सक से सलाह लें।",
    "kn": "⚕️ ಇದು AI ಸಲಹೆ ಮಾತ್ರ, ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯ ಅಲ್ಲ. ಗಂಭೀರ ಸಮಸ್ಯೆಗಳಿಗೆ ವೈದ್ಯ / ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
}


def build_system_prompt(mode: str, language: str) -> str:
    lang = LANG_NAMES.get(language, "English")
    mode_desc = (
        "ANIMAL HEALTH MODE: You are advising an Indian farmer or pet owner about a dog, cow, goat, buffalo, cat, poultry, etc. "
        "Ask for the species/breed/age. Consider livestock livelihood and rural context."
        if mode == "animal"
        else "HUMAN HEALTH MODE: You are helping a person in India with their health concerns. "
        "Consider Indian context: climate, diet, cost-sensitivity, Ayurveda + allopathy."
    )
    return f"""You are HealAI — a compassionate, knowledgeable AI health navigator for India, supporting BOTH humans and animals.

CORE PRINCIPLES:
1. You are NOT a doctor. Always add: "This is guidance, not diagnosis — please consult a licensed professional."
2. Ask 1-2 clarifying questions if symptoms are vague (age, duration, severity).
3. Provide a BALANCED approach:
   - Modern Medicine: likely conditions (non-diagnostic), suggested tests, which specialist to see.
   - Ayurveda / Home remedies: safe, evidence-informed traditional suggestions.
   - Lifestyle: diet, sleep, stress.
4. Mention cost-affordable options (government hospital, Ayushman Bharat) when relevant.
5. If RED-FLAG symptoms appear (chest pain, stroke signs, severe bleeding, unconsciousness, suicidal ideation, severe breathing difficulty, animal collapse) — IMMEDIATELY urge calling 108 (ambulance) and going to nearest emergency.
6. Keep answers SHORT (under 200 words), use bullet points, friendly tone.

{mode_desc}

LANGUAGE: Reply in {lang}. Keep medical/English terms in parentheses if translating to Hindi/Kannada.
"""


async def call_llm(session_id: str, message: str, mode: str, language: str, image_b64: Optional[str] = None) -> str:
    if not EMERGENT_LLM_KEY:
        return "⚠️ AI service is not configured. Please add EMERGENT_LLM_KEY."
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=build_system_prompt(mode, language),
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        if image_b64:
            user_msg = UserMessage(text=message, file_contents=[ImageContent(image_base64=image_b64)])
        else:
            user_msg = UserMessage(text=message)
        response = await chat.send_message(user_msg)
        return response if isinstance(response, str) else str(response)
    except Exception as e:
        logger.exception("LLM error")
        return f"Sorry, I ran into an issue reaching the AI: {str(e)[:120]}"


def check_emergency(text: str) -> List[str]:
    t = text.lower()
    hits = [kw for kw in EMERGENCY_SYMPTOMS if kw in t]
    return hits


# ----------------------------- ROUTES --------------------------------- #
@api_router.get("/")
async def root():
    return {"message": "HealAI - Universal Health Navigator API", "status": "ok"}


@api_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    emergency_hits = check_emergency(req.message)

    reply = await call_llm(session_id, req.message, req.mode, req.language)

    # Persist
    await db.chat_messages.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "mode": req.mode,
        "language": req.language,
        "user_message": req.message,
        "bot_reply": reply,
        "emergency": bool(emergency_hits),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    suggestions = []
    if req.mode == "human":
        suggestions = ["Check treatment cost", "Find nearby hospitals", "Check Ayushman Bharat eligibility"]
    else:
        suggestions = ["Find a veterinarian", "Livestock schemes", "Vaccination schedule"]

    return ChatResponse(
        session_id=session_id,
        reply=reply,
        emergency=bool(emergency_hits),
        emergency_reasons=emergency_hits,
        suggestions=suggestions,
        disclaimer=DISCLAIMER_MAP.get(req.language, DISCLAIMER_MAP["en"]),
    )


@api_router.get("/chat/history/{session_id}")
async def chat_history(session_id: str):
    msgs = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return {"session_id": session_id, "messages": msgs}


@api_router.post("/symptoms/analyze")
async def analyze_symptoms(req: SymptomAnalyzeRequest):
    joined = ", ".join(req.symptoms)
    emergency_hits = check_emergency(joined)
    prompt = (
        f"Patient context: age={req.age}, gender={req.gender}, duration_days={req.duration_days}.\n"
        f"Symptoms: {joined}.\n"
        f"Return in JSON-ish plain-text with sections: 'Possible conditions (non-diagnostic)', "
        f"'Recommended tests', 'Which specialist', 'Ayurveda suggestions', 'Lifestyle', 'When to seek emergency care'."
    )
    session_id = f"symptom-{uuid.uuid4()}"
    reply = await call_llm(session_id, prompt, req.mode, req.language)
    return {
        "analysis": reply,
        "emergency": bool(emergency_hits),
        "emergency_reasons": emergency_hits,
        "disclaimer": DISCLAIMER_MAP.get(req.language, DISCLAIMER_MAP["en"]),
    }


@api_router.get("/conditions")
async def conditions():
    """List available treatments/conditions for cost estimation."""
    label_map = {
        "fever_flu": "Fever / Flu", "general_consultation": "General Consultation",
        "diabetes_monthly": "Diabetes - Monthly", "hypertension_monthly": "Hypertension - Monthly",
        "cardiac_bypass": "Cardiac Bypass Surgery", "angioplasty": "Angioplasty",
        "knee_replacement": "Knee Replacement", "cataract_surgery": "Cataract Surgery",
        "c_section_delivery": "C-Section Delivery", "normal_delivery": "Normal Delivery",
        "kidney_dialysis": "Kidney Dialysis (per session)", "dengue_treatment": "Dengue Treatment",
        "appendix_surgery": "Appendix Surgery", "cancer_chemo_session": "Cancer Chemo (session)",
        "dental_cleaning": "Dental Cleaning",
        "animal_vaccination": "Animal Vaccination", "animal_deworming": "Animal Deworming",
        "livestock_vet_visit": "Livestock Vet Visit", "pet_spay_neuter": "Pet Spay / Neuter",
    }
    items = []
    for k, ranges in COST_BASELINE.items():
        category = "animal" if k.startswith(("animal_", "livestock_", "pet_")) else "human"
        items.append({
            "key": k, "label": label_map.get(k, k), "category": category,
            "govt_min": ranges["govt"][0], "govt_max": ranges["govt"][1],
            "private_min": ranges["private"][0], "private_max": ranges["private"][1],
        })
    return {"items": items}


@api_router.post("/cost/estimate")
async def cost_estimate(req: CostEstimateRequest):
    if req.condition_key not in COST_BASELINE:
        raise HTTPException(404, "Unknown condition")
    base = COST_BASELINE[req.condition_key]

    # City multiplier: tier-1 cities cost 10-25% more
    tier1 = {"mumbai", "delhi", "new delhi", "bangalore", "bengaluru", "hyderabad", "chennai", "kolkata", "pune"}
    city_mul = 1.15 if req.city and req.city.lower() in tier1 else 1.0

    breakdown = []
    for htype in (["govt", "private"] if not req.hospital_type else [req.hospital_type]):
        lo, hi = base[htype]
        lo, hi = int(lo * city_mul), int(hi * city_mul)
        avg = (lo + hi) // 2
        breakdown.append({"hospital_type": htype, "min": lo, "avg": avg, "max": hi})

    # Alternatives
    alternatives = []
    if req.condition_key in ["cardiac_bypass", "knee_replacement", "angioplasty", "cancer_chemo_session"]:
        alternatives.append("Check Ayushman Bharat eligibility — could cover this 100%.")
        alternatives.append("Government super-specialty hospitals (AIIMS, JIPMER, PGIMER) offer world-class care at 60-70% lower cost.")
    if req.condition_key in ["fever_flu", "diabetes_monthly", "hypertension_monthly"]:
        alternatives.append("Jan Aushadhi stores offer generic medicines at 50-80% discount.")
        alternatives.append("Telemedicine (eSanjeevani) provides free consultations.")

    # Matching hospitals — infer mode from condition key
    is_animal_cond = req.condition_key.startswith(("animal_", "pet_", "livestock_"))
    matching = []
    for h in HOSPITALS:
        if req.city and h["city"].lower() != req.city.lower():
            continue
        if req.hospital_type and h["type"] != req.hospital_type:
            continue
        is_vet = "veterinary" in h["specialties"]
        if is_animal_cond and not is_vet:
            continue
        if not is_animal_cond and is_vet:
            continue
        matching.append(h)

    return {
        "condition_key": req.condition_key,
        "city": req.city, "city_multiplier": city_mul,
        "breakdown": breakdown,
        "alternatives": alternatives,
        "matching_hospitals": matching[:6],
        "disclaimer": "Estimates based on 2024-25 average market data. Actual costs vary with complexity, stay duration, and consumables.",
    }


@api_router.post("/hospitals/search")
async def hospitals_search(q: HospitalQuery):
    results = []
    for h in HOSPITALS:
        if q.city and h["city"].lower() != q.city.lower():
            continue
        if q.specialty and q.specialty.lower() not in [s.lower() for s in h["specialties"]]:
            continue
        if q.hospital_type and h["type"] != q.hospital_type:
            continue
        if q.scheme and q.scheme not in h["accepts_schemes"]:
            continue
        if q.mode == "animal" and "veterinary" not in h["specialties"]:
            continue
        if q.mode == "human" and "veterinary" in h["specialties"]:
            continue
        results.append(h)
    results.sort(key=lambda x: (-x["rating"], x["distance_km"]))
    return {"hospitals": results, "total": len(results)}


@api_router.get("/hospitals")
async def hospitals_list(mode: str = "human"):
    filtered = [h for h in HOSPITALS if (
        ("veterinary" in h["specialties"]) if mode == "animal" else ("veterinary" not in h["specialties"])
    )]
    filtered.sort(key=lambda x: (-x["rating"], x["distance_km"]))
    return {"hospitals": filtered, "total": len(filtered)}


@api_router.get("/schemes")
async def schemes_list(category: Optional[str] = None):
    result = SCHEMES if not category else [s for s in SCHEMES if s["category"] == category]
    return {"schemes": result, "total": len(result)}


@api_router.post("/schemes/eligibility")
async def schemes_eligibility(req: SchemeEligibilityRequest):
    eligible = []
    maybe = []
    pool = [s for s in SCHEMES if s["category"] == req.mode]
    for s in pool:
        elig = s.get("eligibility", {})
        income_max = elig.get("income_max_yearly")
        cats = elig.get("categories", [])

        income_ok = income_max is None or (req.income_yearly is not None and req.income_yearly <= income_max)

        category_match = False
        if req.category and req.category.lower() in [c.lower() for c in cats]:
            category_match = True
        if req.is_farmer and any(c in ("farmer", "livestock_owner", "dairy_farmer", "entrepreneur", "SHG") for c in cats):
            category_match = True
        if req.state and any(req.state.lower() in c.lower() for c in cats):
            category_match = True
        if not cats:
            category_match = True

        if income_ok and category_match:
            eligible.append(s)
        elif income_ok or category_match:
            maybe.append(s)

    return {"eligible": eligible, "maybe_eligible": maybe, "total_eligible": len(eligible)}


@api_router.get("/emergency/info")
async def emergency_info(city: Optional[str] = None, mode: str = "human"):
    # nearest hospitals from seed
    pool = [h for h in HOSPITALS if (
        ("veterinary" in h["specialties"]) if mode == "animal" else ("veterinary" not in h["specialties"])
    )]
    if city:
        pool_city = [h for h in pool if h["city"].lower() == city.lower()]
        if pool_city:
            pool = pool_city
    pool = sorted(pool, key=lambda x: x["distance_km"])[:5]
    return {
        "contacts": EMERGENCY_CONTACTS,
        "nearest_hospitals": pool,
        "red_flag_symptoms": [
            "Chest pain / pressure", "Sudden face drooping / slurred speech",
            "Severe shortness of breath", "Uncontrolled bleeding",
            "Loss of consciousness", "Seizure / convulsion",
            "Thoughts of self-harm", "Severe head injury",
        ],
        "animal_red_flags": [
            "Not eating for 2+ days", "Collapse / unable to stand",
            "Seizure / convulsion in pet", "Severe bleeding",
            "Bloated abdomen (cow/dog)", "Pale gums",
        ],
    }


@api_router.get("/ayurveda/{category}")
async def ayurveda_category(category: str):
    if category not in AYURVEDA_REMEDIES:
        raise HTTPException(404, f"Unknown category. Available: {list(AYURVEDA_REMEDIES.keys())}")
    return {"category": category, **AYURVEDA_REMEDIES[category]}


@api_router.get("/ayurveda")
async def ayurveda_all():
    return {"categories": list(AYURVEDA_REMEDIES.keys()), "data": AYURVEDA_REMEDIES}


@api_router.get("/tips/daily")
async def daily_tips():
    random.seed(datetime.now(timezone.utc).date().isoformat())
    return {
        "tips": random.sample(PREVENTIVE_TIPS_DAILY, k=4),
        "seasonal": SEASONAL_TIPS,
    }


@api_router.post("/image/analyze")
async def image_analyze(
    file: UploadFile = File(...),
    mode: str = Form("human"),
    context: str = Form(""),
    language: str = Form("en"),
):
    """Analyze uploaded image: skin condition / animal disease / medical report."""
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(413, "Image too large (max 8MB)")
    mime = (file.content_type or "image/jpeg").lower()
    if mime not in ("image/png", "image/jpeg", "image/jpg", "image/webp"):
        raise HTTPException(400, "Only PNG/JPEG/WEBP allowed")

    b64 = base64.b64encode(content).decode("utf-8")

    prompt = (
        f"Analyze this image as a medical reference assistant (NOT diagnostic). "
        f"Context: {context or 'general'}. Mode: {mode}.\n"
        f"Provide:\n"
        f"1) What you observe (objectively).\n"
        f"2) Possible conditions (clearly marked non-diagnostic).\n"
        f"3) If this is a medical report / prescription, extract: diseases, medicines (with dosage), tests, key values.\n"
        f"4) Suggested next steps.\n"
        f"5) Urgency: low / medium / HIGH.\n"
        f"Keep under 250 words. If NOT a medical-related image, say so politely."
    )

    session_id = f"img-{uuid.uuid4()}"
    analysis = await call_llm(session_id, prompt, mode, language, image_b64=b64)

    record_id = str(uuid.uuid4())
    await db.image_analyses.insert_one({
        "id": record_id,
        "filename": file.filename,
        "mode": mode,
        "context": context,
        "analysis": analysis,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "id": record_id,
        "analysis": analysis,
        "disclaimer": DISCLAIMER_MAP.get(language, DISCLAIMER_MAP["en"]),
    }


@api_router.post("/reports/upload")
async def report_upload(
    file: UploadFile = File(...),
    user_id: str = Form("guest"),
    language: str = Form("en"),
):
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(413, "File too large (max 8MB)")
    mime = (file.content_type or "").lower()
    if mime not in ("image/png", "image/jpeg", "image/jpg", "image/webp"):
        raise HTTPException(400, "For MVP, only image reports (PNG/JPEG/WEBP) are supported.")

    b64 = base64.b64encode(content).decode("utf-8")

    prompt = (
        "This is a medical report / prescription image. Extract structured info as clean text with these sections:\n"
        "- Patient info (if visible)\n"
        "- Date of report\n"
        "- Diagnosis / Conditions mentioned\n"
        "- Medicines (name, dosage, frequency)\n"
        "- Test values (if lab report) with normal ranges flagged\n"
        "- Doctor's instructions / next steps\n"
        "- Your 2-line plain-English summary\n"
        "Keep concise. If unreadable, say so."
    )
    session_id = f"report-{uuid.uuid4()}"
    extracted = await call_llm(session_id, prompt, "human", language, image_b64=b64)

    record_id = str(uuid.uuid4())
    doc = {
        "id": record_id,
        "user_id": user_id,
        "filename": file.filename,
        "extracted": extracted,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reports.insert_one({**doc})  # no image to save disk
    return {"id": record_id, "extracted": extracted, "uploaded_at": doc["uploaded_at"],
            "disclaimer": DISCLAIMER_MAP.get(language, DISCLAIMER_MAP["en"])}


@api_router.get("/reports")
async def reports_list(user_id: str = "guest"):
    items = await db.reports.find({"user_id": user_id}, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    return {"reports": items, "total": len(items)}


@api_router.delete("/reports/{report_id}")
async def report_delete(report_id: str):
    r = await db.reports.delete_one({"id": report_id})
    return {"deleted": r.deleted_count}


@api_router.get("/dashboard/insights")
async def dashboard_insights(user_id: str = "guest"):
    """Return health-score-like summary for dashboard."""
    reports_count = await db.reports.count_documents({"user_id": user_id})
    chats_count = await db.chat_messages.count_documents({})
    # Score: playful heuristic
    score = 72 + min(reports_count * 2, 18)
    random.seed(datetime.now(timezone.utc).date().isoformat() + user_id)
    return {
        "health_score": score,
        "reports_stored": reports_count,
        "total_conversations": chats_count,
        "streak_days": random.randint(3, 14),
        "trend": "improving" if score >= 80 else "stable",
        "tip": random.choice(PREVENTIVE_TIPS_DAILY),
    }


# Mount router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
