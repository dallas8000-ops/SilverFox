# SilverFox

[![CI](https://github.com/dallas8000-ops/SilverFox/actions/workflows/ci.yml/badge.svg)](https://github.com/dallas8000-ops/SilverFox/actions/workflows/ci.yml)

**Men's fashion ecommerce** — shipping from **Kampala**, serving customers worldwide.

Production **Django 5.2** storefront + staff tooling + **DRF** API on **Railway** / PostgreSQL (SQLite locally), matching the [Kistie Store](https://github.com/dallas8000-ops/Kistie-Store) architecture — built for gentlemen, not women's apparel.

| | |
|---|---|
| **Stack** | Django 5.2 · DRF · PostgreSQL · Gunicorn · WhiteNoise · Bootstrap 5 |
| **Catalog** | 128 products — 16 per category (8 men's categories) |
| **Legacy** | `silverfox-ecommerce/` React prototype — **not production** |

> **Kistie Store is untouched.** SilverFox mirrors its layout and shop flow in this repo only.

---

## Run locally

From the **repository root**:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt

cd backend
cp .env.example .env   # set DJANGO_SECRET_KEY

python manage.py migrate
python manage.py ensure_admin      # admin / admin
python manage.py seed_mens_catalog # 128 men's products + images
python manage.py runserver
```

Open **http://127.0.0.1:8000/** → redirects to `/shop/`

### Windows (recommended)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-local.ps1
```

---

## Pages (Kistie-style)

| Page | URL |
|------|-----|
| Shop | `/shop/` |
| Cart → Checkout | `/cart/` → `/checkout/` |
| Sign up / Sign in | `/signup/` `/login/` |
| Order history | `/account/orders/` |
| Staff dashboard | `/staff/dashboard/` |
| Staff login | `/staff/login/` (admin / admin) |
| Django admin | `/admin/` |
| Health | `/health/` |

Legacy redirects: `/catalog/` and `/inventory/` → `/shop/`

---

## Repository layout

```
SilverFox/
├── requirements.txt       # Python deps (install from repo root)
├── backend/               # Django project (production storefront)
│   ├── manage.py
│   ├── core/              # settings, urls, templates, static
│   ├── inventory/         # products + DRF /api/inventory/
│   ├── cart/              # cart + orders
│   └── pages/             # contact inquiries
├── scripts/start-local.ps1
├── railway.toml           # Railway deploy
└── silverfox-ecommerce/   # LEGACY React/Express — reference only
```

---

## JSON API

| Path | Notes |
|------|-------|
| `GET /api/inventory/products/` | DRF product list |
| `GET /api/inventory/categories/` | Categories |
| `POST /api/chat/` | Shopping assistant |
| `POST /api/size-recommend/` | Size guidance |

---

## Deploy (Railway)

1. Connect repo, add **PostgreSQL** plugin → sets `DATABASE_URL`
2. Set `DJANGO_SECRET_KEY`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`
3. Build runs migrate + seed automatically (`railway.toml`)

---

## Stripe (planned)

Django server-side Checkout + webhooks — same pattern as Kistie payment stubs. Set `STRIPE_SECRET_KEY` when ready.

---

## Seed catalog

```bash
cd backend
python manage.py seed_mens_catalog        # skip if products exist
python manage.py seed_mens_catalog --force  # replace all products
python manage.py sync_catalog             # fix images + live FX rates (run after seed or nightly)
python manage.py sync_catalog --ai        # optional OpenAI integrity audit
```

**Catalog integrity:** Each product image is matched by keyword rules (e.g. sunglasses → aviator image, boots → shoe image). Prices in EUR/USD/UGX/KES are refreshed from live exchange rates. Staff can click **Sync catalog & FX rates** on `/staff/dashboard/`.

---

## Contact

info@silverfox.com
