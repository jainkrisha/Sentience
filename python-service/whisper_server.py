"""
Local Whisper Transcription Server
Uses faster-whisper for CPU-based speech-to-text transcription.
No API keys required -- runs entirely on your machine.
"""

import io
import logging
import tempfile
import os

# Redirect model cache to D: drive (C: is full)
os.environ["HF_HOME"] = r"D:\AI-Interview-Coach-main\.hf_cache"
os.environ["HUGGINGFACE_HUB_CACHE"] = r"D:\AI-Interview-Coach-main\.hf_cache"
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Suppress noisy logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("whisper-server")

# Global model reference
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the Whisper model on startup."""
    global model
    from faster_whisper import WhisperModel

    logger.info("Loading faster-whisper model (base, CPU, int8)...")
    logger.info("First run will download ~150MB model. Please wait...")

    model = WhisperModel(
        "tiny",              # ~39MB, very fast on CPU
        device="cpu",
        compute_type="int8", # Fastest on CPU
        cpu_threads=4,
    )
    logger.info("[OK] Whisper model loaded and ready!")
    yield
    logger.info("Shutting down whisper server.")


app = FastAPI(title="Whisper Transcription Server", lifespan=lifespan)

# Allow CORS from Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """Transcribe uploaded audio using faster-whisper."""
    if model is None:
        return JSONResponse(
            content={"error": "Model not loaded yet"},
            status_code=503,
        )

    try:
        # Read uploaded audio
        audio_bytes = await audio.read()
        logger.info(f"Received audio: {len(audio_bytes)} bytes ({audio.filename})")

        if len(audio_bytes) < 500:
            return JSONResponse(content={"text": ""})

        # Write to temp file (faster-whisper needs a file path)
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            # Transcribe
            segments, info = model.transcribe(
                tmp_path,
                beam_size=1,         # Fastest
                language="en",
                vad_filter=True,     # Filter silence
                vad_parameters=dict(min_silence_duration_ms=500),
            )

            # Collect all segments
            full_text = " ".join(seg.text.strip() for seg in segments)
            logger.info(f"Transcription: \"{full_text[:80]}...\"")

            return JSONResponse(content={"text": full_text.strip()})

        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except:
                pass

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return JSONResponse(
            content={"error": f"Transcription failed: {str(e)}"},
            status_code=500,
        )


if __name__ == "__main__":
    print("\n[*] Starting Whisper Transcription Server...")
    print("    Model: faster-whisper (base, int8, CPU)")
    print("    Port:  8069")
    print("    Endpoint: POST http://localhost:8069/transcribe\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8069,
        log_level="info",
    )
