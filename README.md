# CampusConnect — Campus Event Platform

A production-grade campus event discovery and management platform that replaces fragmented event communication (WhatsApp groups, Instagram, posters, Google Forms) with a single, unified platform.

## Problem

College events are fragmented across dozens of channels. Students miss events, organizers can't reach their audience, and there's no centralized way to discover what's happening on campus.

## Solution

CampusConnect provides:
- **Unified event discovery** — Browse, search, and filter all campus events in one place
- **Personalized recommendations** — AI-powered matching based on interests, branch, and behavior
- **Natural language search** — Ask questions like "AI workshops this week" 
- **AI Event Copilot** — Generate event descriptions and get category/tag suggestions
- **Organization management** — Verified clubs and departments with admin approval
- **Calendar view** — Visual month/upcoming views with event indicators
- **Registration system** — One-click registration with capacity tracking
- **Admin panel** — Platform oversight with user management, audit logs, and stats

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, React Router v6 |
| State | Zustand (auth), TanStack React Query (server state) |
| Backend | Python, FastAPI, SQLAlchemy 2.0 (async), asyncpg |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth + JWT verification (HS256) |
| AI | Google Gemini API (gemini-2.0-flash) |
| Hosting | Vercel (frontend), Render (backend) |

## Project Structure

```
CampusConnect/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/             # Route handlers (9 modules)
│   │   ├── middleware/       # JWT auth middleware
│   │   ├── models/           # SQLAlchemy ORM models (8 tables)
│   │   ├── schemas/          # Pydantic v2 request/response schemas
│   │   ├── services/         # Business logic (AI, recommendations, conflicts)
│   │   └── utils/            # Academic year calculation
│   ├── Dockerfile
│   ├── render.yaml           # Render deployment config
│   └── requirements.txt
├── frontend/                # React SPA
│   ├── src/
│   │   ├── api/              # React Query hooks (8 modules)
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Supabase, Axios, Query client setup
│   │   ├── pages/            # 15 page components
│   │   └── store/            # Zustand stores
│   ├── vercel.json
│   └── vite.config.js
├── database/                # SQL reference files
│   ├── schema.sql            # Table definitions
│   ├── indexes.sql           # Performance indexes
│   └── seed.sql              # Demo data (12 events, 7 orgs)
├── docs/                    # Documentation
│   ├── architecture.md       # System design & diagrams
│   ├── api.md                # Complete API reference
│   ├── database.md           # ER diagram & schema docs
│   └── deployment.md         # Deployment guide
└── tests/                   # Test suites
    ├── backend/              # pytest API tests
    └── load/                 # Locust load tests
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase project (free tier)
- Google Gemini API key

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in your credentials
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env         # Fill in your credentials
npm run dev
```

### Database Setup
1. Create a Supabase project
2. Run `database/schema.sql` in the SQL editor
3. Run `database/indexes.sql` for performance indexes
4. Optionally run `database/seed.sql` for demo data

## Features

### For Students
- Browse and discover events with filters (category, date, org)
- Get personalized recommendations with transparent match scores
- Search with natural language ("hackathons next month")
- Register for events with one click
- Bookmark events for later
- Calendar view (month + upcoming)
- Notification feed

### For Organizers
- Create and manage events with rich details
- AI-assisted event description generation
- Venue conflict detection
- Draft → Publish workflow
- Registration tracking and attendee lists
- Organization profile management

### For Admins
- Organization verification workflow
- User role management
- Platform-wide event oversight
- Audit logs for all admin actions
- Platform statistics dashboard

### AI Features
- **Event Copilot**: Generates descriptions, suggests categories and tags
- **Natural Language Search**: Parses queries into structured filters
- **Recommendations**: Transparent scoring based on interests, branch, behavior
- **Fallback**: All AI features degrade gracefully — platform works without AI

## API Endpoints

See [docs/api.md](docs/api.md) for the complete API reference covering 35+ endpoints.

## Design System

- **Background**: `#FAFAF8` (warm off-white)
- **Text**: `#1A1A1A` (near-black)
- **Accent**: `#C85A2A` (rust/burnt orange)
- **Font**: Inter
- **Border radius**: 6px max
- **Style**: Clean, editorial, typography-driven — no glassmorphism or gradients

## License

MIT — see [LICENSE](LICENSE)
