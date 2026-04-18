"""
Emotion Detection Server - Port 8001
Accepts a base64-encoded JPEG/PNG frame, detects faces using Haar Cascade,
runs a pre-trained FER-2013 CNN, and returns the dominant emotion label.

Run:  python emotion_server.py
First run will download the model weights automatically (~80 MB via deepface/fer).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import base64
import numpy as np
import cv2
import os

app = FastAPI(title="Emotion Detection Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Haar Cascade ──────────────────────────────────────────────────────────
cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(cascade_path)

# ── Load FER-2013 Keras model ──────────────────────────────────────────────────
# We use the `fer` pip package which ships the model weights so no manual download needed.
EMOTIONS = ["angry", "disgusted", "fearful", "happy", "neutral", "sad", "surprised"]

EMOTION_EMOJI = {
    "angry":     "😠",
    "disgusted": "🤢",
    "fearful":   "😨",
    "happy":     "😊",
    "neutral":   "😐",
    "sad":       "😢",
    "surprised": "😲",
}

print("Loading emotion model…")
try:
    from fer import FER
    detector = FER(mtcnn=False)          # uses Haar cascade internally
    USE_FER = True
    print("✅ FER model loaded (fer package)")
except ImportError:
    # Fallback: load the raw Keras model from the local weights file if present
    USE_FER = False
    try:
        from tensorflow.keras.models import load_model
        MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.h5")
        if os.path.exists(MODEL_PATH):
            keras_model = load_model(MODEL_PATH)
            print("✅ Keras model loaded from model.h5")
        else:
            keras_model = None
            print("⚠️  model.h5 not found. Download from the repo and place beside emotion_server.py")
    except ImportError:
        keras_model = None
        print("⚠️  Neither fer nor tensorflow available. Install: pip install fer")


# ── Request / Response models ──────────────────────────────────────────────────
class FrameRequest(BaseModel):
    image: str   # base64-encoded JPEG or PNG (data-url or raw base64)


class EmotionResponse(BaseModel):
    emotion: str
    emoji: str
    confidence: float
    all_scores: dict


# ── Helper: decode base64 frame → OpenCV image ─────────────────────────────────
def decode_frame(b64: str) -> np.ndarray:
    if "," in b64:                    # strip data-url header
        b64 = b64.split(",", 1)[1]
    img_bytes = base64.b64decode(b64)
    arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    return img


# ── Predict with FER package ───────────────────────────────────────────────────
def predict_fer(img: np.ndarray) -> dict:
    result = detector.detect_emotions(img)
    if not result:
        return None
    emotions = result[0]["emotions"]
    best = max(emotions, key=emotions.get)
    return {
        "emotion": best,
        "emoji": EMOTION_EMOJI.get(best, "🙂"),
        "confidence": round(emotions[best], 3),
        "all_scores": {k: round(v, 3) for k, v in emotions.items()},
    }


# ── Predict with raw Keras model ───────────────────────────────────────────────
def predict_keras(img: np.ndarray) -> dict:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) == 0:
        return None
    x, y, w, h = faces[0]
    roi = gray[y:y + h, x:x + w]
    roi = cv2.resize(roi, (48, 48)).astype("float32") / 255.0
    roi = np.expand_dims(roi, axis=-1)     # (48,48,1)
    roi = np.expand_dims(roi, axis=0)      # (1,48,48,1)
    preds = keras_model.predict(roi, verbose=0)[0]
    scores = {EMOTIONS[i]: round(float(preds[i]), 3) for i in range(len(EMOTIONS))}
    best = EMOTIONS[int(np.argmax(preds))]
    return {
        "emotion": best,
        "emoji": EMOTION_EMOJI.get(best, "🙂"),
        "confidence": round(float(np.max(preds)), 3),
        "all_scores": scores,
    }


# ── API Endpoints ──────────────────────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "ok", "model": "fer" if USE_FER else "keras/h5", "port": 8001}


@app.post("/detect_emotion", response_model=EmotionResponse)
async def detect_emotion(body: FrameRequest):
    try:
        img = decode_frame(body.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Bad image: {e}")

    result = None
    if USE_FER:
        result = predict_fer(img)
    elif keras_model is not None:
        result = predict_keras(img)

    if result is None:
        # No face detected — return neutral
        return EmotionResponse(
            emotion="neutral",
            emoji="😐",
            confidence=0.0,
            all_scores={e: 0.0 for e in EMOTIONS},
        )

    return EmotionResponse(**result)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
