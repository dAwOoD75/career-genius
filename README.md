# Career Genius — Fueling the Quest for Growth

> An AI-powered career preparation platform for students, fresh graduates, and job seekers.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)

---

## Overview

Career Genius is a full-stack, AI-powered SaaS platform that helps users:
- Analyze their CVs for ATS compatibility
- Build professional resumes with AI assistance
- Generate personalized cover letters
- Practice interviews with an AI chatbot
- Predict salary ranges based on skills and location

---

## Features

| Module | Description |
|--------|-------------|
| **CV Analyzer** | Upload PDF/DOCX → ATS score, keyword match, formatting analysis |
| **Resume Builder** | Dynamic form + AI summaries + template selection |
| **Cover Letter AI** | Job description → personalized letter in seconds |
| **Interview Coach** | Real-time AI interview simulation with feedback |
| **Salary Predictor** | Skills + experience + country → salary range + insights |
| **Dashboard** | Activity overview, stats, saved documents |
| **Auth System** | JWT authentication, secure password hashing |

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS (dark mode)
- Framer Motion animations
- React Router v6
- Recharts (data visualizations)
- Axios + React Hook Form

### Backend
- Python 3.11 + FastAPI
- SQLAlchemy ORM
- PostgreSQL (production) / SQLite (dev)
- JWT authentication (python-jose)
- Passlib bcrypt
- OpenAI API (GPT-4o-mini)
- pdfplumber + python-docx
- Slowapi (rate limiting)
- Loguru (logging)

---

## Project Structure

```
fyp c/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── config.py            # Settings/environment
│   │   ├── database.py          # DB connection
│   │   ├── dependencies.py      # Auth dependencies
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── resume.py
│   │   │   ├── ats_report.py
│   │   │   ├── cover_letter.py
│   │   │   ├── chat_session.py
│   │   │   ├── salary_prediction.py
│   │   │   └── activity_log.py
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── cv_analyzer.py
│   │   │   ├── resume_builder.py
│   │   │   ├── cover_letter.py
│   │   │   ├── interview_chat.py
│   │   │   └── salary_predictor.py
│   │   ├── services/            # Business logic + AI
│   │   │   ├── ai_service.py    # OpenAI wrapper
│   │   │   ├── cv_analyzer_service.py
│   │   │   ├── resume_service.py
│   │   │   ├── cover_letter_service.py
│   │   │   ├── interview_service.py
│   │   │   └── salary_service.py
│   │   └── utils/
│   │       ├── security.py      # JWT + hashing
│   │       ├── file_handler.py  # Upload handling
│   │       ├── pdf_extractor.py # Text extraction
│   │       └── logger.py        # Loguru setup
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── frontend/
    ├── src/
    │   ├── main.tsx             # React entry point
    │   ├── App.tsx              # Router setup
    │   ├── index.css            # Global Tailwind styles
    │   ├── types/               # TypeScript interfaces
    │   ├── services/            # Axios API services
    │   ├── contexts/            # Auth + Theme context
    │   ├── components/common/   # Reusable components
    │   ├── layouts/             # DashboardLayout
    │   └── pages/               # All page components
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── .env.example
    └── Dockerfile
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- An OpenAI API key

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env
# Edit .env: add your OPENAI_API_KEY

# Run development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
copy .env.example .env

# Start development server
npm run dev
```

The app will be available at: http://localhost:5173

---

## API Documentation

All endpoints are prefixed with `/api/v1`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login + get JWT token |
| POST | `/auth/change-password` | Change password |

### CV Analyzer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cv-analyzer/analyze` | Upload + analyze CV |
| GET | `/cv-analyzer/reports` | List user's reports |
| GET | `/cv-analyzer/reports/{id}` | Get single report |
| DELETE | `/cv-analyzer/reports/{id}` | Delete report |

### Resume Builder
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resume-builder/resumes` | Create resume |
| GET | `/resume-builder/resumes` | List resumes |
| GET | `/resume-builder/resumes/{id}` | Get resume |
| PUT | `/resume-builder/resumes/{id}` | Update resume |
| DELETE | `/resume-builder/resumes/{id}` | Delete resume |
| POST | `/resume-builder/ai-summary` | Generate AI summary |

### Cover Letter
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cover-letter/generate` | Generate cover letter |
| GET | `/cover-letter/letters` | List cover letters |
| GET | `/cover-letter/letters/{id}` | Get letter |
| PUT | `/cover-letter/letters/{id}` | Update letter |
| DELETE | `/cover-letter/letters/{id}` | Delete letter |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/interview/sessions` | Start new session |
| POST | `/interview/sessions/{id}/message` | Send message |
| POST | `/interview/sessions/{id}/end` | End session + get feedback |
| GET | `/interview/sessions` | List sessions |
| GET | `/interview/sessions/{id}` | Get session |

### Salary Predictor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/salary/predict` | Predict salary |
| GET | `/salary/predictions` | List predictions |
| GET | `/salary/predictions/{id}` | Get prediction |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get profile |
| PUT | `/users/me` | Update profile |
| GET | `/users/me/dashboard` | Get dashboard stats |

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=sqlite:///./career_genius.db
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Docker Deployment

```bash
# From the backend directory
# Build and run everything
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop
docker-compose down
```

This starts:
- **Backend** on port 8000
- **PostgreSQL** on port 5432
- **Frontend** on port 3000

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## Sample AI Prompts Used

**CV Analysis:**
> "Analyze this resume and provide ATS compatibility score with keyword matching, formatting issues, and improvement suggestions..."

**Cover Letter:**
> "Write a compelling cover letter for [Role] at [Company] in a [tone] tone based on the job description..."

**Interview:**
> "You are conducting a professional [type] interview at [difficulty] level. Ask relevant questions and provide feedback..."

**Salary Prediction:**
> "Provide salary market insights for [Role] with [X] years experience in [Country]..."

---

## Security Features

- JWT tokens with expiry
- Bcrypt password hashing
- Rate limiting (60 req/min default)
- File type validation
- File size limits (10MB)
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- Input sanitization via Pydantic

---

## License

MIT License — Free to use for academic and personal projects.
