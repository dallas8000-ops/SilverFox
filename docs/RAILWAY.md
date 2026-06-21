# SilverFox — Railway go-live

Railway **does not** auto-create Django variables or a public URL. You only get system vars (`RAILWAY_*`) until you add the rest.

## 0. Generate a public URL (required)

If the SilverFox service shows **no domain** or the portfolio link returns **404**:

1. Open the **SilverFox web service** (not Postgres)
2. **Settings** → **Networking** → **Public Networking**
3. Click **Generate Domain**
4. Copy the hostname Railway assigns (e.g. `silverfox-production.up.railway.app`)
5. Update [`deploy.config.json`](../deploy.config.json) and your portfolio demo URL if it differs

Without this step, the service has **no URL** even after a successful deploy.

## 1. Project layout

| Service | Purpose |
|---------|---------|
| **SilverFox** | Web — GitHub repo `dallas8000-ops/SilverFox` |
| **Postgres** | Database — add via **+ New → Database → PostgreSQL** |

## 2. Link Postgres to SilverFox

On the **SilverFox** service → **Variables** → **Raw Editor**, paste from [`railway.env.example`](../railway.env.example).

**Minimum required:**

| Variable | How to set |
|----------|------------|
| `DJANGO_SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | `False` |
| `DATABASE_URL` | **Variable reference** → your Postgres service → `DATABASE_URL` |

In Raw Editor, a Postgres reference looks like:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Use your Postgres service’s exact name if Railway named it differently (e.g. `PostgreSQL`).

## 3. Do not set

- `PORT` — Railway sets this automatically
- Duplicate `DATABASE_URL` lines

## 4. Build settings (SilverFox service → Settings)

- **Builder:** Dockerfile (from `railway.toml`)
- **Custom start command:** leave **empty** (uses `scripts/docker-start.sh`)
- **Health check path:** `/health/`

## 5. Deploy

Push to `main` or click **Deploy** on the latest commit.

Good runtime log:

```text
[silverfox] migrate...
[silverfox] gunicorn on 0.0.0.0:8080
```

## 6. Verify

```text
https://<your-service>.up.railway.app/health/
→ {"status":"ok","service":"silverfox"}
```

Shop: `https://<your-service>.up.railway.app/shop/`

Staff: `/staff/login/` — default `admin` / `admin` (change after first login).

## 7. Deployment & Stripe Automation Center

In the automation hub, for project **silverfox**:

1. Set **local path** to this repo
2. **Vault → DATABASE_URL** — same Postgres URL as Railway (for readiness score)
3. **Run generate-infra** — creates `db/schema.sql`, backup scripts, etc.
4. Store Stripe keys in vault when checkout is enabled

SilverFox is **stripe exempt** on the portfolio until Stripe checkout ships.

## 8. Public URL on portfolio

Update [`deploy.config.json`](../deploy.config.json) and FrontlineDigital `portfolioLiveUrls.silverfox` if Railway assigns a hostname other than `silverfox-production.up.railway.app`.
