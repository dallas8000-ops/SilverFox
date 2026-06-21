"""Django settings for SilverFox — Kistie-style men's fashion storefront."""
import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BASE_DIR.parent

IS_RAILWAY = bool(
    os.environ.get('RAILWAY_ENVIRONMENT')
    or os.environ.get('RAILWAY_PROJECT_ID')
    or os.environ.get('RAILWAY_PUBLIC_DOMAIN')
)

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-only-change-in-production')
_debug_raw = os.environ.get('DEBUG', '')
if _debug_raw:
    DEBUG = _debug_raw.lower() in ('1', 'true', 'yes')
else:
    DEBUG = not IS_RAILWAY
ENABLE_ADMIN = os.environ.get('DJANGO_ENABLE_ADMIN', 'true').lower() in ('1', 'true', 'yes')

if IS_RAILWAY and not DEBUG and SECRET_KEY in ('', 'dev-only-change-in-production', 'change-me-in-production'):
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured(
        'Set DJANGO_SECRET_KEY on the SilverFox Railway service (Variables → Raw Editor). '
        'See docs/RAILWAY.md and railway.env.example in the repo root.'
    )

allowed_hosts_raw = os.environ.get('ALLOWED_HOSTS', '127.0.0.1,localhost')
ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_raw.replace(',', ' ').split() if h.strip()]

if IS_RAILWAY:
    for railway_host in ('.railway.app', '.up.railway.app', 'healthcheck.railway.app'):
        if railway_host not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(railway_host)

railway_public_domain = os.environ.get('RAILWAY_PUBLIC_DOMAIN', '').strip()
if railway_public_domain and railway_public_domain not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(railway_public_domain)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'inventory',
    'cart',
    'pages',
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'core.context_processors.site_context',
            ],
        },
    },
]

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Kampala'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'core' / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/account/orders/'
LOGOUT_REDIRECT_URL = '/shop/'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
}

CSRF_TRUSTED_ORIGINS = []
if railway_public_domain:
    CSRF_TRUSTED_ORIGINS.append(f'https://{railway_public_domain}')
for origin in os.environ.get('CSRF_TRUSTED_ORIGINS', '').replace(',', ' ').split():
    origin = origin.strip()
    if origin and origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(origin)
if DEBUG:
    CSRF_TRUSTED_ORIGINS += [
        'http://127.0.0.1:8000',
        'http://localhost:8000',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ]

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # Railway health probes hit http:// internally without X-Forwarded-Proto — avoid 301 on /health/.
    _ssl_default = 'false' if IS_RAILWAY else 'true'
    SECURE_SSL_REDIRECT = os.environ.get('DJANGO_SSL_REDIRECT', _ssl_default).lower() in (
        '1', 'true', 'yes',
    )

EMAIL_BACKEND = os.environ.get(
    'DJANGO_EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend',
)
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'true').lower() in ('1', 'true', 'yes')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DJANGO_DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'info@silverfox.com')
CONTACT_RECIPIENT_EMAIL = os.environ.get('CONTACT_RECIPIENT_EMAIL', EMAIL_HOST_USER)

UGX_RATE = float(os.environ.get('PRICE_UGX_RATE', '3700'))
KES_RATE = float(os.environ.get('PRICE_KES_RATE', '140'))

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')

# Legacy React images path (for seed command)
LEGACY_IMAGES_DIR = REPO_ROOT / 'silverfox-ecommerce' / 'React' / 'public' / 'images'
