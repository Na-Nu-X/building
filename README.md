# Stavebná firma – web template

A rebrandable commercial website for local construction and renovation businesses.

| Layer    | Stack                                                                 |
|----------|-----------------------------------------------------------------------|
| Frontend | Angular 22 (standalone, signals, zoneless), SCSS modules (`@use`), strict TS |
| Backend  | Django 6.1, Django REST Framework 3.18, Unfold admin (Slovak)          |
| Branding | `frontend/src/app/site.config.ts`, the single file to edit per client |

## Structure

```
backend/
  config/            Django settings, root urls, wsgi/asgi
  apps/core/         shared base models, image pipeline, About content, admin dashboard
  locale/sk/         Slovak strings for the Unfold admin (compile: python scripts/compile_messages.py)
  templates/admin/   custom admin dashboard
  apps/services/     Service + feature list
  apps/portfolio/    ProjectCategory, Project, ProjectImage
  apps/inquiries/    Inquiry (contact form) + email notification
frontend/
  src/app/core/      API client, models, stores, utilities (contact links, opening hours)
  src/app/layout/    header, footer
  src/app/sections/  hero, services, portfolio, about, contact
  src/app/shared/    UI building blocks (icon, lightbox, map, reveal, count-up, section heading)
  src/styles/        design tokens, mixins, typography (@use modules)
```

## Quick start (Docker)

The fastest way to see the finished site, with no Python or Node needed locally:

```bash
docker compose up --build -d
```

| What | URL |
|------|-----|
| Website | http://localhost:8080 |
| Admin | http://localhost:8080/admin/ (demo login `admin` / `admin`) |
| Emails | printed to the log: `docker compose logs -f backend` |

The stack has three containers: **db** (PostgreSQL 17), **backend** (Django + gunicorn) and **web**
(nginx serving the Angular build). nginx forwards `/api`, `/admin` and `/static` to Django and serves
uploaded `/media` directly. On start the backend runs migrations, loads demo content (`SEED_DEMO=1`) and
creates the first admin account. Data persists in the `pgdata` and `media` volumes.

```bash
docker compose logs -f              # follow all logs
docker compose down                 # stop (data is kept)
docker compose down -v              # stop and DELETE database + uploads
docker compose up --build -d        # rebuild after code changes
```

**Configuration:** every setting has a demo default. For a real deployment run `cp .env.docker.example .env`
and set at least `DJANGO_SECRET_KEY`, `DJANGO_SUPERUSER_PASSWORD`, `POSTGRES_PASSWORD`, `DJANGO_ALLOWED_HOSTS`,
`CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, the SMTP settings, and `SEED_DEMO=0`. Behind TLS (e.g. Caddy, Traefik or a
host nginx with Let's Encrypt in front of port 8080) set `DJANGO_HTTPS=True`.

## Rebranding for a new client

1. **`frontend/src/app/site.config.ts`**: company name, legal IDs (IČO/DIČ), tagline, contact details,
   opening hours and time zone, map coordinates, social links, hero texts and SEO texts.
2. **Colours** (optional): `frontend/src/styles/_tokens.scss` (`$brand` map); admin accent: `UNFOLD.COLORS` in `backend/config/settings.py`.
3. **Hero photo** (optional): put it in `frontend/public/images/` and set `hero.backgroundImage`; `null` keeps the blueprint illustration.
4. **`backend/.env`**: `ADMIN_SITE_HEADER`, `FRONTEND_URL`, SMTP settings and `INQUIRY_NOTIFY_EMAIL` (who receives new inquiries).
5. **Content** (services, projects and photos, stats, guarantees, certificates, team) is managed in the admin at `/admin/`.

### Map tiles

The map uses free OpenStreetMap tiles darkened with a CSS filter, so it needs no API key or account.
OSM's tile servers are meant for light use. For a high-traffic site, switch `map.tiles` in `site.config.ts`
to a natively dark keyed provider; ready-made entries for MapTiler and Stadia Maps are in `MAP_TILES_EXAMPLES`.

## Admin

Django admin themed with [Unfold](https://unfoldadmin.com/), in Slovak:

- Dashboard with new inquiries, a 30-day count and the latest inquiries.
- Sidebar badge with the number of unprocessed inquiries.
- Inquiry workflow: Nová → Rieši sa → Odoslaná ponuka → Uzavretá / Spam, with bulk actions and an internal note.
  Inquiries come only from the website form; the customer's fields are read-only.
- Drag-and-drop ordering of services, features, projects, photos, categories and About content.
- Photo uploads generate WebP thumbnails (800px) and large versions (2000px) automatically.

## API (`/api/`)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `services/`, `services/<slug>/` | Published services with feature lists and `price_from` |
| GET | `portfolio/categories/` | Only categories with published projects, includes `project_count` |
| GET | `portfolio/projects/?category=<slug>&featured=1` | Projects with cover and gallery (thumb 800px / large 2000px WebP) |
| GET | `portfolio/projects/<slug>/` | Single project |
| GET | `about/` | Stats, guarantees, certifications and team in one request |
| POST | `inquiries/` | Contact form: honeypot field `website`, throttled (`INQUIRY_THROTTLE_RATE`), email notification |

Validation limits for the inquiry form live in `backend/apps/inquiries/constants.py` and are
mirrored in `frontend/src/app/core/models/api.models.ts` (`INQUIRY_LIMITS`).

## Development (without Docker)

```bash
# backend
cd backend && python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
python manage.py migrate
python manage.py seed_demo          # optional: demo content + placeholder photos
python manage.py createsuperuser    # admin at http://localhost:8000/admin/
python manage.py runserver
python manage.py test apps          # backend tests

# frontend
cd frontend && npm install && npm start   # http://localhost:4200, proxies /api and /media to :8000
API_PROXY_TARGET=http://localhost:8001 npm start   # if Django runs on another port
npm test                                  # frontend unit tests (Vitest)
```

> `frontend/.npmrc` sets `legacy-peer-deps=true` to work around an npm 10 peer-resolution crash.
