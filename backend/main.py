"""FastAPI server — ADbee image generation (FLUX i2i + Gemini) + Auth."""

from __future__ import annotations

import base64
import logging
import os
import sys
from contextlib import asynccontextmanager
from typing import Annotated

from dotenv import load_dotenv

# Load root .env (one level up from backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware

from config.database import close_db, connect_db
from flux_i2i_service import GEMINI_MODEL_ID, generate_ad_image, image_to_png_bytes
from routes.auth import router as auth_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(title="ADbee Marketing Studio API", version="2.0.0", lifespan=lifespan)

# Session middleware required for Google OAuth state (authlib)
_session_secret = os.getenv("SESSION_SECRET", os.getenv("JWT_SECRET", "change-me-in-production"))
app.add_middleware(SessionMiddleware, secret_key=_session_secret)

# CORS
_default_origins = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:3000,http://127.0.0.1:3000,"
    "http://localhost:8080,http://127.0.0.1:8080,"
    "http://[::1]:8080"
)
_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────

app.include_router(auth_router)


# ── Image generation routes ────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    ok: bool


class GenerateImageResponse(BaseModel):
    image_base64: str
    mime_type: str
    flux_prompt: str


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(ok=True)


def _truthy_form(v: str) -> bool:
    return str(v).strip().lower() in ("1", "true", "yes", "on")


def _optional_int(raw: str | None) -> int | None:
    if raw is None or str(raw).strip() == "":
        return None
    return int(raw)


def _optional_float(raw: str | None) -> float | None:
    if raw is None or str(raw).strip() == "":
        return None
    return float(raw)


@app.post("/api/generate-image", response_model=GenerateImageResponse)
def generate_image_endpoint(
    file: Annotated[UploadFile, File(..., description="Product reference image")],
    prompt: Annotated[str, Form()] = "",
    skip_gemini: Annotated[str, Form()] = "false",
    gemini_model: Annotated[str, Form()] = "",
    steps: Annotated[str | None, Form()] = None,
    guidance: Annotated[str | None, Form()] = None,
) -> GenerateImageResponse:
    logger.info("Received request to generate image.")
    if not file.content_type or not file.content_type.startswith("image/"):
        logger.warning(f"Invalid content type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Upload must be an image file.")
    raw = file.file.read()
    if not raw:
        logger.warning("Received empty file.")
        raise HTTPException(status_code=400, detail="Empty file.")
    model_id = (gemini_model or "").strip() or GEMINI_MODEL_ID
    
    try:
        n_steps = _optional_int(steps)
    except ValueError:
        logger.warning(f"Invalid steps provided: {steps}. Falling back to default.")
        n_steps = None

    try:
        g_scale = _optional_float(guidance)
    except ValueError:
        logger.warning(f"Invalid guidance provided: {guidance}. Falling back to default.")
        g_scale = None

    logger.info(f"Parameters - prompt: '{prompt}', skip_gemini: {skip_gemini}, model: {model_id}, n_steps: {n_steps}, g_scale: {g_scale}")

    try:
        out_image, flux_prompt = generate_ad_image(
            raw,
            user_prompt=prompt,
            skip_gemini=_truthy_form(skip_gemini),
            gemini_model=model_id,
            num_inference_steps=n_steps,
            guidance_scale=g_scale,
        )
        logger.info("Image generated successfully.")
    except ValueError as e:
        logger.error(f"ValueError during image generation: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        logger.error(f"RuntimeError during image generation: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Unexpected error during image generation: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"Generation failed: {e}") from e

    png = image_to_png_bytes(out_image)
    b64 = base64.standard_b64encode(png).decode("ascii")
    logger.info("Successfully encoded generated image to base64.")
    
    return GenerateImageResponse(
        image_base64=b64,
        mime_type="image/png",
        flux_prompt=flux_prompt,
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 4000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
