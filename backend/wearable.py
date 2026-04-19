"""Mock wearable data generator - deterministic by user+day."""
from datetime import datetime, timezone, timedelta
import hashlib
import random


def _seeded(user_id: str, day: str) -> random.Random:
    h = hashlib.md5(f"{user_id}:{day}".encode()).hexdigest()
    return random.Random(int(h[:8], 16))


def today_summary(user_id: str = "guest") -> dict:
    day = datetime.now(timezone.utc).date().isoformat()
    r = _seeded(user_id, day)
    steps = r.randint(5500, 11500)
    hr_avg = r.randint(68, 82)
    spo2 = r.randint(95, 99)
    sleep_h = round(r.uniform(6.2, 8.1), 1)
    cals = int(steps * 0.04)
    active_min = r.randint(22, 65)
    stress = r.randint(18, 55)
    return {
        "date": day,
        "steps": steps,
        "steps_goal": 10000,
        "heart_rate_avg": hr_avg,
        "heart_rate_resting": hr_avg - r.randint(8, 15),
        "spo2": spo2,
        "sleep_hours": sleep_h,
        "calories": cals,
        "active_minutes": active_min,
        "stress_level": stress,
    }


def weekly_series(user_id: str = "guest") -> list:
    out = []
    today = datetime.now(timezone.utc).date()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        r = _seeded(user_id, d.isoformat())
        out.append({
            "day": d.strftime("%a"),
            "date": d.isoformat(),
            "steps": r.randint(4500, 12000),
            "heart_rate": r.randint(66, 84),
            "sleep": round(r.uniform(5.8, 8.3), 1),
            "spo2": r.randint(95, 99),
        })
    return out


def ai_insights(summary: dict) -> list:
    tips = []
    if summary["steps"] < 6000:
        tips.append(("warn", f"Only {summary['steps']} steps today. Aim for a 20-min brisk walk."))
    elif summary["steps"] >= 10000:
        tips.append(("good", f"Crushed it — {summary['steps']} steps! Keep it up."))
    else:
        tips.append(("info", f"{summary['steps']} steps. You're on track — one more short walk will hit your goal."))

    if summary["sleep_hours"] < 6.5:
        tips.append(("warn", f"Short sleep ({summary['sleep_hours']}h). Consider sleeping by 10:30 PM."))
    elif summary["sleep_hours"] >= 7.5:
        tips.append(("good", f"Excellent sleep ({summary['sleep_hours']}h). Recovery looks strong."))

    if summary["heart_rate_avg"] > 78:
        tips.append(("info", "Avg HR trending a bit high. Try 5-min box-breathing to relax."))
    if summary["spo2"] < 96:
        tips.append(("warn", f"SpO2 at {summary['spo2']}%. If persistent, consult a physician."))
    if summary["stress_level"] > 45:
        tips.append(("warn", f"Stress level {summary['stress_level']}/100. Take a 10-min break."))
    return tips
