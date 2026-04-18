# Emotion Detection Server - Quick Setup

## How to Run

Open a **new terminal** alongside your Whisper server, then:

```bash
cd "D:\SE HACK\ai-interview-coach-main\ai-interview-coach-main\emotion-server"

# Install dependencies (only needed once)
pip install -r requirements.txt

# Start the emotion server
python emotion_server.py
```

The server will start on **http://localhost:8001**

---

## What each package does

| Package | Purpose |
|---|---|
| `fer` | Pre-trained FER-2013 emotion model (auto downloads ~80MB weights) |
| `opencv-python` | Haar Cascade face detection |
| `tensorflow` | Deep learning backend for the CNN |
| `fastapi` + `uvicorn` | HTTP server |

---

## First run

On first run, `fer` will automatically download the model weights. 
You will see output like:
```
Loading emotion model…
✅ FER model loaded (fer package)
INFO:     Uvicorn running on http://0.0.0.0:8001
```

---

## Emotions detected

😠 Angry | 🤢 Disgusted | 😨 Fearful | 😊 Happy | 😐 Neutral | 😢 Sad | 😲 Surprised
