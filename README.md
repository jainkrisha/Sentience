# Sentience: AI Interview Coach

**Sentience** is a comprehensive, AI-powered career preparation platform designed to simulate realistic job interviews and act as an intelligent career coach. It analyzes **what** you say (verbal responses), **how** you look (non-verbal cues), and **how** your resume ranks (ATS), providing a complete feedback loop to help you land your dream job.

## 🚀 Features

- **Smart Resume Scanning (ATS Checker):** Upload a PDF resume to receive an ATS compatibility score, identify missing keywords, and get actionable formatting feedback tailored to specific job descriptions.
- **Personalized Preparation Planner:** Automatically generates a 2-to-4-week custom study roadmap and readiness baseline based on your CV weaknesses.
- **Live Mock Interviews:** Dynamically generates role-specific interview questions powered by LLMs.
- **Real-time Non-Verbal Assessment:** Uses Edge AI (MediaPipe & Face-API) in the browser to track posture, eye contact, and hand gestures without sending video feeds to a server.
- **Audio Integration:** Features an automated Text-to-Speech system to read questions aloud, and Speech-to-Text to transcribe your spoken answers.
- **Actionable Feedback & Scoring:** AI grades your transcribed answers against ideal responses and automatically updates an "Improvement Roadmap" highlighting areas to practice.

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router) & React 18
- **Styling:** Tailwind CSS & Shadcn UI (Radix UI primitives)
- **Animations:** Framer Motion
- **Media & Audio:** `react-webcam`, `react-hook-speech-to-text`, Web Speech API

### Backend & Infrastructure
- **API Runtime:** Next.js Serverless API Routes
- **Authentication:** Custom Cookie-Based Auth System (SHA-256 hashed passwords via crypto)
- **Database:** Neon Postgres (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Document Processing:** `pdf-parse`

### AI & Machine Learning
- **Core LLM Engine:** Meta Llama 3.1 (8B Instruct) via NVIDIA NIM API. Handles dynamic question generation, ATS resume scanning, feedback scoring, and roadmap generation.
- **Computer Vision (Client-Side):** 
  - **Google MediaPipe:** Tracks skeletal landmarks for posture and hand gesture detection.
  - **Face-API.js:** Tracks facial expressions and eye contact directly in the browser.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Neon Postgres Database URL
- NVIDIA NIM API Key (or Google Gemini API Key)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jainkrisha/Sentience.git
   cd ai-interview-coach-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_DRIZZLE_DB_URL=your_neon_postgres_url
   NEXT_PUBLIC_KEY_GEMINI=your_nvidia_nim_api_key
   # Add any other required environment variables
   ```

4. **Push Database Schema:**
   ```bash
   npm run db-push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Architecture Overview
- `app/api/*`: Next.js serverless functions handling auth, roadmap logic, and AI integrations.
- `app/dashboard/*`: Protected routes for the user dashboard, mock interviews, and ATS checker.
- `utils/schema.js`: Drizzle ORM schema definitions mapping out the Postgres database structure.
- `utils/Geminimodel.js`: Wrapper utility for communicating with the AI Inference API.
