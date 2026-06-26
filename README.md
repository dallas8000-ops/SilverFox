# SilverFox

[![CI](https://github.com/dallas8000-ops/SilverFox/actions/workflows/ci.yml/badge.svg)](https://github.com/dallas8000-ops/SilverFox/actions)

**A production men's fashion storefront — Django 5.2 server-rendered shop, staff operations tooling, and a DRF JSON API, deployed on Railway with PostgreSQL.**

SilverFox is a live e-commerce site for men's apparel and accessories, shipping from Kampala and serving customers worldwide. Shoppers browse a single Shop page, filter by category and price, switch currency (EUR / USD / UGX / KES), view product detail, and add to cart through to checkout. Behind the storefront, staff get a permission-gated dashboard for orders, low-stock alerts, and customer inquiries, plus an audit trail for superusers. A read-only public JSON API (staff-only writes) exposes the catalog for integrations.

The app intentionally mirrors the architecture and shop flow of [Kistie-Store](https://github.com/dallas8000-ops/Kistie-Store) — same Django SSR storefront pattern, same staff tooling, same DRF layer — but is its own independent product built for menswear. Kistie-Store is not modified by this repo.

---

## Live demo

| | |
|---|---|
| **Live site** | _Railway deployment — see [Deploy](#deploy-railway) to stand up your own, or request the current demo URL via the contact below_ |
| **Health check** | `GET /health/` → `{"status": "ok", "service": "silverfox"}` |

> Staff/admin access on the live demo is not published. Demo credentials are available to reviewers on request (see [Contact](#contact)). Local installs use `admin / admin` — see below.

---

## What it does

**For shoppers**
- Single Shop page (`/shop/`) — the only customer-facing browse-and-buy surface. Opening `/` redirects straight there.
- Filter by category (8 men's categories) and price; product quick-view modal; add to cart.
- Multi-currency display (EUR / USD / UGX / KES) with prices refreshed from live exchange rates.
- Cart → checkout with server-side totals, accounts (sign up / sign in), guest-cart merge on login, and order history.
- Optional AI shopping assistant and size recommendation endpoints.

**For staff**
- Staff dashboard (`/staff/dashboard/`) — orders snapshot, low-stock alerts, recent inquiries (permission-gated).
- Superuser audit log.
- One-click **Sync catalog & FX rates** to repair product images and refresh currency conversions.
- Django admin for products, images, orders, and users.

**Catalog:** 128 seeded products — 16 per category across 8 men's categories — each image matched to its product by keyword rules (e.g. sunglasses → aviator image, boots → footwear image).

---

## Tech stack

Python 3.12 · Django 5.2 · Django REST Framework · PostgreSQL (production) / SQLite (local) · Gunicorn · WhiteNoise · Bootstrap 5 · Bootstrap Icons · Railway · GitHub Actions · optional OpenAI / Gemini (AI features, env-gated)

---

## Run locally

From the repository root (where `requirements.txt` lives):

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt

cd backend
cp .env.example .env          # set DJANGO_SECRET_KEY

python manage.py migrate
python manage.py ensure_admin       # creates admin / admin
python manage.py seed_mens_catalog  # 128 men's products + images
python manage.py runserver
# http://127.0.0.1:8000/  →  redirects to /shop/
```

**Windows (recommended):** starts Django, waits for `/health/`, then opens the app.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-local.ps1
```

> For pure local work, leave `DATABASE_URL` unset so Django uses SQLite (`db.sqlite3`). Point it at a Postgres URL only when you want to mirror production locally.

---

## Pages

| Page | URL |
|---|---|
| Shop (only storefront) | `/shop/` |
| Cart → Checkout | `/cart/` → `/checkout/` |
| Sign up / Sign in / Sign out | `/signup/` · `/login/` · `/logout/` |
| Order history | `/account/orders/` |
| Staff login | `/staff/login/` (local: `admin / admin`) |
| Staff dashboard | `/staff/dashboard/` |
| Django admin | `/admin/` |
| Health | `/health/` |

Legacy bookmark redirects: `/catalog/` and `/inventory/` → `/shop/` (query string preserved). These exist only so old links don't 404 — there is no separate catalog screen.

---

## JSON API

Public read, staff-only write. Mounted under `/api/inventory/` as a URL prefix — not a second storefront.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/inventory/products/` | Product list (DRF) |
| `GET` | `/api/inventory/categories/` | Categories |
| `POST` | `/api/chat/` | Shopping assistant (AI; degrades gracefully without a key) |
| `POST` | `/api/size-recommend/` | Size guidance |

---

## Seed & maintain the catalog

Run from `backend/`:

```bash
python manage.py seed_mens_catalog          # seed (skips if products already exist)
python manage.py seed_mens_catalog --force  # wipe and reseed all products
python manage.py sync_catalog               # repair images + refresh live FX rates
python manage.py sync_catalog --ai          # optional: OpenAI catalog-integrity audit
```

Staff can also trigger **Sync catalog & FX rates** from `/staff/dashboard/`.

---

## Deploy (Railway)

Railway does **not** auto-populate Django settings — it only injects its own `RAILWAY_*` system variables. You must set the Django variables yourself and attach a database:

1. Add the **PostgreSQL** plugin → Railway sets `DATABASE_URL` automatically.
2. Add environment variables:
   - `DJANGO_SECRET_KEY` — long random secret
   - `DJANGO_DEBUG=false`
   - `DJANGO_ALLOWED_HOSTS` — your Railway/custom hostname(s)
   - `DJANGO_CSRF_TRUSTED_ORIGINS` — full origins with scheme (e.g. `https://your-app.up.railway.app`)
3. Deploy. After first deploy, run migrations and seed if not handled by your start command.

Step-by-step: **`docs/RAILWAY.md`** · Copy-paste variable template: **`railway.env.example`**

> **Production hardening** (`DEBUG=False`): secure session + CSRF cookies, SSL redirect, `X-Frame-Options: DENY`, and `X-Forwarded-Proto` honored behind Railway's proxy. Optional HSTS via `DJANGO_HSTS_SECONDS`.

---

## Stripe payments — planned

Stripe is **not yet wired**. The intended design follows the same server-side Checkout + webhook pattern used in Kistie-Store's payment stubs (secrets never reach the frontend). When implemented, set `STRIPE_SECRET_KEY` and the webhook endpoint. Until then, treat checkout as order-capture only.

---

## Repository layout

```
SilverFox/
├── requirements.txt        # Python deps — install from repo root
├── backend/                # Django project (the production storefront)
│   ├── manage.py
│   ├── core/               # settings, root urls, templates, static
│   ├── inventory/          # product models + DRF API (/api/inventory/)
│   ├── cart/               # cart + orders
│   └── pages/              # contact inquiries
├── scripts/start-local.ps1 # Windows dev helper (Django first, then app)
├── railway.toml            # Railway deploy config
└── silverfox-ecommerce/    # LEGACY React/Express prototype — reference only, not production
```

The `silverfox-ecommerce/` React/Express prototype is kept for reference and is **not** the production app. The live storefront is the Django project under `backend/`.

---

## CI

`.github/workflows/ci.yml` installs the root `requirements.txt`, then runs `cd backend && python manage.py test` on every push and pull request to `main` (Python 3.12).

---

## Contact

**Barney R. Gilliom** — builds and runs this stack.
dallas8000@gmail.com · [GitHub](https://github.com/dallas8000-ops) · [Portfolio](https://gilliomfrontlinedigital.com)
