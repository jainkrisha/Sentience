<div align="center">
  <div style="background-color: #2563eb; width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-family: sans-serif;">S</h1>
  </div>
  <h1 align="center">SENTIENCE</h1>
  <p align="center">
    <strong>The Multimodal Behavioral Intelligence Engine & AI Interview Coach</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Llama-3.1_8B-0469E3" alt="Llama 3.1" />
    <img src="https://img.shields.io/badge/MediaPipe-Vision-red" alt="MediaPipe" />
    <img src="https://img.shields.io/badge/Database-Neon_Postgres-00E599?logo=postgresql" alt="Neon Postgres" />
  </p>
</div>

<br />

## 📖 Overview

**Sentience** is a comprehensive, next-generation AI-powered career preparation platform designed to simulate realistic job interviews and act as an intelligent, round-the-clock career coach. 

Going beyond standard text-based mock interviews, Sentience acts as a **Multimodal Behavioral Intelligence Engine**. It holistically analyzes **what** you say (verbal reasoning), **how** you look (non-verbal cues, eye contact, posture), and **how** your resume ranks (ATS parsing), providing a complete, actionable feedback loop to help you land your dream job.

---

## ✨ Core Features

* 📄 **Smart ATS Resume Scanning:** Upload your PDF resume to receive an instant ATS compatibility score. Identify missing keywords, grammatical issues, and get actionable formatting feedback tailored to specific job descriptions.
* 📅 **Personalized Preparation Planner:** Automatically generates a customized 2-to-4-week study roadmap and readiness baseline based on your CV weaknesses and target role.
* 🎙️ **Live Dynamic Mock Interviews:** Role-specific interview questions generated on-the-fly by advanced LLMs based on your experience level and job description.
* 👁️ **Real-Time Non-Verbal Assessment:** Uses Edge AI in the browser to track posture, eye contact, and hand gestures *without* sending your video feed to a server, ensuring absolute privacy.
* 🗣️ **Seamless Audio Integration:** Features an automated Text-to-Speech system to read questions aloud naturally, and Speech-to-Text to transcribe your spoken answers accurately.
* 📊 **Actionable Feedback & Scoring:** AI grades your transcribed answers against industry-ideal responses and automatically updates an "Improvement Roadmap" highlighting specific areas to practice.

---

## 💻 Technology Stack

### Frontend Architecture
* **Framework:** Next.js 14 (App Router) & React 18
* **Styling:** Tailwind CSS & Shadcn UI (Radix UI primitives)
* **Animations:** Framer Motion for fluid transitions
* **Media & Audio:** `react-webcam` for video capture, `react-hook-speech-to-text` & Web Speech API for voice integration

### Backend & Infrastructure
* **API Runtime:** Next.js Serverless API Routes
* **Authentication:** Custom Cookie-Based Secure Auth System (SHA-256 hashed passwords)
* **Database:** Neon Serverless Postgres
* **ORM:** Drizzle ORM for type-safe database queries
* **Document Processing:** `pdf-parse` & `pdfjs-dist` for robust resume parsing

### AI & Computer Vision
* **Core LLM Engine:** Meta Llama 3.1 (via NVIDIA NIM API) or Google Gemini API. Handles dynamic question generation, ATS resume scanning, feedback scoring, and roadmap generation.
* **Client-Side Computer Vision:** 
  * **Google MediaPipe:** Tracks skeletal landmarks for posture analysis.
  * **Face-API.js:** Tracks facial expressions and eye contact directly in the browser.

---

## 🚀 Getting Started

Follow these instructions to set up Sentience locally.

### Prerequisites

* **Node.js** (v18.0.0 or higher)
* **npm** or **yarn**
* A **Neon Postgres Database** URL
* An **NVIDIA NIM API Key** (or Google Gemini API Key)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jainkrisha/Sentience.git
   cd Sentience/ai-interview-coach-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory. Use `.env.example` as a reference if available, or add the following:
   ```env
   # Database Configuration
   NEXT_PUBLIC_DRIZZLE_DB_URL=postgres://[user]:[password]@[host]/[dbname]?sslmode=require

   # AI Integration API Key (NVIDIA NIM or Gemini)
   NEXT_PUBLIC_KEY_GEMINI=your_api_key_here
   ```

4. **Initialize the Database:**
   Push the Drizzle schema to your Neon Postgres database:
   ```bash
   npm run db-push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Open the Application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📁 Project Structure

```text
├── app/
│   ├── (auth)/             # Sign-up / Sign-in routing
│   ├── api/                # Next.js Serverless API endpoints
│   ├── dashboard/          # Protected user dashboard routes
│   └── page.jsx            # Landing page
├── components/             # Reusable UI components
├── public/                 # Static assets & Edge AI models
├── utils/
│   ├── schema.js           # Drizzle ORM PostgreSQL schema
│   ├── db.js               # Database connection utility
│   └── Geminimodel.js      # AI API wrapper configuration
├── package.json
└── tailwind.config.js
```

---

## 🛡️ Privacy & Security

Sentience prioritizes user privacy. **All computer vision processing (posture tracking, eye contact analysis) happens directly within your web browser** using WebAssembly and WebGL. Video feeds are *never* transmitted to or stored on our servers.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ for the next generation of job seekers.</p>
</div>
