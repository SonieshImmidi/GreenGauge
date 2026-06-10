from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="GreenGauge API",
    description="Carbon Footprint Awareness Platform — Track, Analyze, and Reduce Your Emissions",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.api import auth, carbon, recommendations, users  # noqa: E402

app.include_router(auth.router)
app.include_router(carbon.router)
app.include_router(users.router)
app.include_router(recommendations.router)


@app.get("/")
async def root():
    return {
        "app": "GreenGauge",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
