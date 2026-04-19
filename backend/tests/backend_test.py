"""HealAI backend integration tests covering all /api endpoints."""
import os
import io
import base64
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://smart-health-nav.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

# LLM calls can be slow
LLM_TIMEOUT = 90


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    return s


def _make_jpeg_bytes():
    """Create a real JPEG image with features (gradient + shapes) using PIL."""
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (320, 240), (210, 220, 235))
    d = ImageDraw.Draw(img)
    # gradient-ish bands
    for y in range(240):
        d.line([(0, y), (320, y)], fill=(200 - y // 3, 210 - y // 4, 230))
    d.rectangle([40, 40, 140, 140], outline=(20, 20, 20), width=3)
    d.ellipse([160, 60, 280, 180], outline=(150, 20, 20), width=3, fill=(255, 230, 230))
    d.text((20, 200), "MEDICAL REPORT - Patient X  HB 12.5 g/dL", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=80)
    return buf.getvalue()


# -------- Health / Root --------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        assert "HealAI" in data.get("message", "")


# -------- Chat --------
class TestChat:
    def test_chat_human_en_with_disclaimer(self, client):
        r = client.post(f"{API}/chat", json={"message": "I have mild fever and body ache", "mode": "human", "language": "en"}, timeout=LLM_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data["reply"], str) and len(data["reply"]) > 5
        assert data["session_id"]
        assert data["disclaimer"]
        assert data["emergency"] is False
        pytest.session_id_human = data["session_id"]

    def test_chat_emergency_chest_pain(self, client):
        r = client.post(f"{API}/chat", json={"message": "I have severe chest pain and can't breathe", "mode": "human", "language": "en"}, timeout=LLM_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert data["emergency"] is True
        assert any("chest pain" in x.lower() for x in data["emergency_reasons"])

    def test_chat_animal_hindi(self, client):
        r = client.post(f"{API}/chat", json={"message": "मेरी गाय दूध नहीं दे रही", "mode": "animal", "language": "hi"}, timeout=LLM_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert data["reply"]
        assert "AI" in data["disclaimer"] or "⚕" in data["disclaimer"]

    def test_chat_history(self, client):
        sid = getattr(pytest, "session_id_human", None)
        if not sid:
            pytest.skip("no session")
        r = client.get(f"{API}/chat/history/{sid}", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data["session_id"] == sid
        assert isinstance(data["messages"], list) and len(data["messages"]) >= 1


# -------- Symptoms --------
class TestSymptoms:
    def test_analyze(self, client):
        r = client.post(f"{API}/symptoms/analyze", json={"symptoms": ["cough", "sore throat"], "mode": "human", "age": 30, "language": "en"}, timeout=LLM_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert data["analysis"]
        assert "disclaimer" in data


# -------- Conditions & Cost --------
class TestCost:
    def test_conditions_has_human_and_animal(self, client):
        r = client.get(f"{API}/conditions", timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        cats = {i["category"] for i in items}
        assert "human" in cats and "animal" in cats

    def test_cost_estimate_bangalore_both(self, client):
        r = client.post(f"{API}/cost/estimate", json={"condition_key": "cardiac_bypass", "city": "Bangalore"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data["breakdown"]) == 2
        types = {b["hospital_type"] for b in data["breakdown"]}
        assert types == {"govt", "private"}
        assert data["city_multiplier"] == 1.15
        assert isinstance(data["matching_hospitals"], list)
        assert isinstance(data["alternatives"], list) and len(data["alternatives"]) > 0

    def test_cost_estimate_unknown(self, client):
        r = client.post(f"{API}/cost/estimate", json={"condition_key": "foo_bar"}, timeout=10)
        assert r.status_code == 404


# -------- Hospitals --------
class TestHospitals:
    def test_list_human_filters_vet(self, client):
        r = client.get(f"{API}/hospitals?mode=human", timeout=10)
        assert r.status_code == 200
        hs = r.json()["hospitals"]
        assert all("veterinary" not in h["specialties"] for h in hs)
        assert len(hs) >= 1

    def test_list_animal_only_vet(self, client):
        r = client.get(f"{API}/hospitals?mode=animal", timeout=10)
        assert r.status_code == 200
        hs = r.json()["hospitals"]
        assert len(hs) >= 1
        assert all("veterinary" in h["specialties"] for h in hs)

    def test_search_by_city(self, client):
        r = client.post(f"{API}/hospitals/search", json={"city": "Bangalore", "mode": "human"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["total"] >= 1
        assert all(h["city"] == "Bangalore" for h in data["hospitals"])


# -------- Schemes --------
class TestSchemes:
    def test_schemes_all(self, client):
        r = client.get(f"{API}/schemes", timeout=10)
        assert r.status_code == 200
        assert r.json()["total"] >= 6

    def test_schemes_animal(self, client):
        r = client.get(f"{API}/schemes?category=animal", timeout=10)
        assert r.status_code == 200
        names = [s["name"] for s in r.json()["schemes"]]
        assert any("Pashu" in n for n in names)

    def test_eligibility_human_bpl(self, client):
        r = client.post(f"{API}/schemes/eligibility", json={"income_yearly": 100000, "category": "BPL", "state": "Karnataka", "mode": "human"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        names = [s["name"] for s in data["eligible"]]
        assert any("Ayushman" in n for n in names)

    def test_eligibility_animal_farmer(self, client):
        r = client.post(f"{API}/schemes/eligibility", json={"is_farmer": True, "mode": "animal"}, timeout=10)
        assert r.status_code == 200
        names = [s["name"] for s in r.json()["eligible"]]
        assert any("Pashu" in n for n in names)


# -------- Emergency / Ayurveda / Tips --------
class TestMisc:
    def test_emergency_info(self, client):
        r = client.get(f"{API}/emergency/info", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["contacts"] and data["nearest_hospitals"]
        assert data["red_flag_symptoms"]

    def test_ayurveda_all(self, client):
        r = client.get(f"{API}/ayurveda", timeout=10)
        assert r.status_code == 200
        assert "fever" in r.json()["categories"]

    def test_ayurveda_fever(self, client):
        r = client.get(f"{API}/ayurveda/fever", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["remedies"] and d["herbs"] and d["lifestyle"]

    def test_daily_tips(self, client):
        r = client.get(f"{API}/tips/daily", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert len(d["tips"]) == 4
        assert isinstance(d["seasonal"], list) and len(d["seasonal"]) >= 1

    def test_dashboard_insights(self, client):
        r = client.get(f"{API}/dashboard/insights", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["health_score"], int)
        assert d["tip"]


# -------- Image / Reports --------
class TestImages:
    def test_image_analyze(self, client):
        img = _make_jpeg_bytes()
        files = {"file": ("test.jpg", img, "image/jpeg")}
        data = {"mode": "human", "context": "skin rash observation", "language": "en"}
        r = client.post(f"{API}/image/analyze", files=files, data=data, timeout=LLM_TIMEOUT)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["analysis"] and d["id"]

    def test_report_upload_list_delete(self, client):
        img = _make_jpeg_bytes()
        files = {"file": ("report.jpg", img, "image/jpeg")}
        r = client.post(f"{API}/reports/upload", files=files, data={"user_id": "TEST_user", "language": "en"}, timeout=LLM_TIMEOUT)
        assert r.status_code == 200, r.text
        rid = r.json()["id"]
        assert r.json()["extracted"]

        # list
        lr = client.get(f"{API}/reports?user_id=TEST_user", timeout=10)
        assert lr.status_code == 200
        assert any(i["id"] == rid for i in lr.json()["reports"])

        # delete
        dr = client.delete(f"{API}/reports/{rid}", timeout=10)
        assert dr.status_code == 200
        assert dr.json()["deleted"] == 1

    def test_image_reject_bad_type(self, client):
        files = {"file": ("test.txt", b"not an image", "text/plain")}
        r = client.post(f"{API}/image/analyze", files=files, data={"mode": "human"}, timeout=15)
        assert r.status_code == 400
