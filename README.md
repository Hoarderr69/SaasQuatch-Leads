# SaasQuatch-Leads

AI-assisted lead generation and outreach automation. This repo includes:

- Backend: FastAPI + MongoDB with a built-in scheduler that sends scheduled emails via SMTP and creates manual tasks for LinkedIn/other steps.
- Frontend: React (Tailwind + shadcn/ui) with tools for Email Generation, Sequence Builder, and Response Tracking.

## Features

- AI helpers

  - Generate personalized outreach content (subject + body) via AI with Gemini/OpenAI fallback and robust templates.
  - Lead scoring and engagement index endpoints for experimentation.

- Sequences (end-to-end)

  - Import contacts from CSV or select from existing mock list.
  - Generate steps from templates or use AI to draft step skeletons.
  - Drag-and-drop step ordering; edit per-step delay days and optional send time (HH:MM).
  - Per-step AI content generation on demand.
  - Start sequence to enqueue and schedule sends.
  - Pause, resume, and delete sequences.

- Email automation

  - SMTP-based sending with DRY_RUN mode for safe testing.
  - One-click “Send Email” from the Email Generator page (uses backend test-send API).
  - Background scheduler dispatches due “email” steps; increments sequence metrics.

- LinkedIn messaging (compliant manual-assist)

  - For LinkedIn/manual steps, the system creates tasks rather than auto-sending (keeps within LinkedIn’s terms).
  - From the UI, open the profile and copy the message in one click to paste in LinkedIn.

- Tracking
  - Response Tracker shows aggregate metrics (sent, opened, replied, positive) across sequences.

## Project structure

```
backend/
	requirements.txt
	server.py
	services/
		ai_services.py
frontend/
	package.json
	src/
		App.js
		pages/
			EmailGenerator.jsx
			SequenceBuilder.jsx
			ResponseTracker.jsx
			...
```

## Prerequisites

- Python 3.10+
- Node 18+
- MongoDB (local or Atlas)

## Backend setup

1. Install dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

2. Configure environment in `backend/.env`

```properties
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=saasquatch
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Optional AI
GEMINI_API_KEY=your_gemini_key

# Email
DRY_RUN=true                 # set to false to actually send mails
SMTP_HOST=smtp.gmail.com     # or your ESP (SES/SendGrid/Mailgun)
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_app_password  # Gmail App Password (with 2FA)
SMTP_FROM=Your Name <your_email@domain.com>

# Scheduler
SCHEDULER_INTERVAL_SECONDS=30
```

Gmail note: enable 2‑Step Verification and create an App Password; do not use your normal password.

3. Run the API

```bash
uvicorn server:app --reload --port 8000
```

The scheduler starts on app startup and processes due items periodically. Avoid running multiple backend instances in dev to prevent duplicate processing.

## Frontend setup

1. Install dependencies and configure API base

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```properties
REACT_APP_BACKEND_URL=http://127.0.0.1:8000
```

2. Run the frontend

```bash
npm start
```

## How to use

1. Email Generator

- Pick a contact and channel (Email/LinkedIn).
- Click Generate to produce AI content; tweak as needed.
- Click “Send Email” to send via SMTP, or “Open & Copy DM” for LinkedIn to copy the message and open the profile tab.

2. Sequence Builder

- Add contacts: upload CSV (headers like name,email,company,title,linkedin_url) or select from the list.
- Generate steps via template or AI. Reorder steps with drag‑and‑drop; edit delay days and optional send time.
- Generate AI content per step if desired.
- Start sequence to enqueue sends.
- Use Pause/Resume/Delete actions on the sequence card.

3. Response Tracker

- View aggregated metrics across sequences: sent, opened, replied, positive.

## API overview (selected)

Base: `http://127.0.0.1:8000/api`

- AI

  - POST `/ai/generate-content` — generate outreach content from profile/context.
  - POST `/ai/score-lead` — simple lead scoring helper.
  - POST `/ai/engagement-index` — engagement/interest heuristic.

- Sequences

  - POST `/sequences/upload-csv` — parse uploaded CSV into contacts.
  - POST `/sequences/generate-steps` — return steps from template or AI skeleton.
  - POST `/sequences` — create a sequence.
  - GET `/sequences` — list sequences.
  - GET `/sequences/{id}` — get one sequence.
  - PUT `/sequences/{id}` — update name/steps/contacts/status.
  - POST `/sequences/{id}/start` — mark active and enqueue sends.
  - POST `/sequences/{id}/pause` — set status paused; queue items marked pending_paused.
  - POST `/sequences/{id}/resume` — set status active; pending_paused → pending.
  - DELETE `/sequences/{id}` — delete sequence and its queue.
  - GET `/sequences/{id}/queue` — view queue items.
  - POST `/sequences/{id}/requeue` — rebuild queue from current steps.

- Tracker

  - GET `/tracker/summary` — aggregate metrics across sequences.

- Email
  - POST `/email/send-test` — send an immediate email for quick verification.

## Design notes

- Scheduler

  - Runs inside the FastAPI process using a lifespan handler. Checks due items every `SCHEDULER_INTERVAL_SECONDS` and dispatches emails. LinkedIn/manual steps become tasks (no auto-DMs).
  - In production, prefer a single backend instance or add a distributed lock for horizontal scaling.

- LinkedIn compliance
  - No automated DM sending. The UI provides an “Open & Copy” action to help users send messages manually within platform rules.

## Deployment

- Backend

  - Deployed on Railway as a long-running app (not serverless) so the scheduler runs.
  - Use MongoDB Atlas for managed database.

- Frontend
  - Deployed on Vercel

## License
Suryansh Dubey, 2025
