import asyncio
import pathlib
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import feedback, health, predict, train
from app.api.routes import auth
from app.core.config import settings
from app.core.logger import logger
from app.db.database import create_tables
from app.services.model_loader import model_registry


async def _warm_all_domains():
    """Load all remaining domains in background after server starts."""
    domains = ["blood", "breast", "organ_ct", "pneumonia", "skin", "default"]
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        for domain in domains:
            try:
                await loop.run_in_executor(
                    pool,
                    lambda d=domain: model_registry.get_pipeline(
                        domain=d, architecture="resnet50"
                    ),
                )
                logger.info(f"Background warm-up done | domain='{domain}'")
            except Exception as exc:
                logger.warning(f"Background warm-up failed | domain='{domain}': {exc}")
    logger.info("All domain pipelines ready.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create DB tables + warm up all pipelines. Shutdown: log goodbye."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")

    # ── Create Supabase tables ────────────────────────────────────
    try:
        await create_tables()
    except Exception as exc:
        logger.warning(f"DB table creation failed (non-fatal): {exc}")

    # ── Warm chest_xray immediately (most common, blocks until ready) ──
    try:
        model_registry.get_pipeline(domain="chest_xray", architecture="resnet50")
        logger.info("Default pipeline (chest_xray) ready.")
    except Exception as exc:
        logger.warning(f"chest_xray warm-up failed (non-fatal): {exc}")

    # ── Warm all other domains in background (non-blocking) ───────
    asyncio.create_task(_warm_all_domains())

    yield
    logger.info("Shutting down SDPS API.")


# ── Application ───────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Smart Disease Prediction System — CNN + Reinforcement Learning "
        "diagnostic decision-support API."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (Grad-CAM heatmaps) ─────────────────────────────
pathlib.Path("./reports/gradcam").mkdir(parents=True, exist_ok=True)
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

# ── Routers ───────────────────────────────────────────────────────
API_PREFIX = "/api/v1"
app.include_router(health.router,   prefix=API_PREFIX)
app.include_router(auth.router,     prefix=API_PREFIX)
app.include_router(predict.router,  prefix=API_PREFIX)
app.include_router(feedback.router, prefix=API_PREFIX)
app.include_router(train.router,    prefix=API_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "status": "operational",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)