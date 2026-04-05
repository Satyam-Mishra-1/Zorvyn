# Finance Dashboard (frontend)

React + Vite + TypeScript single-page app for the finance dashboard API.

## Features

- JWT login and optional registration (viewer role)
- Role-aware navigation: viewers see dashboard only; analysts see records (read-only); admins see records CRUD and user management
- Dashboard: totals, net balance, category breakdown, recent activity, weekly/monthly trend bars
- Records: filters, pagination, search, create/edit/delete (admin)
- Users: list, search, create, role change, activate/deactivate (admin)

## Setup

1. Start MongoDB and the API (see `../backend/README.md`), including `npm run seed` for demo users.
2. `npm install`
3. `npm run dev` — opens Vite on `http://localhost:5173` with `/api` proxied to `http://127.0.0.1:4000`.

## Production build

`npm run build` outputs static files to `dist/`. Serve them behind any static host; configure that host to proxy `/api` to your backend or set the frontend to call the API origin directly (you would then add `VITE_API_BASE` and adjust `src/api/client.ts`).

## Assumptions

- Development uses same-origin `/api` via Vite proxy so cookies are not required; the token is stored in `localStorage`.
