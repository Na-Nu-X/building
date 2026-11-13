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

## Development

```bash
# backend
cd backend && python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
python manage.py migrate && python manage.py runserver

# frontend
cd frontend && npm install && npm start   # http://localhost:4200, proxies /api to :8000
```

> `frontend/.npmrc` sets `legacy-peer-deps=true` to work around an npm 10 peer-resolution crash.
