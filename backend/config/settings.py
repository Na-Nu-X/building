"""Django settings. All environment-specific values come from `.env`."""

import os
from pathlib import Path

import dj_database_url
from django.urls import reverse_lazy
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


# --- Core -------------------------------------------------------------------

DEBUG = env_bool("DJANGO_DEBUG", False)
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "")
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set when DEBUG is off.")
    SECRET_KEY = "dev-only-insecure-key"

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")

INSTALLED_APPS = [
    # Unfold must come before django.contrib.admin.
    "unfold",
    "unfold.contrib.filters",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "corsheaders",
    # Local
    "apps.core",
    "apps.services",
    "apps.portfolio",
    "apps.inquiries",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --- Database ---------------------------------------------------------------

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Localization -----------------------------------------------------------

LANGUAGE_CODE = "sk"
LANGUAGES = [("sk", "Slovenčina")]
TIME_ZONE = "Europe/Bratislava"
USE_I18N = True
USE_TZ = True
LOCALE_PATHS = [BASE_DIR / "locale"]

# --- Static & media ---------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", BASE_DIR / "media"))

# Uploaded images larger than this are rejected (bytes).
MAX_UPLOAD_IMAGE_SIZE = 15 * 1024 * 1024
DATA_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_IMAGE_SIZE

# --- REST framework ---------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"]
    + (["rest_framework.renderers.BrowsableAPIRenderer"] if DEBUG else []),
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_THROTTLE_RATES": {
        "inquiries": os.getenv("INQUIRY_THROTTLE_RATE", "10/hour"),
    },
    "UNAUTHENTICATED_USER": None,
    "COERCE_DECIMAL_TO_STRING": False,
    # Number of reverse proxies in front of Django (for correct client IPs).
    "NUM_PROXIES": int(os.getenv("NUM_PROXIES", "0")) or None,
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "default",
    }
}

# --- CORS -------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:4200")
CORS_URLS_REGEX = r"^/api/.*$"

# --- Email ------------------------------------------------------------------

MAILERS = {
    "default": {
        "BACKEND": os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"),
        "OPTIONS": {
            key: value
            for key, value in {
                "host": os.getenv("EMAIL_HOST"),
                "port": int(os.getenv("EMAIL_PORT", "0")) or None,
                "username": os.getenv("EMAIL_HOST_USER"),
                "password": os.getenv("EMAIL_HOST_PASSWORD"),
                "use_tls": env_bool("EMAIL_USE_TLS") or None,
                "use_ssl": env_bool("EMAIL_USE_SSL") or None,
            }.items()
            if value is not None
        },
    },
}
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "web@localhost")
SERVER_EMAIL = DEFAULT_FROM_EMAIL
INQUIRY_NOTIFY_EMAILS = env_list("INQUIRY_NOTIFY_EMAIL")

# --- Admin (Unfold) --------------------------------------------------------

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:4200")
# Logging in directly at /admin/login/ (without ?next=) should land on the dashboard.
LOGIN_URL = "admin:login"
LOGIN_REDIRECT_URL = "admin:index"


def _nav(title: str, icon: str, url_name: str, **extra) -> dict:
    return {"title": title, "icon": icon, "link": reverse_lazy(url_name), **extra}


UNFOLD = {
    "SITE_TITLE": "Administrácia",
    "SITE_HEADER": os.getenv("ADMIN_SITE_HEADER", "Stavebná firma"),
    "SITE_SUBHEADER": "Správa webu a dopytov",
    "SITE_SYMBOL": "construction",
    "SITE_URL": FRONTEND_URL,
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": False,
    "BORDER_RADIUS": "6px",
    "ENVIRONMENT": "apps.core.dashboard.environment_callback",
    "DASHBOARD_CALLBACK": "apps.core.dashboard.dashboard_callback",
    "COLORS": {
        # Tailwind "orange" – matches the website accent.
        "primary": {
            "50": "oklch(98% .016 73.684)",
            "100": "oklch(95.4% .038 75.164)",
            "200": "oklch(90.1% .076 70.697)",
            "300": "oklch(83.7% .128 66.29)",
            "400": "oklch(75% .183 55.934)",
            "500": "oklch(70.5% .213 47.604)",
            "600": "oklch(64.6% .222 41.116)",
            "700": "oklch(55.3% .195 38.402)",
            "800": "oklch(47% .157 37.304)",
            "900": "oklch(40.8% .123 38.172)",
            "950": "oklch(26.6% .079 36.259)",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Prehľad",
                "items": [_nav("Nástenka", "dashboard", "admin:index")],
            },
            {
                "title": "Dopyty",
                "items": [
                    _nav(
                        "Dopyty zákazníkov",
                        "mail",
                        "admin:inquiries_inquiry_changelist",
                        badge="apps.inquiries.admin.new_inquiries_badge",
                    ),
                ],
            },
            {
                "title": "Obsah webu",
                "collapsible": False,
                "items": [
                    _nav("Služby", "handyman", "admin:services_service_changelist"),
                    _nav("Projekty", "photo_library", "admin:portfolio_project_changelist"),
                    _nav("Kategórie projektov", "category", "admin:portfolio_projectcategory_changelist"),
                ],
            },
            {
                "title": "O nás",
                "collapsible": True,
                "items": [
                    _nav("Štatistiky", "bar_chart", "admin:core_stat_changelist"),
                    _nav("Záruky kvality", "verified", "admin:core_guarantee_changelist"),
                    _nav("Certifikáty", "workspace_premium", "admin:core_certification_changelist"),
                    _nav("Tím", "groups", "admin:core_teammember_changelist"),
                ],
            },
            {
                "title": "Používatelia",
                "collapsible": True,
                "items": [
                    _nav("Používatelia", "person", "admin:auth_user_changelist"),
                    _nav("Skupiny", "shield_person", "admin:auth_group_changelist"),
                ],
            },
        ],
    },
}

# --- Security (production) --------------------------------------------------

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.getenv("DJANGO_HSTS_SECONDS", "0"))
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {"apps": {"handlers": ["console"], "level": "INFO"}},
}
