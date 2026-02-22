from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings

# Import routers
from routes.auth import router as auth_router
from routes.questions import router as questions_router
from routes.dashboard import router as dashboard_router
from routes.recordings import router as recordings_router
from routes.feedback import router as feedback_router
from routes.roleplay import router as roleplay_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Flowenci API with Supabase REST Client")
    yield
    print("Shutting down Flowenci API")


app = FastAPI(
    title="Flowenci API",
    description="AI-powered interview confidence trainer for Indian students",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(questions_router)
app.include_router(dashboard_router)
app.include_router(recordings_router)
app.include_router(feedback_router)
app.include_router(roleplay_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "Flowenci API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
