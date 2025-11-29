"""
Django production settings for personal_budget_manager project.
"""

import os
from pathlib import Path
from .settings import *

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-al1hggzxc*!3+6-b+-o-ux!6&5al7_b7)+@n(0#riih1^8%1*2')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.vercel.app',
    '.now.sh',
    '.onrender.com',
    '.herokuapp.com',
    # Add your custom domain here
]

import dj_database_url

# Database configuration for PostgreSQL (Vercel)
DATABASES = {
    'default': dj_database_url.config(
        default='postgres://user:password@localhost:5432/personal_budget_manager',
        conn_max_age=600
    )
}

# Email Configuration (update with your production email settings)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'budgetmaster2025@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'mrlo pfps uaog pcjo')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# CORS settings for production
# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://production-budget-master-frontend.vercel.app",
    "https://budget-master-app.vercel.app",

]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://production-budget-master-frontend.*\.vercel\.app$",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # Set to False in production

CSRF_TRUSTED_ORIGINS = [
    "https://production-budget-master-frontend.vercel.app",
    "https://production-budget-master-fron-git-b3fc2c-soesh-coorays-projects.vercel.app",
    "https://production-budget-master-frontend-4hm3tvdrp.vercel.app",
    "https://budget-master-app.vercel.app",
]

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles_build')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# HTTPS settings (uncomment when you have SSL)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Djoser / Email Settings
DOMAIN = 'budget-master-app.vercel.app'
SITE_NAME = 'BudgetMaster'

# Whitenoise configuration
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Djoser Configuration
DJOSER = {
    'USER_ID_FIELD': 'id',
    'LOGIN_FIELD': 'email',  # Explicitly set login field to email since that's what we use
    'USER_CREATE_PASSWORD_RETYPE': True,
    'PASSWORD_RESET_CONFIRM_URL': 'reset-password-confirm?uid={uid}&token={token}',
    'USERNAME_RESET_CONFIRM_URL': 'username/reset/confirm/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': False,  # Disabled - users don't need to activate
    'SEND_CONFIRMATION_EMAIL': True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': False,
    'PASSWORD_RESET_CONFIRM_RETYPE': True,
    'PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND': True,  # CRITICAL: Must be True to avoid "User does not exist" error
    'EMAIL': {
        'password_reset': 'accounts.emails.CustomPasswordResetEmail',
        'password_changed_confirmation': 'accounts.emails.CustomPasswordChangedEmail',
    },
    'SERIALIZERS': {
        'user_create': 'accounts.serializers.UserCreateSerializer',
        'user': 'accounts.serializers.UserCreateSerializer',
        'current_user': 'accounts.serializers.CustomUserSerializer',
    },
}