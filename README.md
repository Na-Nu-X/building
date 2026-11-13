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
  apps/core/         shared: site settings, company stats, certifications
  apps/services/     Service + feature list
  apps/portfolio/    ProjectCategory, Project, ProjectImage
  apps/inquiries/    Inquiry (contact form) + email notification
frontend/
  src/app/core/      API services, models, interceptors
  src/app/layout/    header, footer
  src/app/sections/  hero, services, portfolio, about, contact
  src/app/shared/    UI components (lightbox, button, section header…)
  src/styles/        design tokens, mixins, typography (@use modules)
```

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

## Development

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
