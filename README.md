# Finance Data Processing and Access Control — Full Stack

This repository contains a **MongoDB**-backed REST API (Node.js + Express + Mongoose) and a **React** dashboard (Vite + TypeScript) that implements the assignment scenario: users and roles, financial records, aggregated dashboard data, validation, JWT authentication, rate limiting, soft deletes, pagination, search, Swagger UI, and integration tests.

## Quick start

1. **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or set `MONGODB_URI` in `backend/.env`.
2. **Backend**

   ```bash
   cd backend
   copy .env.example .env
   npm install
   npm run seed
   npm run dev
   ```

3. **Frontend** (new terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open **http://localhost:5173**, sign in with seeded accounts (see `backend/README.md`), e.g. `admin@example.com` / `Admin123!`.

API base URL in development: browser calls `/api`, which Vite proxies to port **4000**. Swagger UI: **http://localhost:4000/api/docs**.

## Project layout

| Path | Description |
|------|-------------|
| `backend/` | Express app, models, services, RBAC middleware, routes, tests |
| `frontend/` | React SPA: login, dashboard, records, users |

## Role behavior (summary)

- **viewer**: dashboard summary + trends only; no records list or user APIs.
- **analyst**: read records (filters, pagination, text search) + dashboard; cannot mutate records or users.
- **admin**: full record CRUD (soft delete), full user management, dashboard.

Details and API tables are in `backend/README.md`.

## Tests

From `backend/`, run `npm test` (uses **mongodb-memory-server**; no local MongoDB required for tests).

## Tradeoffs

- Single-tenant global records with `createdBy` for audit (see backend README).
- Weekly/monthly trends are implemented with MongoDB aggregation; labels are simplified for the demo.
