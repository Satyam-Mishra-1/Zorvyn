# Finance Dashboard API

Node.js (Express) + MongoDB backend for finance records, role-based access control, and dashboard analytics.

## Roles

| Role    | Capabilities |
|--------|----------------|
| **viewer**  | Dashboard summary and trends only (no transaction list or user management). |
| **analyst** | Read all financial records (filters, pagination, search) + dashboard APIs. Cannot create, update, or delete records or manage users. |
| **admin**   | Full CRUD on records (soft delete), full user management, all dashboard APIs. |

## Assumptions

- Single-tenant demo: financial records are global (not per-organization). All analysts/admins see the same dataset; `createdBy` tracks audit.
- JWT bearer authentication; passwords hashed with bcrypt.
- Record delete is a **soft delete** (`deletedAt`).
- User delete is a **soft delete**; status set to inactive.
- Public registration (`POST /api/auth/register`) is controlled by `ALLOW_PUBLIC_REGISTER` (default `true` in `.env.example`); new users get role `viewer`.

## Setup

1. Install [MongoDB](https://www.mongodb.com/try/download/community) locally or use Atlas and set `MONGODB_URI`.
2. Copy `.env.example` to `.env` and adjust secrets.
3. `npm install`
4. `npm run seed` — creates demo users and sample transactions.
5. `npm run dev` — API at `http://localhost:4000`

## Demo accounts (after seed)

- `admin@example.com` / `Admin123!`
- `analyst@example.com` / `Analyst123!`
- `viewer@example.com` / `Viewer123!`

## API overview

- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `POST /api/auth/register` — optional; `{ email, password, name }`
- `GET /api/dashboard/summary` — totals, category breakdown, recent activity
- `GET /api/dashboard/trends?period=weekly|monthly`
- `GET /api/records` — query: `page`, `limit`, `dateFrom`, `dateTo`, `category`, `type`, `search`, `sort`, `order` (analyst, admin)
- `POST /api/records` — admin only
- `PATCH /api/records/:id`, `DELETE /api/records/:id` — admin only
- `GET /api/users` — admin; `POST /api/users` create user; `PATCH /api/users/:id`; `DELETE /api/users/:id`

Interactive docs: `GET /api/docs` (Swagger UI).

## Scripts

- `npm start` — production-style start
- `npm run dev` — watch mode
- `npm run seed` — reset DB with demo data
- `npm test` — integration tests (uses **mongodb-memory-server**; no separate MongoDB process required)

## Tradeoffs

- Rate limiting: 300 requests / 15 minutes per IP on `/api/*`.
- Weekly trends use MongoDB `$week`; labels are year-week style for simplicity.
- Swagger JSDoc spec is minimal; extend `src/app.js` definitions for full path documentation.
