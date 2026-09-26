# Deployment Guide

This document provides step-by-step instructions for deploying the Campus Event Platform. The architecture consists of a React/Vite frontend hosted on Vercel, a FastAPI backend hosted on Render, and a Supabase PostgreSQL database.

## Prerequisites

- Accounts on [Supabase](https://supabase.com), [Render](https://render.com), and [Vercel](https://vercel.com).
- GitHub repository containing the source code.
- A Google Cloud Platform (GCP) account with the Gemini API enabled, and an API key.

## 1. Supabase Setup (Database & Auth)

1. **Create Project**: Go to the Supabase dashboard and create a new project. Note your database password.
2. **Apply Schema**:
   - Navigate to the **SQL Editor** in your Supabase project.
   - Copy the contents of your `schema.sql` (or run your Alembic migrations).
   - Execute the SQL to create tables and relationships.
3. **Configure Auth**:
   - Under **Authentication -> Providers**, configure Email/Password and any OAuth providers (e.g., Google) you wish to support.
   - Adjust site URL and redirect URLs under **Authentication -> URL Configuration**.
4. **Get Credentials**:
   - Go to **Project Settings -> Database** to find your Connection String (URI). **IMPORTANT**: Ensure you use the transaction connection pooler string if using `asyncpg` in production.
   - Go to **Project Settings -> API** to find your `Project URL`, `anon` key, and `JWT Secret`.

## 2. Backend Deployment (Render)

We use Render's Web Service for the FastAPI backend.

1. In Render, click **New + -> Web Service**.
2. Connect your GitHub repository.
3. **Configuration**:
   - **Name**: `campuslearn-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt` (or use poetry/uv if configured).
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**: Add the variables listed in the checklist below.
5. Click **Create Web Service**. Wait for the build to complete and note the provided Render URL (e.g., `https://campuslearn-backend.onrender.com`).

## 3. Frontend Deployment (Vercel)

1. In Vercel, click **Add New -> Project**.
2. Import your GitHub repository.
3. Select the `frontend` framework preset as **Vite**.
4. Set the **Root Directory** to `frontend/` if you have a monorepo setup.
5. **Environment Variables**: Add the frontend variables listed below.
6. Click **Deploy**.

## Environment Variables Checklist

### Backend (Render)

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Supabase Postgres connection string (use pooler). |
| `SUPABASE_URL` | Supabase Project URL. |
| `SUPABASE_JWT_SECRET` | Used to verify JWTs locally. Found in Supabase API settings. |
| `GEMINI_API_KEY` | Google Gemini API Key. |
| `FRONTEND_URL` | URL of the deployed Vercel frontend (for CORS). |
| `ENVIRONMENT` | `production` |

### Frontend (Vercel)

Prefix variables with `VITE_` if using Vite.

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | The Render backend URL (e.g., `https://campuslearn-backend.onrender.com/api`). |
| `VITE_SUPABASE_URL` | Supabase Project URL. |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key. |

## Post-Deployment Verification

1. **Verify Backend**: Navigate to `https://<render-url>/docs` to see the FastAPI Swagger UI. It should load successfully.
2. **Verify Frontend**: Go to your Vercel URL.
3. **End-to-End Test**:
   - Sign up a new user on the frontend.
   - Check Supabase `auth.users` and your public `users` table to ensure the record exists.
   - Create a test event and try registering for it.
   - Test the AI search to ensure the backend can communicate with the Gemini API.

## Monitoring Recommendations

- **Uptime Monitoring**: Use a tool like UptimeRobot to ping the backend `/health` endpoint.
- **Error Tracking**: Integrate Sentry into both the FastAPI backend and React frontend.
- **Database Metrics**: Regularly check the Supabase dashboard for query performance and connection pool limits.
- **AI Costs**: Monitor the GCP console to track Gemini API usage and costs. Set budget alerts.
