from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")


def require_admin(x_admin_token: Optional[str] = Header(default=None)):
    if not ADMIN_TOKEN:
        # not configured — deny all
        raise HTTPException(status_code=503, detail="Admin token not configured")
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True


# ---------- Models ----------
class ContactCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=4000)
    # honeypot — bots fill this
    company: Optional[str] = None


class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Harsha 3D Portfolio API"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate):
    # Honeypot — silently accept but don't save
    if payload.company:
        return ContactMessage(name=payload.name, email=payload.email, message=payload.message)

    msg = ContactMessage(
        name=payload.name.strip(),
        email=str(payload.email).strip(),
        message=payload.message.strip(),
    )
    doc = msg.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    return msg


@api_router.get("/contact", response_model=List[ContactMessage])
async def list_contacts(limit: int = 100, _: bool = Depends(require_admin)):
    if limit < 1 or limit > 500:
        raise HTTPException(status_code=400, detail="limit out of range")
    items = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for it in items:
        if isinstance(it.get('created_at'), str):
            it['created_at'] = datetime.fromisoformat(it['created_at'])
    return items


# ---------- Static content ----------
PROFILE = {
    "name": "HARSHA",
    "full_name": "Chedalla Gopala Krishna Sri Harsha",
    "tagline": "Platform & AI engineer — from Linux kernel internals to shipped web products.",
    "intro": "I build at the edges — patching kernels by day, shipping web products by night. Freelance engineer crafting fast, beautiful, intentional software.",
    "chips": ["Ex-Samsung R&D", "NIT Durgapur", "Linux Kernel", "PyTorch / NLP", "RAG"],
    "experience": [
        {"role": "Platform Engineer Intern", "org": "Samsung R&D", "period": "Jan 2025 – Jul 2025",
         "note": "Patched Linux-kernel CVEs · ~20% OS performance gain · KSM optimization · custom Linux builds · validation with VDbench / LTP."},
        {"role": "Freelance Engineer", "org": "Independent", "period": "Mar 2026 – Present",
         "note": "Shipping production web products end-to-end for founders and small teams."},
    ],
    "education": {"degree": "B.Tech, Electrical Engineering", "school": "NIT Durgapur", "period": "2021 – 2025", "cgpa": "8.28"},
    "skills": ["Linux", "C++", "Python", "Deep Learning", "NLP", "PyTorch", "RAG", "Bash", "Git", "SQL", "Pandas", "HTML/CSS", "DSA", "OOP"],
    "socials": {
        "email": "chedallaharsha3412@gmail.com",
        "phone": "+91 78937 71551",
        "linkedin": "https://www.linkedin.com/in/chedalla-sriharsha-9a411225a",
        "location": "India",
    },
}

PROJECTS = [
    {
        "id": "mla",
        "title": "My Little Adventure",
        "url": "https://mylittleadventure.in",
        "role": "Freelance Engineer",
        "year": "Freelance",
        "description": "Budget-friendly group-travel platform across India. Designed and shipped the React SPA, booking flow, and the marketing surface.",
        "tags": ["React", "Web App", "Travel"],
    },
    {
        "id": "sukhya",
        "title": "Sukhya Med",
        "url": "https://sukhya.com",
        "role": "Freelance Engineer",
        "year": "Freelance",
        "description": "Healthcare platform — find doctors, book appointments. Patient-first flows, clean UX, optimized for trust and conversion.",
        "tags": ["React", "Healthcare", "Booking"],
    },
    {
        "id": "naut",
        "title": "NAutomation Labs",
        "url": "https://nautomationlabs.com",
        "role": "Freelance Engineer",
        "year": "Freelance",
        "description": "AI-native engineering studio — problem to MVP in five days. Built the studio site, brand surface and pitch system.",
        "tags": ["React", "AI", "Product"],
    },
    {
        "id": "v7",
        "title": "V7 Computers",
        "url": "https://v7computers.in",
        "role": "Freelance Engineer",
        "year": "Freelance",
        "description": "One-stop IT business — laptops, printers, CCTV and accessories. Multi-page catalog with lead capture and local SEO.",
        "tags": ["Web", "E-commerce", "Business"],
    },
]


@api_router.get("/profile")
async def get_profile():
    return PROFILE


@api_router.get("/projects")
async def get_projects():
    return PROJECTS


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
