# Zen2Property SaaS

Lightweight, English-first web product for property owners: units, tenants, rent tracking, and country-aware PDF receipts. Local legal obligations live in versioned JSON — an AI module may propose updates, never apply them silently.

## Stack

| Layer | Choice |
|---|---|
| API | Node.js 20, Express, TypeScript, `pg` |
| DB | PostgreSQL 16 |
| Web | Vite, React, React Router |
| PDFs | PDFKit |
| Billing | Stripe-shaped plans (Checkout when keys exist; mock subscribe in dev) |

```
src/          Express API (modular)
web/          React SPA
migrations/   SQL
```

## Run

```bash
cp .env.example .env
docker compose up -d
npm install
npm run migrate
npm install --prefix web
npm run dev:all
```

- API: http://localhost:3000/health
- Web: **http://localhost:5173** (open this URL — the site is the Vite app, not port 3000)

Postgres is mapped to **55432** so it does not collide with a local Postgres already using 5432.

## Pages

**Public:** `/` landing · `/pricing` · `/login` · `/signup` · `/forgot-password` · `/reset-password`

**App:** `/app` dashboard · `/app/properties` · `/app/tenants` · `/app/rent` · `/app/settings`

## API `/api/v1`

Auth header: `Authorization: Bearer <token>`

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register` `login` `forgot-password` `reset-password` · `GET/PATCH /me` |
| Dashboard | `GET /dashboard` |
| Portfolio | CRUD `/properties` `/tenants` |
| Rent | CRUD `/payments` · `POST /payments/:id/mark-paid` · `POST /payments/:id/receipt` |
| Receipts | `GET /receipts` · `GET /receipts/:id/pdf` |
| Legal | `GET /legal/countries` (public) · `GET /legal/countries/:code` |
| AI | `POST /legal/ai/propose` · `GET /legal/ai/drafts` · `POST /legal/ai/drafts/:id/apply` |
| Billing | `GET /billing/plans` · `GET /billing/me` · `POST /billing/checkout` · `POST /billing/mock-subscribe` |
| Superadmin | `GET /admin/stats` · `GET /admin/users` · `PATCH /admin/users/:id` (admin JWT only) |

Plans: **Starter** (2 units) · **Investor** (8, AI drafts) · **Pro** (unlimited).

First Superadmin: set `BOOTSTRAP_ADMIN_EMAIL` to your account email, restart the API, then log in. Open http://localhost:5173/superadmin.

Plans: **Starter** (2 units) · **Investor** (8, AI drafts) · **Pro** (unlimited).

Receipts fail closed if the active country profile is missing required fields. Historical PDFs keep `legal_snapshot`.
