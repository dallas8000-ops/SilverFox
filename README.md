# SilverFox

**CI** · Live men's fashion ecommerce — shipping from **Kampala**, serving customers worldwide.

Production **React + Express** storefront + staff admin on **Railway** / SQLite (PostgreSQL optional), with Vite dev proxy for local work.

| | |
|---|---|
| **Live** | SilverFox on Railway — *(set your Railway URL after deploy)* |
| **Stack** | React 19 · Vite · Express · SQLite · Bootstrap 5 |
| **Planning** | Men's premium fashion — same boutique experience as Kistie Store, built for gentlemen |

---

## Latest update

- **Kistie-style shop flow**: `/` → `/shop/` — single storefront page with filters, EU sizing, currency, quick-view modal, cart → checkout.
- **Men's full wardrobe**: suits, shirts, trousers, knitwear, outerwear, shoes, accessories.
- **AI shopping assistant**: `POST /api/chat/` + floating chatbot on Shop (rule-based; optional OpenAI via env).
- **Size guide**: `POST /api/size-recommend/` in product quick-view.
- **Contact & checkout**: `/contact/`, `/checkout/`, order capture with mobile-money / bank transfer.
- **Railway deploy**: `railway.toml`, health check at `/health/`, production build served from Express.
- **Windows dev**: `scripts/start-local.ps1` — backend first, wait for health, then Vite.

---

## What it does (short)

**Shoppers:** The storefront is one **Shop** page (`/shop/`). Opening `/` sends visitors straight there. Browse with category filters, price range, search, EU/US sizing, multi-currency (EUR/USD/UGX/KES), product quick-view, add to cart, then **Cart → Checkout**.

Payments are confirmed by staff in the real world (boutique + East Africa mobile-money mix); order status is updated in the staff admin panel.

**Operations:** Staff sign-in at `/staff/login/` (inventory admin), product CRUD, order records in SQLite.

**Bookmark compatibility:** `/catalog/` and `/inventory/` redirect to `/shop/` (query string preserved).

---

## Pages & features

| Page | URL | What it does |
|------|-----|--------------|
| Entry | `/` | Redirects to `/shop/` |
| Shop | `/shop/` | Browse, filter, quick-view, add to cart |
| About | `/about/` | Brand story |
| Cart | `/cart/` | Line items, totals |
| Checkout | `/checkout/` | Order capture, payment method, Kampala dispatch |
| Contact | `/contact/` | Inquiry form → database |
| Terms | `/terms/` | Terms of Service |
| Staff | `/staff/login/` | Admin inventory & orders |
| Health | `/health/` | `{"status":"ok","service":"silverfox"}` |

---

## JSON API

| Area | Path | Notes |
|------|------|-------|
| Products | `GET /api/products` | Full catalog |
| Exchange rates | `GET /api/exchange-rates` | EUR base |
| Chat (assistant) | `POST /api/chat/` | Men's fashion shopping assistant |
| Size guide | `POST /api/size-recommend/` | Quick-view sizing |
| Contact | `POST /api/contact/` | Store inquiries |
| Checkout | `POST /api/checkout/` | Place order |
| Payments | `POST /api/payments/initiate` | Mobile money stub (MTN/Airtel/M-Pesa) |
| Admin | `POST /api/login` | Staff session |

---

## Repository layout

```
SilverFox/
├── package.json              # Root scripts (dev, Railway build/start)
├── railway.toml              # Railway deploy config
├── scripts/
│   ├── dev.js                # Concurrent backend + Vite
│   └── start-local.ps1       # Windows: backend first, then Vite
├── start-silverfox.bat       # Windows quick start
└── silverfox-ecommerce/
    ├── backend/              # Express API, SQLite, seed scripts
    │   ├── index.js
    │   ├── seed-mens-clothing.js
    │   └── seed-if-empty.js  # Railway: seed only if DB empty
    └── React/                # Vite + React SPA (production storefront)
        └── src/components/Shop.jsx
```

---

## Run locally

From the repository root:

```bash
npm run install-all
npm run dev
```

Open **http://localhost:5173/shop**

### Recommended (Windows)

```powershell
npm run start:local
```

Starts Django-style: backend → wait for `/health/` → Vite → opens browser.

### Production build (single port)

```bash
npm run build-frontend
npm run start-backend
```

Open **http://localhost:3001/shop** — Express serves the React build + API.

---

## Deploy on Railway

1. Create a new Railway project from this repo.
2. Railway uses `railway.toml`:
   - **Build:** `npm run railway:build` (install deps + Vite build)
   - **Start:** `npm run railway:start` (seed if empty + Express on `PORT`)
   - **Health:** `/health/`
3. Set environment variables in Railway:

| Variable | Purpose |
|----------|---------|
| `SESSION_SECRET` | Express session secret (required in prod) |
| `CORS_ORIGINS` | Your Railway URL, e.g. `https://silverfox.up.railway.app` |
| `OPENAI_API_KEY` | Optional — enables AI chat instead of rule-based replies |
| `OPENAI_MODEL` | Optional (default `gpt-4o-mini`) |
| `MTN_API_KEY` / `AIRTEL_API_KEY` / `MPESA_API_KEY` | Optional — mobile money integration |

4. Deploy — storefront and API share one service URL.

---

## Seed inventory

```bash
cd silverfox-ecommerce/backend
node seed-mens-clothing.js   # Full re-seed (clears products)
node seed-if-empty.js        # Seed only if catalog is empty (Railway)
```

Product images live in `silverfox-ecommerce/React/public/images/`.

---

## Optional: AI settings

Set in Railway or `backend/.env` (never commit secrets):

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI for `/api/chat/` |
| `OPENAI_MODEL` | Model override |

Without keys, the chatbot uses built-in rules for sizing, shipping, and men's categories.

---

## Contact

Questions: **info@silverfox.com**

SilverFox — *Premium Style for the Distinguished Gentleman.*
