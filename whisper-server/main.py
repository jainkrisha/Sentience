from fastapi import FastAPI, File, UploadFile, HTTPException
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

# Load model once at startup — use "small" for speed, "medium" for accuracy
# Models auto-download on first run (~500MB for small, ~3GB for large)
print("Loading Whisper model... (this may take a moment on first run)")
model = WhisperModel("small", device="cpu", compute_type="int8")
print("Whisper model ready!")


@app.get("/")
def health():
    return {"status": "ok", "model": "faster-whisper small"}


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """
    Accepts any audio file (webm, wav, mp3, ogg etc.)
    Returns the transcribed text.
    """
    # Save uploaded audio to a temp file
    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(tmp_path, beam_size=5)
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
