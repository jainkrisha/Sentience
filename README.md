<div align="center">

# 🤖 AI Interview Coach

### Your Personal AI-Powered Mock Interview Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00e699?logo=postgresql)](https://neon.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Practice interviews smarter** — AI-generated role-specific questions, real-time body language analysis, voice transcription, and instant AI feedback. All in one platform.

</div>

---

## ✨ Features

### 🧠 AI-Powered Question Generation
- Select from **10 pre-built job roles** (Frontend, Backend, ML, DevOps, etc.) or enter a custom role
- Add your **tech stack as tags** (React, Python, Docker, etc.)
- Choose **5, 8, or 10 questions** per session
- AI generates **role-specific, experience-calibrated** questions across different categories:
  - Technical Concepts, Coding/Implementation, System Design, Debugging, Best Practices

### 🎤 Voice Answer & Transcription
- Record your answer via microphone directly in the browser
- Powered by **Faster-Whisper** (local speech-to-text, privacy-first)
- Transcribed text is evaluated by AI and stored per question

### 📷 Real-Time Body Language Analysis (MediaPipe)
- **Eye contact tracking** — detects when you look away from camera
- **Hand gesture detection** — counts excessive hand movement
- **Posture/slouching detection** — alerts when shoulders drop
- All metrics saved to database per session

### 😊 Live Emotion Detection (face-api.js)
- Detects **7 emotions** in real-time directly in the browser (no server needed):
  `Angry 😠 | Disgusted 🤢 | Fearful 😨 | Happy 😊 | Neutral 😐 | Sad 😢 | Surprised 😲`
- Live confidence score + animated bar chart for all 7 emotions
- Powered by **FER-2013 trained CNN** via face-api.js

### 🐍 Python Live Analysis Window (OpenCV)
- Standalone OpenCV window showing **all detections simultaneously**:
  - Emotion bars (FER model)
  - Eye drowsiness (Eye Aspect Ratio)
  - Hand skeleton (MediaPipe Hands)
  - Posture line (MediaPipe Pose)
- Also serves data to Next.js via REST API on port 8001

### 📊 AI Feedback & Scoring
- After completing all questions, AI evaluates each answer
- Gives a **score out of 10** with detailed feedback
- Compares your answer to the model answer
- Session metrics (eye contact, posture, gestures) shown on feedback page

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React, TailwindCSS, shadcn/ui |
| **AI / LLM** | NVIDIA NIM API (Llama 3.1 70B) |
| **Speech-to-Text** | Faster-Whisper (local Python server) |
| **Emotion Detection** | face-api.js (FER-2013 CNN, runs in browser) |
| **Body Language** | MediaPipe (Hands, FaceMesh, Pose) |
| **Python Analysis** | OpenCV + MediaPipe + FER + FastAPI |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Auth** | Custom cookie-based JWT auth |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **NVIDIA NIM API key** — [Get free key here](https://build.nvidia.com/)
- **Neon PostgreSQL** database — [Get free DB here](https://neon.tech/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-interview-coach.git
cd ai-interview-coach
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root:

```env
# Neon PostgreSQL
NEXT_PUBLIC_DRIZZLE_DB_URL=postgresql://user:password@host/dbname?sslmode=require
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# NVIDIA NIM API (for LLM question generation + answer feedback)
NEXT_PUBLIC_KEY_GEMINI=nvapi-YOUR_KEY_HERE
```

### 4. Set Up the Database

```bash
npx drizzle-kit push
```

### 5. Install Python Dependencies

```bash
# Whisper transcription server
cd whisper-server
pip install -r requirements.txt
cd ..

# Live analysis window (emotion + eyes + hands + posture)
cd emotion-server
pip install -r requirements.txt
cd ..
```

---

## ▶️ Running the Project

You need **3 terminals** running simultaneously:

### Terminal 1 — Next.js App
```bash
npm run dev
```
→ App available at **http://localhost:3000**

### Terminal 2 — Whisper Transcription Server
```bash
cd whisper-server
python main.py
```
→ Runs on **http://localhost:8000**
> First run downloads the Whisper model (~500MB)

### Terminal 3 — Live Analysis Window (Optional)
```bash
cd emotion-server
python live_analysis.py
```
→ Opens an **OpenCV window** with all detections
→ API available at **http://localhost:8001**

---

## 📁 Project Structure

```
ai-interview-coach/
├── app/
│   ├── api/
│   │   ├── auth/              # Login, signup, logout
│   │   ├── transcribe/        # Whisper proxy
│   │   ├── detect_emotion/    # Emotion server proxy
│   │   └── proxy-gemini/      # NVIDIA LLM proxy
│   ├── dashboard/
│   │   ├── _components/       # AddNewInterview, Header, InterviewList
│   │   └── interview/
│   │       └── [interviewid]/
│   │           ├── page.jsx           # Interview detail page
│   │           ├── start/
│   │           │   ├── page.jsx       # Interview session
│   │           │   └── _components/
│   │           │       ├── LiveInterviewEngine.jsx  # Main interview UI
│   │           │       ├── RecordAnswerSection.jsx  # Audio recording
│   │           │       ├── QuestionsList.jsx        # Question tabs
│   │           │       └── EndInterviewButton.jsx
│   │           └── feedback/          # Post-interview feedback
│   ├── auth-signin/           # Sign in page
│   └── auth-signup/           # Sign up page
├── components/
│   └── Camera/
│       └── Camera.tsx         # Body language + emotion overlay
├── hooks/
│   ├── useCamera.ts           # Webcam stream hook
│   ├── useMediaPipe.ts        # Posture/eye/hand detection
│   └── useFaceEmotion.ts      # face-api.js emotion detection
├── context/
│   └── MetricsContext.tsx     # Global session metrics state
├── utils/
│   ├── db.js                  # Drizzle DB client
│   ├── schema.js              # DB schema
│   └── Geminimodel.js         # LLM API wrapper
├── emotion-server/
│   ├── live_analysis.py       # OpenCV + all detections + FastAPI
│   └── requirements.txt
├── whisper-server/
│   ├── main.py                # Faster-Whisper FastAPI server
│   └── requirements.txt
└── public/
    └── models/                # face-api.js model weights
```

---

## 🎯 How to Use

1. **Sign up / Sign in** at `http://localhost:3000/auth-signin`
2. On the **Dashboard**, click **"+ Add New"**
3. Pick your **job role** from presets or type a custom one
4. Add your **tech stack tags** (auto-fills based on role)
5. Set your **experience level** and choose **5/8/10 questions**
6. Click **"Generate Questions"** — AI creates tailored questions
7. **Record your answers** using the microphone button
8. Click **Submit** after each answer — AI transcribes and evaluates
9. After the last question, click **"End Interview"**
10. View your **Feedback page** with scores, AI comments, and body language metrics

---

## 🧩 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Browser (Next.js)              │
│                                                 │
│  ┌─────────────┐    ┌──────────────────────┐   │
│  │  Question   │    │   Interview Session   │   │
│  │  Generator  │    │                      │   │
│  │  (LLM API)  │    │  Camera (MediaPipe)  │   │
│  └──────┬──────┘    │  + face-api.js       │   │
│         │           │  + RecordAnswer      │   │
│         ▼           └──────────┬───────────┘   │
│  ┌─────────────┐               │               │
│  │  Neon DB    │◄──────────────┘               │
│  │ (Questions, │                               │
│  │  Answers,   │                               │
│  │  Metrics)   │                               │
│  └─────────────┘                               │
└─────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│  NVIDIA NIM API │  │  Whisper Server  │
│  Llama 3.1 70B  │  │  (localhost:8000)│
│  (Questions +   │  │  Audio → Text    │
│   AI Feedback)  │  └──────────────────┘
└─────────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) — Browser-based face & emotion detection
- [MediaPipe](https://mediapipe.dev/) — Real-time body language analysis
- [Faster-Whisper](https://github.com/guillaumekln/faster-whisper) — Local speech-to-text
- [NVIDIA NIM](https://build.nvidia.com/) — LLM inference API
- [FER-2013](https://www.kaggle.com/datasets/msambare/fer2013) — Emotion recognition dataset
- [Interview Questions Generator](https://github.com/jainkrisha/Interview-Questions-Generator) — Question generation inspiration
- [Emotion Detection](https://github.com/atulapra/Emotion-detection) — FER model reference

---

<div align="center">

**Built with ❤️ for smarter interview preparation**

</div>
