# CampusConnect

**One campus. Every event. Intelligent discovery.**

A centralized campus event platform that solves fragmented event discovery, communication, and coordination across college clubs, committees, departments, and faculty.

> Built as a production-oriented platform that a college could actually adopt — not a prototype.

---

## Problem

College events are scattered across WhatsApp groups, Instagram pages, Google Forms, posters, and class announcements. Students miss relevant events, clubs lack a standardized publishing platform, and temporary committees have no infrastructure.

## Solution

CampusConnect provides:
- **Centralized event discovery** — one place for every campus event
- **Intelligent recommendations** — personalized suggestions based on interests
- **Verified organizers** — trusted event sources with verification badges
- **AI Event Copilot** — helps organizers create professional event listings
- **Natural language search** — "Show me AI events this weekend"
- **Conflict detection** — warns about scheduling overlaps
- **Role-based access** — students, organizers, and administrators

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| AI | Google Gemini API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Features

### For Students
- Browse and search events with filters
- Personalized recommendations with match scores
- Natural language search
- Event registration and bookmarks
- Calendar view
- Schedule conflict detection
- Weekly campus digest

### For Organizers
- Organization profile with verification
- Event creation with AI Copilot
- Registration management
- Event analytics
- Draft and publish workflow

### For Administrators
- Organization verification
- Event moderation
- User management
- Audit logs
- Platform analytics

## Project Structure

```
campus-event-platform/
├── frontend/          # React + Vite application
├── backend/           # FastAPI application
├── database/          # Schema reference and seed data
├── docs/              # Architecture, API, deployment docs
├── tests/             # Backend and load tests
├── .env.example       # Environment variable template
├── README.md
└── LICENSE
```

## Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account
- Google AI Studio API key

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in real values
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env         # Fill in real values
npm run dev
```

### Database
1. Create a Supabase project
2. Run the schema from `database/schema.sql`
3. Optionally seed with `database/seed.sql`

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)

## License

MIT
