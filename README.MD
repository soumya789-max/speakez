# 🎙️ SpeakEZ — AI-Powered Work Simulation Platform

> **Built for the LinkedIn Hackathon** · Team Spark

SpeakEZ is an AI-powered platform that helps students and early professionals build real workplace communication confidence — before entering the workforce. It simulates high-stakes scenarios like job interviews, investor pitches, and team meetings with a live, context-aware AI coach, giving users a safe space to practise, fail, and improve.

---

##  Key Features

### Live AI Simulation
- Real-time voice conversation with an AI coach powered by the **Google Gemini Multimodal Live API**
- Supports three professional scenarios: **Job Interview**, **Investor Pitch**, and **Team Meeting**
- Multiple AI personas (e.g., Supportive Coach, Tough Panel, Skeptical Investor) with configurable pressure levels (Calm → Intense)

###  Context-Aware Intelligence
- Upload your **resume, job descriptions, or project notes** to give the AI full context about you
- The AI adapts its questions and coaching dynamically based on your specific role, company, and goals

###  Real-Time Visual Feedback
- Live **posture stability** and **eye contact** nudges powered by **Google MediaPipe**, running entirely client-side in the browser — no video is ever uploaded to the server

###  Deep Post-Session Analytics
Multi-pipeline analysis running in parallel after each session:
- **Speech Analysis** — Detects filler words, speech pace (WPM), pauses, and fluency
- **NLP Scoring** — Evaluates clarity, structural frameworks (e.g., STAR method), and contextual relevance using semantic embeddings (`sentence-transformers`)
- **Acoustic Analysis** — Extracts vocal confidence features from raw audio using `librosa`
- **Overall Confidence Score** — A weighted composite across all signals

###  Progress Tracking & Roadmap
- **Session History** with per-session breakdowns and confidence scores
- **Improvement Roadmap** — Personalised drills and exercises targeting your most common recurring weaknesses (filler words, pacing, structure)

---

##  Architecture

```
[ User / Browser ]
      |
      | (WebSockets + REST)
      ↓
[ Node.js Gateway API ]  ←──── [ PostgreSQL (via Prisma) ]
      |                  \
      | (Bidi Streaming)   \ (JSON Payload — post-session)
      ↓                    ↓
[ Gemini Live API ]   [ Python Analytics Microservice ]
  Real-time AI coach    NLP · Speech · Audio
```

**Key Design Decision:** The real-time Gemini conversation and the heavy ML analysis are deliberately split across two backends. This ensures the live AI conversation never stutters while Python processes analytics in the background. Vision metrics (MediaPipe) run on-device in the browser — no video frames are ever sent over the network.

---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| **Authentication** | Clerk |
| **Client-Side Vision** | Google MediaPipe Tasks Vision |
| **Backend Gateway** | Node.js, Express.js v5, TypeScript |
| **Database** | SQLite via Prisma ORM |
| **Real-Time AI** | Google Gemini Multimodal Live API |
| **Analytics Service** | Python 3, FastAPI, Uvicorn |
| **NLP / Embeddings** | `sentence-transformers`, PyTorch |
| **Audio Analysis** | `librosa`, `soundfile`, `numpy` |
| **Validation** | Pydantic v2 (Python) |

---

##  Project Structure

```
speakez/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   └── api/              # Node.js Express gateway (port 5000)
├── services/
│   └── analysis-service/ # Python FastAPI microservice (port 8000)
│       ├── modules/
│       │   ├── speech.py       # Speech fluency analysis
│       │   ├── nlp.py          # Semantic NLP scoring
│       │   ├── alignment.py    # Scenario alignment scoring
│       │   ├── voice.py        # Acoustic / vocal analysis
│       │   ├── confidence.py   # Composite score computation
│       │   └── jobs.py         # LinkedIn job recommendation engine
│       └── routes/
│           └── analyze.py      # Main analysis endpoint
└── package.json          # Monorepo root (npm workspaces)
```

---

## Getting Started

### Prerequisites
- **Node.js** v20+
- **Python** 3.10+
- A **Gemini API Key** (from [Google AI Studio](https://aistudio.google.com))
- A **Clerk** account for authentication

### 1. Clone the Repository
```bash
git clone https://github.com/soumya789-max/speakez.git
cd speakez
```

### 2. Configure Environment Variables

Create `apps/api/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
ANALYSIS_SERVICE_URL=http://127.0.0.1:8000
DATABASE_URL=file:./dev.db
CLERK_SECRET_KEY=your_clerk_secret_key
```

Create `apps/web/.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
ANALYSIS_SERVICE_URL=http://localhost:8000
ANALYSIS_TIMEOUT_MS=180000
DATABASE_URL=file:./dev.db
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000

### 3. Start the Python Analytics Service
```bash
cd services/analysis-service

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate       # Windows
# source .venv/bin/activate    # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --reload --port 8000
```

### 4. Start the Node.js Monorepo (Web + API)
Open a new terminal in the project root:
```bash
# Install all dependencies
npm install

# Run database migrations
npm --workspace apps/api run prisma:migrate

# Start both Web and API in parallel
npm run dev
```

### 5. Open the App
| Service | URL |
|---|---|
| Web App | http://localhost:3000 |
| API Gateway | http://localhost:5000 |
| Analytics Service | http://localhost:8000 |

---
Thank you!

---
