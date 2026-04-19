# HealAI — Universal Health Navigator (PRD)

## Original Problem Statement
A unified hackathon-grade AI healthcare platform for India combining:
- "SmartHealth Navigator AI" (cost estimation, hospital finder, government schemes, emergency)
- "HealAI – Universal Health Assistant" (humans + animals, Ayurveda + modern medicine, farmer mode)

## Architecture
- **Frontend**: React 19 + Tailwind + Shadcn UI + Recharts
- **Backend**: FastAPI + Motor (MongoDB) + emergentintegrations
- **AI**: Claude Sonnet 4.5 (chat + symptoms + vision for reports/images) via Emergent LLM Key
- **DB**: MongoDB — collections: chat_messages, reports, image_analyses

## User Personas
1. Urban patient searching for affordable treatment & schemes
2. Rural user seeking symptom guidance in Hindi/Kannada
3. Pet owner needing vet help
4. Farmer with livestock health & scheme needs

## Core Requirements (implemented 2026-02)
- [x] AI Chat (multilingual EN/HI/KN, human/animal modes, session history)
- [x] Emergency detection with red-flag keywords
- [x] Cost Estimator (govt vs private, city multiplier, charts, alternatives)
- [x] Hospital search (city/specialty/type/mode filters)
- [x] Government schemes list + eligibility checker (human + animal schemes)
- [x] Emergency page (108 call, hotlines, nearest hospitals, red flags)
- [x] Health records upload (image) + AI summary + timeline
- [x] Image-based diagnosis (skin/animal/reports) using Claude vision
- [x] Ayurveda remedies (7 categories)
- [x] Farmer mode (livestock schemes, vaccination schedule, vet cards)
- [x] Dashboard with health score, daily tips, seasonal alerts
- [x] Mode switcher (Human=Sky, Animal=Lime) + language switcher

## Deferred / Backlog (P1/P2)
- P1: Voice assistant (STT + TTS), user authentication, report PDF parsing
- P2: WhatsApp bot, wearable integration, map view, pet emotion detection, real-time WebSockets

## Next Action Items
- User to review and provide feedback
- Potentially add auth + user-specific records
- Add voice input/output
