#!/bin/sh
# Container start-up: migrate, optionally seed demo content and create the first admin user.
set -e

python manage.py migrate --noinput

if [ "${SEED_DEMO:-0}" = "1" ]; then
  python manage.py seed_demo
fi

# Creates the admin account on first start (reads DJANGO_SUPERUSER_USERNAME / _PASSWORD / _EMAIL).
if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  python manage.py createsuperuser --noinput >/dev/null 2>&1 \
    && echo "Created admin user '${DJANGO_SUPERUSER_USERNAME}'." \
    || echo "Admin user '${DJANGO_SUPERUSER_USERNAME}' already exists."
fi

exec "$@"
