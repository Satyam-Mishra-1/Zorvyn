# Finance Dashboard (frontend)

React + Vite + TypeScript single-page app for the finance dashboard API.

## Features

- JWT login and optional registration (viewer role)
- Role-aware navigation: viewers see dashboard only; analysts see records (read-only); admins see records CRUD and user management
- Dashboard: totals, net balance, category breakdown, recent activity, weekly/monthly trend bars
- Records: filters, pagination, search, create/edit/delete (admin)
- Users: list, search, create, role change, activate/deactivate (admin)

## Local development

1. Start MongoDB and the API (see `../backend/README.md`), including `npm run seed` for demo users.
2. `npm install`
3. Do **not** set `VITE_API_URL` locally (or leave it empty). Vite proxies `/api` → `http://127.0.0.1:4000`.
4. `npm run dev` — open `http://localhost:5173`.

## Deploy on Vercel (with API on Render)

Production builds do **not** use the Vite proxy. You must point the UI at your Render API with `VITE_API_URL`.

### 1. Vercel project settings

- **Root Directory:** if the repo contains both `backend/` and `frontend/`, set the Vercel project **Root Directory** to `frontend` (or deploy only the `frontend` folder).
- **Framework preset:** Vite.
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables (Production & Preview):**

  | Name            | Value (example)                          |
  |-----------------|-------------------------------------------|
  | `VITE_API_URL`  | `https://your-service-name.onrender.com` |

  Use your real Render URL: **no trailing slash**, **https**.

  Redeploy after adding or changing env vars (Vite bakes these in at build time).

### 2. Render (backend) CORS

In the Render dashboard, set **Environment** on your API service:

`CORS_ORIGIN=https://your-project.vercel.app,http://localhost:5173`

- Replace `your-project.vercel.app` with your actual Vercel hostname (and add preview URLs if you use them, e.g. `https://your-project-*.vercel.app` is not supported as a wildcard—you can add multiple comma-separated URLs or temporarily use an empty `CORS_ORIGIN` on Render only for debugging, which reflects the request Origin).

Redeploy the Render service after changing env vars.

### 3. `vercel.json`

This repo includes `vercel.json` so React Router paths (e.g. `/login`) resolve to `index.html` on refresh.

## Production build (local check)

```bash
set VITE_API_URL=https://your-api.onrender.com
npm run build
```

Open `dist/index.html` via a static server is not enough for API calls unless `VITE_API_URL` was set at build time.

## Assumptions

- The API is served with a path prefix `/api` on Render (same as this repo). `VITE_API_URL` is only the **origin** (scheme + host + optional port), e.g. `https://api.example.com`.
