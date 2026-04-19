from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import tempfile
import os
import uvicorn

app = FastAPI(title="Faster-Whisper Transcription Server")

# Allow Next.js dev server to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use base.en for sweet spot between latency and accuracy (very fast)
print("Loading Whisper model (base.en)... (this may take a moment on first run)")
model = WhisperModel("base.en", device="cpu", compute_type="int8")
print("Whisper model ready!")


@app.get("/")
def health():
    return {"status": "ok", "model": "faster-whisper small"}


@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    tech_stack: Optional[str] = Form(None)
):
    """
    Accepts any audio file (webm, wav, mp3, ogg etc.)
    Optionally accepts tech_stack to bias the vocabulary.
    Returns the transcribed text.
    """
    # Save uploaded audio to a temp file
    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name

    # Build initial prompt to bias technical vocabulary if tech_stack is provided
    initial_prompt = "React, JavaScript, Next.js, frontend, backend, API, SQL" # Fallback tech prompt
    if tech_stack:
        initial_prompt = tech_stack

    try:
        # Optimizations:
        # 1. beam_size=2 is faster than 5 but still accurate
        # 2. vad_filter=True chops out silence before processing
        segments, info = model.transcribe(
            tmp_path, 
            beam_size=2,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
            initial_prompt=initial_prompt
        )
        transcript = " ".join([seg.text.strip() for seg in segments])
        return {
            "transcript": transcript,
            "language": info.language,
            "language_probability": round(info.language_probability, 2),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)  # Clean up temp file


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
