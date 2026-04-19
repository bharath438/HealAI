"""Sample seed data for HealAI - Universal Health Navigator.
All costs are in INR. Data is mock but realistic for Indian healthcare context.
"""

HOSPITALS = [
    {
        "id": "h1", "name": "Apollo Hospitals", "city": "Bangalore", "state": "Karnataka",
        "type": "private", "rating": 4.6, "distance_km": 3.2,
        "specialties": ["cardiology", "oncology", "orthopedics", "general"],
        "accepts_schemes": ["Ayushman Bharat"], "phone": "080-2630-4050",
        "image": "https://images.unsplash.com/photo-1769147555720-71fc71bfc216?w=400",
    },
    {
        "id": "h2", "name": "Manipal Hospital Whitefield", "city": "Bangalore", "state": "Karnataka",
        "type": "private", "rating": 4.4, "distance_km": 5.8,
        "specialties": ["cardiology", "neurology", "general", "pediatrics"],
        "accepts_schemes": ["Ayushman Bharat", "CGHS"], "phone": "080-2502-4444",
        "image": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400",
    },
    {
        "id": "h3", "name": "Victoria Hospital (Govt)", "city": "Bangalore", "state": "Karnataka",
        "type": "government", "rating": 3.9, "distance_km": 7.1,
        "specialties": ["general", "orthopedics", "pediatrics", "gynecology"],
        "accepts_schemes": ["Ayushman Bharat", "Arogya Karnataka"], "phone": "080-2670-1150",
        "image": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400",
    },
    {
        "id": "h4", "name": "AIIMS Delhi", "city": "New Delhi", "state": "Delhi",
        "type": "government", "rating": 4.7, "distance_km": 2.4,
        "specialties": ["cardiology", "oncology", "neurology", "general", "transplant"],
        "accepts_schemes": ["Ayushman Bharat", "CGHS"], "phone": "011-2658-8500",
        "image": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400",
    },
    {
        "id": "h5", "name": "Fortis Mumbai", "city": "Mumbai", "state": "Maharashtra",
        "type": "private", "rating": 4.5, "distance_km": 4.3,
        "specialties": ["cardiology", "orthopedics", "oncology"],
        "accepts_schemes": ["Mahatma Jyotiba Phule Jan Arogya"], "phone": "022-6754-2222",
        "image": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
    },
    {
        "id": "h6", "name": "KIMS Hyderabad", "city": "Hyderabad", "state": "Telangana",
        "type": "private", "rating": 4.3, "distance_km": 6.5,
        "specialties": ["cardiology", "general", "pediatrics"],
        "accepts_schemes": ["Ayushman Bharat", "Aarogyasri"], "phone": "040-4488-5000",
        "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400",
    },
    {
        "id": "h7", "name": "Veterinary Hospital Hebbal", "city": "Bangalore", "state": "Karnataka",
        "type": "government", "rating": 4.1, "distance_km": 4.0,
        "specialties": ["veterinary", "livestock", "pet_care"],
        "accepts_schemes": ["Pashu Kisan Credit Card"], "phone": "080-2341-1100",
        "image": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
    },
    {
        "id": "h8", "name": "Blue Cross Pet Hospital", "city": "Chennai", "state": "Tamil Nadu",
        "type": "private", "rating": 4.5, "distance_km": 5.2,
        "specialties": ["veterinary", "pet_care", "emergency"],
        "accepts_schemes": [], "phone": "044-2235-1310",
        "image": "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400",
    },
]

# Baseline treatment cost ranges in INR; govt usually 30-50% of private
COST_BASELINE = {
    "fever_flu": {"govt": (200, 800), "private": (1500, 6000)},
    "general_consultation": {"govt": (50, 200), "private": (500, 1500)},
    "diabetes_monthly": {"govt": (300, 800), "private": (1500, 5000)},
    "hypertension_monthly": {"govt": (200, 700), "private": (1200, 4000)},
    "cardiac_bypass": {"govt": (80000, 150000), "private": (250000, 550000)},
    "angioplasty": {"govt": (60000, 100000), "private": (180000, 350000)},
    "knee_replacement": {"govt": (75000, 120000), "private": (220000, 450000)},
    "cataract_surgery": {"govt": (3000, 8000), "private": (25000, 65000)},
    "c_section_delivery": {"govt": (8000, 20000), "private": (50000, 120000)},
    "normal_delivery": {"govt": (2000, 8000), "private": (25000, 60000)},
    "kidney_dialysis": {"govt": (1000, 2500), "private": (3500, 6000)},
    "dengue_treatment": {"govt": (3000, 8000), "private": (15000, 40000)},
    "appendix_surgery": {"govt": (8000, 15000), "private": (45000, 90000)},
    "cancer_chemo_session": {"govt": (5000, 15000), "private": (25000, 80000)},
    "dental_cleaning": {"govt": (100, 300), "private": (800, 2500)},
    "animal_vaccination": {"govt": (50, 200), "private": (400, 1500)},
    "animal_deworming": {"govt": (30, 100), "private": (200, 600)},
    "livestock_vet_visit": {"govt": (100, 300), "private": (500, 2000)},
    "pet_spay_neuter": {"govt": (500, 1500), "private": (3000, 8000)},
}

# Government schemes
SCHEMES = [
    {
        "id": "s1",
        "name": "Ayushman Bharat - PMJAY",
        "category": "human",
        "coverage_amount_inr": 500000,
        "description": "Pradhan Mantri Jan Arogya Yojana provides health cover up to ₹5 lakh per family per year for secondary & tertiary care hospitalization.",
        "eligibility": {
            "income_max_yearly": 180000,
            "categories": ["SECC", "BPL", "rural_poor", "urban_worker"],
        },
        "benefits": ["Cashless treatment", "Pre & post hospitalization", "1,400+ procedures covered"],
        "how_to_apply": "Visit pmjay.gov.in, check eligibility with your Aadhaar/ration card, download e-card at Common Service Centre (CSC) or empanelled hospital.",
        "apply_link": "https://pmjay.gov.in",
    },
    {
        "id": "s2",
        "name": "Arogya Karnataka",
        "category": "human",
        "coverage_amount_inr": 150000,
        "description": "Karnataka state scheme offering universal health coverage for citizens at government hospitals and empanelled private hospitals.",
        "eligibility": {"income_max_yearly": 300000, "categories": ["karnataka_resident"]},
        "benefits": ["Free treatment at govt hospitals", "Secondary care covered", "BPL card holders get full coverage"],
        "how_to_apply": "Apply at nearest taluk hospital with Aadhaar and BPL/ration card.",
        "apply_link": "https://arogya.karnataka.gov.in",
    },
    {
        "id": "s3",
        "name": "CGHS (Central Government Health Scheme)",
        "category": "human",
        "coverage_amount_inr": 1000000,
        "description": "For central government employees, pensioners and their families.",
        "eligibility": {"categories": ["central_govt_employee", "pensioner"]},
        "benefits": ["OPD + IPD", "Medicines", "Diagnostics"],
        "how_to_apply": "Apply through your department HR or visit cghs.gov.in",
        "apply_link": "https://cghs.gov.in",
    },
    {
        "id": "s4",
        "name": "Mahatma Jyotiba Phule Jan Arogya Yojana",
        "category": "human",
        "coverage_amount_inr": 500000,
        "description": "Maharashtra state flagship scheme for BPL and APL (yellow/orange card) families.",
        "eligibility": {"income_max_yearly": 100000, "categories": ["maharashtra_resident", "BPL", "APL"]},
        "benefits": ["996 surgeries covered", "Cashless", "Pre-existing diseases covered"],
        "how_to_apply": "jeevandayee.gov.in or empanelled hospital",
        "apply_link": "https://www.jeevandayee.gov.in",
    },
    {
        "id": "s5",
        "name": "Dr. YSR Aarogyasri",
        "category": "human",
        "coverage_amount_inr": 2500000,
        "description": "Andhra Pradesh & Telangana scheme providing cashless healthcare for BPL families.",
        "eligibility": {"income_max_yearly": 500000, "categories": ["ap_resident", "telangana_resident", "BPL"]},
        "benefits": ["3,000+ procedures", "Up to ₹25 lakh in some cases"],
        "how_to_apply": "Aarogyasri Health Card from Mee Seva center",
        "apply_link": "https://www.ysraarogyasri.ap.gov.in",
    },
    {
        "id": "s6",
        "name": "Pashu Kisan Credit Card (PKCC)",
        "category": "animal",
        "coverage_amount_inr": 160000,
        "description": "Financial assistance for dairy farmers to maintain cattle/buffalo/goat/sheep/poultry.",
        "eligibility": {"categories": ["farmer", "livestock_owner"]},
        "benefits": ["Loan for animal purchase", "Feed & veterinary care", "Low interest (4%)"],
        "how_to_apply": "Apply at nearest cooperative bank with land records + Aadhaar",
        "apply_link": "https://dahd.nic.in",
    },
    {
        "id": "s7",
        "name": "National Livestock Mission",
        "category": "animal",
        "coverage_amount_inr": 5000000,
        "description": "Entrepreneurship development in livestock sector with 50% subsidy.",
        "eligibility": {"categories": ["farmer", "entrepreneur", "SHG"]},
        "benefits": ["50% capital subsidy", "Breed improvement", "Fodder development"],
        "how_to_apply": "Apply via State Animal Husbandry Department or NLM portal",
        "apply_link": "https://nlm.udyamimitra.in",
    },
    {
        "id": "s8",
        "name": "Rashtriya Gokul Mission",
        "category": "animal",
        "coverage_amount_inr": 50000,
        "description": "Development & conservation of indigenous bovine breeds.",
        "eligibility": {"categories": ["dairy_farmer", "cow_owner"]},
        "benefits": ["Free AI services", "Veterinary camps", "Breed improvement"],
        "how_to_apply": "Register at your district animal husbandry office",
        "apply_link": "https://dahd.nic.in",
    },
]

# Critical red-flag symptoms that trigger emergency mode
EMERGENCY_SYMPTOMS = [
    "chest pain", "chest pressure", "heart attack",
    "stroke", "face drooping", "slurred speech", "one side weakness",
    "difficulty breathing", "shortness of breath", "unable to breathe",
    "unconscious", "not responding", "unresponsive",
    "severe bleeding", "heavy bleeding", "blood vomit",
    "suicide", "self harm",
    "seizure", "convulsion", "fit",
    "severe abdominal pain", "poisoning",
    "severe head injury", "skull fracture",
    "animal not eating for days", "animal collapsed", "animal seizure",
    "excessive bleeding in cattle", "cow not standing",
]

EMERGENCY_CONTACTS = [
    {"name": "National Ambulance", "number": "108", "description": "Free emergency ambulance (pan-India)"},
    {"name": "Police", "number": "100"},
    {"name": "Disaster Mgmt", "number": "1077"},
    {"name": "Women Helpline", "number": "1091"},
    {"name": "Mental Health (KIRAN)", "number": "1800-599-0019", "description": "24x7 mental health support"},
    {"name": "Poison Control", "number": "1800-116-117"},
    {"name": "Animal Ambulance (People For Animals)", "number": "98100-12345", "description": "Pet & animal rescue"},
]

# Ayurveda quick suggestions
AYURVEDA_REMEDIES = {
    "cold_cough": {
        "remedies": ["Tulsi-ginger-honey kadha", "Steam inhalation with ajwain", "Turmeric milk at night"],
        "herbs": ["Tulsi", "Ginger", "Black pepper", "Mulethi"],
        "lifestyle": ["Warm water throughout the day", "Avoid cold drinks/curd at night", "Pranayama (Bhastrika)"],
    },
    "fever": {
        "remedies": ["Giloy juice twice daily", "Tulsi-pepper decoction", "Coriander seed water"],
        "herbs": ["Giloy (Guduchi)", "Tulsi", "Sudarshan churna"],
        "lifestyle": ["Rest", "Sip warm water", "Light khichdi diet"],
    },
    "digestion": {
        "remedies": ["Jeera water on empty stomach", "Triphala at night", "Hing + rock salt after meals"],
        "herbs": ["Triphala", "Hing (asafoetida)", "Ajwain", "Jeera"],
        "lifestyle": ["Eat on time", "Avoid overeating", "Walk 100 steps after meals (Shatapavali)"],
    },
    "skin": {
        "remedies": ["Neem-turmeric paste", "Aloe vera gel", "Coconut oil with camphor"],
        "herbs": ["Neem", "Manjistha", "Haldi"],
        "lifestyle": ["Avoid sweets & fried", "Drink 2-3L water", "Bitter greens in diet"],
    },
    "diabetes": {
        "remedies": ["Methi seeds soaked overnight", "Jamun seed powder", "Karela juice morning"],
        "herbs": ["Gudmar", "Vijaysar", "Methi", "Jamun"],
        "lifestyle": ["No sugar/refined carbs", "30-min walk daily", "Yoga (Ardha Matsyendrasana)"],
    },
    "joint_pain": {
        "remedies": ["Mahanarayan oil massage", "Ginger-turmeric milk", "Warm mustard oil with garlic"],
        "herbs": ["Ashwagandha", "Shallaki (Boswellia)", "Rasna"],
        "lifestyle": ["Avoid cold/damp", "Gentle yoga", "Warm fomentation"],
    },
    "stress_sleep": {
        "remedies": ["Brahmi ghee", "Ashwagandha milk before bed", "Abhyanga (self oil massage)"],
        "herbs": ["Brahmi", "Ashwagandha", "Jatamansi", "Shankhpushpi"],
        "lifestyle": ["Fixed sleep time (by 10 PM)", "Pranayama", "Avoid screens 1hr before bed"],
    },
}

# Seasonal health tips
SEASONAL_TIPS = [
    {"season": "monsoon", "tip": "Boil drinking water to prevent typhoid & cholera. Avoid street food.", "risk": "Dengue, Malaria, Gastroenteritis"},
    {"season": "winter", "tip": "Keep warm, stay hydrated. Elderly should monitor BP — cold increases heart risk.", "risk": "Pneumonia, Heart attacks, Joint pain"},
    {"season": "summer", "tip": "Drink 3-4L water with ORS. Avoid peak sun 11am-4pm.", "risk": "Heat stroke, Dehydration, Food poisoning"},
    {"season": "spring", "tip": "Allergy season. Keep inhalers handy.", "risk": "Asthma, Allergic rhinitis"},
]

PREVENTIVE_TIPS_DAILY = [
    "Drink at least 2.5L of water today.",
    "Walk 7,000+ steps to keep your heart healthy.",
    "Include 1 seasonal fruit in your breakfast.",
    "Practice 5 minutes of deep breathing — reduces cortisol.",
    "Sleep by 11 PM; deep sleep repairs immunity.",
    "Eat a handful of nuts — brain food.",
    "Take a 2-min break from screens every 45 min (20-20-20 rule).",
    "Add turmeric to your dinner — natural anti-inflammatory.",
]
