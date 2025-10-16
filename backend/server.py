from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Literal
import uuid
from datetime import datetime, timezone, timedelta, time as dt_time
from services.ai_services import lead_scorer, engagement_predictor, content_generator
import csv
from io import StringIO
import asyncio
import smtplib
from email.mime.text import MIMEText


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# AI Models
class LeadScoreRequest(BaseModel):
    email: str
    domain: str
    linkedin_url: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None


class EngagementIndexRequest(BaseModel):
    linkedin_activity: int = 0
    company_growth: str = "stable"
    role_seniority: str = "mid"
    industry_relevance: int = 5
    previous_reply_rate: float = 0.0
    website_status: bool = True


class ContentGenerationRequest(BaseModel):
    recipient_name: str
    company: str
    role: str
    industry: str
    product_info: str
    tone: str = "professional"
    channel: str = "email"
    step_number: int = 1


class LeadBatchScoreRequest(BaseModel):
    leads: List[Dict[str, Any]]


class SendTestEmailRequest(BaseModel):
    to: str
    subject: Optional[str] = None
    body: str


# Sequence Models
class Contact(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    linkedin_url: Optional[str] = None


class Step(BaseModel):
    step_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["email", "linkedin", "manual"] = "email"
    delay_days: int = 0
    subject: Optional[str] = None
    content: Optional[str] = None
    status: Literal["draft", "scheduled", "sent"] = "draft"
    send_time: Optional[str] = None  # Optional HH:MM time-of-day


class SequenceCreateRequest(BaseModel):
    name: str
    steps: List[Step]
    contacts: List[Contact]


class Sequence(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sequence_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    steps: List[Step]
    contacts: List[Contact]
    status: Literal["draft", "active", "paused", "completed"] = "draft"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    metrics: Dict[str, int] = Field(default_factory=lambda: {"sent": 0, "opened": 0, "replied": 0, "positive": 0})


class SequenceUpdateRequest(BaseModel):
    name: Optional[str] = None
    steps: Optional[List[Step]] = None
    contacts: Optional[List[Contact]] = None
    status: Optional[Literal["draft", "active", "paused", "completed"]] = None


class GenerateStepsRequest(BaseModel):
    method: Literal["template", "ai"] = "template"
    template_id: Optional[str] = None
    ai_prompt: Optional[str] = None
    tone: str = "professional"
    steps_count: int = 3

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# AI Endpoints
@api_router.post("/ai/score-lead")
async def score_lead(request: LeadScoreRequest):
    """
    Calculate confidence score for a single lead
    """
    try:
        result = lead_scorer.calculate_confidence_score(
            email=request.email,
            domain=request.domain,
            linkedin_url=request.linkedin_url,
            title=request.title,
            company=request.company
        )
        return result
    except Exception as e:
        logger.error(f"Error scoring lead: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/ai/score-leads-batch")
async def score_leads_batch(request: LeadBatchScoreRequest):
    """
    Calculate confidence scores for multiple leads
    """
    try:
        results = []
        for lead in request.leads:
            score_result = lead_scorer.calculate_confidence_score(
                email=lead.get('email', ''),
                domain=lead.get('domain', ''),
                linkedin_url=lead.get('linkedin_url'),
                title=lead.get('title'),
                company=lead.get('company')
            )
            results.append({
                **lead,
                **score_result
            })
        return {"leads": results, "total": len(results)}
    except Exception as e:
        logger.error(f"Error in batch scoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/ai/engagement-index")
async def calculate_engagement(request: EngagementIndexRequest):
    """
    Calculate engagement index for a lead
    """
    try:
        result = engagement_predictor.calculate_engagement_index(
            linkedin_activity=request.linkedin_activity,
            company_growth=request.company_growth,
            role_seniority=request.role_seniority,
            industry_relevance=request.industry_relevance,
            previous_reply_rate=request.previous_reply_rate,
            website_status=request.website_status
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating engagement: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/ai/generate-content")
async def generate_content(request: ContentGenerationRequest):
    """
    Generate AI-powered outreach content
    """
    try:
        result = content_generator.generate_email_content(
            recipient_name=request.recipient_name,
            company=request.company,
            role=request.role,
            industry=request.industry,
            product_info=request.product_info,
            tone=request.tone,
            channel=request.channel,
            step_number=request.step_number
        )
        return result
    except Exception as e:
        logger.error(f"Error generating content: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Email send (immediate test)
@api_router.post("/email/send-test")
async def send_test_email(req: SendTestEmailRequest):
    try:
        subj = req.subject or ""
        send_email_smtp(req.to, subj, req.body)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Error sending test email: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ======= Sequences Endpoints =======
@api_router.post("/sequences/upload-csv")
async def upload_contacts_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    content = await file.read()
    try:
        text = content.decode("utf-8")
        f = StringIO(text)
        reader = csv.DictReader(f)
        contacts: List[Dict[str, Any]] = []
        for row in reader:
            contacts.append({
                "name": row.get("name") or row.get("Name"),
                "email": row.get("email") or row.get("Email"),
                "company": row.get("company") or row.get("Company"),
                "title": row.get("title") or row.get("Title"),
                "linkedin_url": row.get("linkedin_url") or row.get("LinkedIn") or row.get("linkedin")
            })
        return {"contacts": contacts, "count": len(contacts)}
    except Exception as e:
        logger.error(f"CSV parse error: {e}")
        raise HTTPException(status_code=400, detail="Failed to parse CSV")


@api_router.post("/sequences/generate-steps")
async def generate_steps(req: GenerateStepsRequest):
    try:
        steps: List[Dict[str, Any]] = []
        if req.method == "template":
            # a couple of simple templates
            templates = {
                "simple-2-step": [
                    {"type": "email", "delay_days": 0, "subject": "Quick intro", "content": "Hi {name}, ..."},
                    {"type": "email", "delay_days": 3, "subject": "Following up", "content": "Hi {name}, just checking..."},
                ],
                "email-plus-linkedin": [
                    {"type": "email", "delay_days": 0, "subject": "Idea for {company}", "content": "Hi {name}, ..."},
                    {"type": "linkedin", "delay_days": 2, "content": "Sent connection note to {name} about ..."},
                    {"type": "email", "delay_days": 5, "subject": "Resource for you", "content": "Thought this would help..."},
                ],
            }
            chosen = templates.get(req.template_id or "email-plus-linkedin", [])
            steps = [
                {"step_id": str(uuid.uuid4()), "type": s.get("type", "email"), "delay_days": s.get("delay_days", 0), "subject": s.get("subject"), "content": s.get("content"), "status": "draft"}
                for s in chosen
            ]
        else:
            # AI: draft step skeletons from prompt
            base_types = ["email", "linkedin", "email", "manual"]
            for i in range(req.steps_count):
                t = base_types[i % len(base_types)]
                subj = f"{req.tone.title()} outreach step {i+1}" if t == "email" else None
                content = f"Draft {t} content for step {i+1} based on prompt: {req.ai_prompt or 'N/A'}"
                steps.append({
                    "step_id": str(uuid.uuid4()),
                    "type": t,
                    "delay_days": 0 if i == 0 else (2 if t == "linkedin" else 3),
                    "subject": subj,
                    "content": content,
                    "status": "draft",
                })
        return {"steps": steps}
    except Exception as e:
        logger.error(f"Error generating steps: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/sequences")
async def create_sequence(req: SequenceCreateRequest):
    try:
        seq = Sequence(name=req.name, steps=req.steps, contacts=req.contacts)
        doc = seq.model_dump()
        # serialize datetimes
        doc["created_at"] = doc["created_at"].isoformat()
        if doc.get("started_at"):
            doc["started_at"] = doc["started_at"].isoformat()
        await db.sequences.insert_one(doc)
        return seq
    except Exception as e:
        logger.error(f"Error creating sequence: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/sequences", response_model=List[Sequence])
async def list_sequences():
    items = await db.sequences.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    # restore datetimes
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
        if isinstance(it.get("started_at"), str):
            it["started_at"] = datetime.fromisoformat(it["started_at"])
    return items


@api_router.get("/sequences/{sequence_id}", response_model=Sequence)
async def get_sequence(sequence_id: str):
    it = await db.sequences.find_one({"sequence_id": sequence_id}, {"_id": 0})
    if not it:
        raise HTTPException(status_code=404, detail="Sequence not found")
    if isinstance(it.get("created_at"), str):
        it["created_at"] = datetime.fromisoformat(it["created_at"])
    if isinstance(it.get("started_at"), str):
        it["started_at"] = datetime.fromisoformat(it["started_at"])
    return it


@api_router.put("/sequences/{sequence_id}", response_model=Sequence)
async def update_sequence(sequence_id: str, req: SequenceUpdateRequest):
    update: Dict[str, Any] = {k: v for k, v in req.model_dump(exclude_unset=True).items()}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    # update and return new
    await db.sequences.update_one({"sequence_id": sequence_id}, {"$set": update})
    return await get_sequence(sequence_id)


@api_router.post("/sequences/{sequence_id}/start", response_model=Sequence)
async def start_sequence(sequence_id: str):
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    await db.sequences.update_one(
        {"sequence_id": sequence_id},
        {"$set": {"status": "active", "started_at": now_iso}}
    )
    seq = await db.sequences.find_one({"sequence_id": sequence_id}, {"_id": 0})
    if seq:
        try:
            await enqueue_sequence_sends(seq)
        except Exception as e:
            logger.error(f"Failed to enqueue sends: {e}")
    # return fresh
    return await get_sequence(sequence_id)


class ProgressUpdateRequest(BaseModel):
    sent: Optional[int] = None
    opened: Optional[int] = None
    replied: Optional[int] = None
    positive: Optional[int] = None


@api_router.post("/sequences/{sequence_id}/progress", response_model=Sequence)
async def update_progress(sequence_id: str, req: ProgressUpdateRequest):
    seq = await db.sequences.find_one({"sequence_id": sequence_id})
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    metrics = seq.get("metrics", {"sent": 0, "opened": 0, "replied": 0, "positive": 0})
    data = req.model_dump(exclude_unset=True)
    for key in ["sent", "opened", "replied", "positive"]:
        if key in data and isinstance(data[key], int):
            metrics[key] = data[key]
    await db.sequences.update_one({"sequence_id": sequence_id}, {"$set": {"metrics": metrics}})
    return await get_sequence(sequence_id)


@api_router.get("/tracker/summary")
async def tracker_summary():
    items = await db.sequences.find({}, {"_id": 0, "metrics": 1, "sequence_id": 1}).to_list(1000)
    agg = {"sent": 0, "opened": 0, "replied": 0, "positive": 0}
    for it in items:
        m = it.get("metrics", {})
        for k in agg:
            agg[k] += int(m.get(k, 0))
    return {"summary": agg, "sequences": items}


@api_router.get("/sequences/{sequence_id}/queue")
async def get_sequence_queue(sequence_id: str):
    items = await db.sequence_queue.find({"sequence_id": sequence_id}, {"_id": 0}).sort("scheduled_at", 1).to_list(2000)
    return {"items": items, "total": len(items)}


@api_router.post("/sequences/{sequence_id}/requeue")
async def rebuild_queue(sequence_id: str):
    seq = await db.sequences.find_one({"sequence_id": sequence_id}, {"_id": 0})
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    await enqueue_sequence_sends(seq)
    return {"status": "ok"}


@api_router.post("/sequences/{sequence_id}/pause")
async def pause_sequence(sequence_id: str):
    seq = await db.sequences.find_one({"sequence_id": sequence_id})
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    await db.sequences.update_one({"sequence_id": sequence_id}, {"$set": {"status": "paused"}})
    # Move pending items to pending_paused so scheduler ignores them
    await db.sequence_queue.update_many(
        {"sequence_id": sequence_id, "status": "pending"},
        {"$set": {"status": "pending_paused"}}
    )
    return await get_sequence(sequence_id)


@api_router.post("/sequences/{sequence_id}/resume")
async def resume_sequence(sequence_id: str):
    seq = await db.sequences.find_one({"sequence_id": sequence_id})
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    await db.sequences.update_one({"sequence_id": sequence_id}, {"$set": {"status": "active"}})
    # Move paused items back to pending
    await db.sequence_queue.update_many(
        {"sequence_id": sequence_id, "status": "pending_paused"},
        {"$set": {"status": "pending"}}
    )
    return await get_sequence(sequence_id)


@api_router.delete("/sequences/{sequence_id}")
async def delete_sequence(sequence_id: str):
    # Delete the sequence and its queue entries
    res = await db.sequences.delete_one({"sequence_id": sequence_id})
    await db.sequence_queue.delete_many({"sequence_id": sequence_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return {"status": "deleted", "sequence_id": sequence_id}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ========== Automation & Scheduler ==========

class SequenceSend(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sequence_id: str
    contact: Dict[str, Any]
    step_id: str
    channel: Literal["email", "linkedin", "manual"]
    subject: Optional[str] = None
    content: Optional[str] = None
    scheduled_at: datetime
    sent_at: Optional[datetime] = None
    status: Literal["pending", "sent", "failed", "task_created"] = "pending"
    last_error: Optional[str] = None


def render_template(text: Optional[str], contact: Dict[str, Any]) -> Optional[str]:
    if not text:
        return text
    out = text
    for key in ["name", "company", "title", "email"]:
        val = contact.get(key) or ""
        out = out.replace(f"{{{key}}}", str(val))
    return out


async def enqueue_sequence_sends(sequence: Dict[str, Any]):
    sequence_id = sequence["sequence_id"]
    contacts = sequence.get("contacts", [])
    steps = sequence.get("steps", [])
    started_at = sequence.get("started_at")
    if isinstance(started_at, str):
        started_at = datetime.fromisoformat(started_at)
    elif started_at is None:
        started_at = datetime.now(timezone.utc)

    # remove existing queue for this sequence to avoid duplicates
    await db.sequence_queue.delete_many({"sequence_id": sequence_id})

    # build cumulative delays per step
    cumulative_days = 0
    for step in steps:
        delay = int(step.get("delay_days", 0) or 0)
        cumulative_days += delay
        step_time = step.get("send_time")  # e.g., "09:00"
        sched_dt = started_at + timedelta(days=cumulative_days)
        if step_time and isinstance(step_time, str) and len(step_time.split(":")) == 2:
            try:
                hh, mm = step_time.split(":")
                sched_dt = sched_dt.replace(hour=int(hh), minute=int(mm), second=0, microsecond=0)
            except Exception:
                pass
        # create a queue item per contact
        docs = []
        for c in contacts:
            subject = render_template(step.get("subject"), c)
            content = render_template(step.get("content"), c)
            q = SequenceSend(
                sequence_id=sequence_id,
                contact=c,
                step_id=step.get("step_id"),
                channel=step.get("type", "email"),
                subject=subject,
                content=content,
                scheduled_at=sched_dt,
                status="pending",
            )
            d = q.model_dump()
            d["scheduled_at"] = d["scheduled_at"].isoformat()
            docs.append(d)
        if docs:
            await db.sequence_queue.insert_many(docs)


def get_smtp_config():
    return {
        "host": os.getenv("SMTP_HOST", ""),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASS", ""),
        "from_email": os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "")),
        "dry_run": os.getenv("DRY_RUN", "true").lower() in ("1", "true", "yes"),
    }


def send_email_smtp(to_email: str, subject: str, body: str) -> None:
    cfg = get_smtp_config()
    if cfg["dry_run"]:
        logger.info(f"[DRY_RUN] Would send email to {to_email}: {subject}")
        return
    if not (cfg["host"] and cfg["user"] and cfg["password"] and cfg["from_email"]):
        raise RuntimeError("SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM or DRY_RUN=true")
    msg = MIMEText(body, _charset="utf-8")
    msg["Subject"] = subject
    msg["From"] = cfg["from_email"]
    msg["To"] = to_email
    with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
        server.starttls()
        server.login(cfg["user"], cfg["password"])
        server.sendmail(cfg["from_email"], [to_email], msg.as_string())


async def scheduler_loop():
    interval = int(os.getenv("SCHEDULER_INTERVAL_SECONDS", "30"))
    while True:
        try:
            now = datetime.now(timezone.utc)
            # pull due items
            cursor = db.sequence_queue.find({
                "status": "pending",
                "scheduled_at": {"$lte": now.isoformat()}
            }).limit(50)
            items = await cursor.to_list(50)
            for it in items:
                try:
                    channel = it.get("channel")
                    if channel == "email":
                        to_email = (it.get("contact") or {}).get("email")
                        subj = it.get("subject") or ""
                        body = it.get("content") or ""
                        if to_email:
                            send_email_smtp(to_email, subj, body)
                            await db.sequence_queue.update_one({"id": it["id"]}, {"$set": {"status": "sent", "sent_at": now.isoformat()}})
                            # increment metrics
                            await db.sequences.update_one({"sequence_id": it["sequence_id"]}, {"$inc": {"metrics.sent": 1}})
                        else:
                            await db.sequence_queue.update_one({"id": it["id"]}, {"$set": {"status": "failed", "last_error": "No recipient email"}})
                    elif channel in ("linkedin", "manual"):
                        # create a task placeholder
                        await db.sequence_queue.update_one({"id": it["id"]}, {"$set": {"status": "task_created", "sent_at": now.isoformat()}})
                    else:
                        await db.sequence_queue.update_one({"id": it["id"]}, {"$set": {"status": "failed", "last_error": f"Unknown channel {channel}"}})
                except Exception as e:
                    logger.error(f"Send failed: {e}")
                    await db.sequence_queue.update_one({"id": it["id"]}, {"$set": {"status": "failed", "last_error": str(e)}})
        except Exception as e:
            logger.error(f"Scheduler loop error: {e}")
        await asyncio.sleep(interval)


_scheduler_task = None


@app.on_event("startup")
async def _start_scheduler():
    global _scheduler_task
    _scheduler_task = asyncio.create_task(scheduler_loop())