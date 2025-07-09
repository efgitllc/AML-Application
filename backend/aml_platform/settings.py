"""
Django settings for AML Platform project.

This file contains all settings for the project, organized by environment and functionality.
Settings are loaded based on the DJANGO_ENV environment variable.
"""
import os
from pathlib import Path
from datetime import timedelta

import environ

# Initialize environment variables
env = environ.Env(
    DJANGO_ENV=(str, "development"),
    DEBUG=(bool, False),
    SECRET_KEY=(str, "your-secret-key-here"),
    ALLOWED_HOSTS=(list, ["*"]),
    DATABASE_URL=(str, "sqlite:///db.sqlite3"),
    REDIS_URL=(str, "redis://localhost:6379/0"),
    AWS_ACCESS_KEY_ID=(str, None),
    AWS_SECRET_ACCESS_KEY=(str, None),
    AWS_STORAGE_BUCKET_NAME=(str, None),
    AWS_S3_REGION_NAME=(str, None),
    DJANGO_SENTRY_DSN=(str, None),
    # UAE Pass Configuration
    UAE_PASS_CLIENT_ID=(str, None),
    UAE_PASS_CLIENT_SECRET=(str, None),
    UAE_PASS_ENVIRONMENT=(str, "staging"),
    UAE_PASS_SCOPE=(str, "urn:uae:digitalid:profile"),
    UAE_PASS_ACR_VALUES=(str, "urn:safelayer:tws:policies:authentication:level:low"),
)

# Read .env file if it exists
environ.Env.read_env()

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

# Environment
ENV_NAME = env("DJANGO_ENV")
DEBUG = env("DEBUG")
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env("ALLOWED_HOSTS")

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "django_celery_beat",
    "channels",
    "axes",
    "auditlog",
]

LOCAL_APPS = [
    "core.apps.CoreConfig",
    "users_authentication.apps.UsersAuthenticationConfig",  # Temporarily disabled due to User model conflicts
    "customer_management.apps.CustomerManagementConfig",
    "transaction_monitoring.apps.TransactionMonitoringConfig",
    "document_verification.apps.DocumentVerificationConfig",
    "screening_watchlist.apps.ScreeningWatchlistConfig",
    "case_management.apps.CaseManagementConfig",
    "risk_scoring.apps.RiskScoringConfig",
    "alert_notification.apps.AlertNotificationConfig",
    "reporting_analytics.apps.ReportingAnalyticsConfig",
    "integration_api.apps.IntegrationApiConfig",
    "workflow_automation.apps.WorkflowAutomationConfig",
    "data_management.apps.DataManagementConfig",
    "training_simulation.apps.TrainingSimulationConfig",
    "ui_dashboard.apps.UiDashboardConfig",
    "audit_logging.apps.AuditLoggingConfig",
    "security_encryption.apps.SecurityEncryptionConfig",
    "fraud_detection.apps.FraudDetectionConfig",
    "system_architecture.apps.SystemArchitectureConfig",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "axes.middleware.AxesMiddleware",
    "auditlog.middleware.AuditlogMiddleware",
]

ROOT_URLCONF = "aml_platform.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "aml_platform.wsgi.application"
ASGI_APPLICATION = "aml_platform.asgi.application"

# Database
DATABASES = {
    "default": env.db(),
}

# Cache
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env("REDIS_URL"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesBackend',  # AxesBackend before ModelBackend
    'django.contrib.auth.backends.ModelBackend',
]

# Custom User Model
AUTH_USER_MODEL = 'users_authentication.User'

# Authentication
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = []

# Media files
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [] if not DEBUG else [
    "http://localhost:3000",
    "http://localhost:5173",  # Default Vite port
    "http://127.0.0.1:5173",  # Alternative localhost
]

# Channels
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [env("REDIS_URL")],
        },
    },
}

# Celery
CELERY_BROKER_URL = env("REDIS_URL")
CELERY_RESULT_BACKEND = env("REDIS_URL")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

# API Documentation
SPECTACULAR_SETTINGS = {
    "TITLE": "AML Platform API",
    "DESCRIPTION": "API documentation for AML Platform",
    "VERSION": "1.0.0",
}

# AML-specific settings
AML_SETTINGS = {
    'HIGH_RISK_THRESHOLD': 75,
    'MEDIUM_RISK_THRESHOLD': 50,
    'STR_THRESHOLD_AED': 40000,  # Suspicious Transaction Reporting threshold in AED
    'CTR_THRESHOLD_AED': 20000,  # Cash Transaction Reporting threshold in AED
    'WATCHLIST_CHECK_ENABLED': True,
    'AUTO_CASE_CREATION': True,
    'RISK_SCORING_ENABLED': True,
}

# Feature flags
FEATURES = {
    "ENABLE_DEBUG_TOOLBAR": False,
    "ENABLE_API_DOCUMENTATION": True,
    "ENABLE_SWAGGER_UI": True,
}

# UAE Pass Configuration
UAE_PASS = {
    "CLIENT_ID": env("UAE_PASS_CLIENT_ID"),
    "CLIENT_SECRET": env("UAE_PASS_CLIENT_SECRET"),
    "ENVIRONMENT": env("UAE_PASS_ENVIRONMENT"),
    "SCOPE": env("UAE_PASS_SCOPE"),
    "ACR_VALUES": env("UAE_PASS_ACR_VALUES"),
}

# UAE Pass Environment-specific URLs
if UAE_PASS["ENVIRONMENT"] == "production":
    UAE_PASS.update({
        "AUTHORIZATION_ENDPOINT": "https://id.uaepass.ae/idshub/authorize",
        "TOKEN_ENDPOINT": "https://id.uaepass.ae/idshub/token",
        "USERINFO_ENDPOINT": "https://id.uaepass.ae/idshub/userinfo",
        "LOGOUT_ENDPOINT": "https://id.uaepass.ae/idshub/logout",
        "REDIRECT_URL": "https://your-production-domain.com/api/auth/uaepass/callback/",
        "REDIRECT_URI": "https://your-production-domain.com/api/auth/uaepass/callback/",
    })
elif UAE_PASS["ENVIRONMENT"] == "staging":
    UAE_PASS.update({
        "AUTHORIZATION_ENDPOINT": "https://stg-id.uaepass.ae/idshub/authorize",
        "TOKEN_ENDPOINT": "https://stg-id.uaepass.ae/idshub/token",
        "USERINFO_ENDPOINT": "https://stg-id.uaepass.ae/idshub/userinfo",
        "LOGOUT_ENDPOINT": "https://stg-id.uaepass.ae/idshub/logout",
        "REDIRECT_URL": "https://your-staging-domain.com/api/auth/uaepass/callback/",
        "REDIRECT_URI": "https://your-staging-domain.com/api/auth/uaepass/callback/",
    })
else:  # development/qa
    UAE_PASS.update({
        "AUTHORIZATION_ENDPOINT": "https://qa-id.uaepass.ae/idshub/authorize",
        "TOKEN_ENDPOINT": "https://qa-id.uaepass.ae/idshub/token",
        "USERINFO_ENDPOINT": "https://qa-id.uaepass.ae/idshub/userinfo",
        "LOGOUT_ENDPOINT": "https://qa-id.uaepass.ae/idshub/logout",
        "REDIRECT_URL": "http://localhost:8000/api/auth/uaepass/callback/",
        "REDIRECT_URI": "http://localhost:8000/api/auth/uaepass/callback/",
    })

# Additional UAE Pass settings for compatibility
UAE_PASS_CONFIG = UAE_PASS.copy()
UAE_PASS_CONFIG.update({
    "RESPONSE_TYPE": "code",
})

# UAE Pass Authentication settings  
UAE_PASS_AUTH = {
    "STATE_KEY_PREFIX": "uae_pass_state_",
    "STATE_TIMEOUT": timedelta(minutes=10),
    "TOKEN_EXPIRY": timedelta(hours=24),
}

# Frontend URL for redirects
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

# Individual UAE Pass settings for backward compatibility
UAE_PASS_CLIENT_ID = UAE_PASS["CLIENT_ID"]
UAE_PASS_CLIENT_SECRET = UAE_PASS["CLIENT_SECRET"]
UAE_PASS_BASE_URL = UAE_PASS["AUTHORIZATION_ENDPOINT"].replace("/authorize", "")
UAE_PASS_REDIRECT_URI = UAE_PASS["REDIRECT_URI"]
UAE_PASS_SCOPE = UAE_PASS["SCOPE"]

# AML Transaction Monitoring Settings
AML_STRUCTURING_THRESHOLD = env("AML_STRUCTURING_THRESHOLD", default=10000)  # AED
AML_RAPID_MOVEMENT_THRESHOLD = env("AML_RAPID_MOVEMENT_THRESHOLD", default=5)  # Number of transactions

# goAML Configuration
GOAML_BASE_URL = env("GOAML_BASE_URL", default="https://goaml-api.example.com")
GOAML_ORG_ID = env("GOAML_ORG_ID", default=None)
GOAML_USERNAME = env("GOAML_USERNAME", default=None)
GOAML_PASSWORD = env("GOAML_PASSWORD", default=None)

# OCR and Document Processing Settings
TESSERACT_CMD_PATH = env("TESSERACT_CMD_PATH", default="/usr/bin/tesseract")

# Biometric Verification Settings
FACE_RECOGNITION_TOLERANCE = env("FACE_RECOGNITION_TOLERANCE", default=0.6)
LIVENESS_DETECTION_THRESHOLD = env("LIVENESS_DETECTION_THRESHOLD", default=0.85)

# =============================================================================
# ENVIRONMENT-SPECIFIC SETTINGS
# =============================================================================

if ENV_NAME == "production":
    # Production settings
    DEBUG = False
    
    # Security settings
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Static files
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
    
    # Media files (S3)
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    AWS_DEFAULT_ACL = "private"
    AWS_QUERYSTRING_AUTH = True
    AWS_S3_FILE_OVERWRITE = False
    AWS_S3_SIGNATURE_VERSION = "s3v4"
    AWS_S3_VERIFY = True
    
    # Email configuration
    EMAIL_TIMEOUT = 5
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    
    # Sentry configuration
    if env("DJANGO_SENTRY_DSN"):
        try:
            import sentry_sdk
            from sentry_sdk.integrations.django import DjangoIntegration
            from sentry_sdk.integrations.redis import RedisIntegration
            from sentry_sdk.integrations.celery import CeleryIntegration
            
            sentry_sdk.init(
                dsn=env("DJANGO_SENTRY_DSN"),
                integrations=[
                    DjangoIntegration(),
                    RedisIntegration(),
                    CeleryIntegration(),
                ],
                traces_sample_rate=1.0,
                send_default_pii=True,
                environment=ENV_NAME,
            )
        except ImportError:
            pass
    
    # Cache configuration
    CACHES["default"]["OPTIONS"] = {
        "CLIENT_CLASS": "django_redis.client.DefaultClient",
        "SOCKET_CONNECT_TIMEOUT": 5,
        "SOCKET_TIMEOUT": 5,
        "RETRY_ON_TIMEOUT": True,
        "MAX_CONNECTIONS": 1000,
        "CONNECTION_POOL_CLASS": "redis.connection.BlockingConnectionPool",
        "CONNECTION_POOL_CLASS_KWARGS": {
            "max_connections": 50,
            "timeout": 20,
        },
    }
    
    # Additional middleware for production
    MIDDLEWARE += [
        "whitenoise.middleware.WhiteNoiseMiddleware",
    ]
    
    # Production-specific feature flags
    FEATURES.update({
        "ENABLE_DEBUG_TOOLBAR": False,
        "ENABLE_API_DOCUMENTATION": False,
        "ENABLE_SWAGGER_UI": False,
    })
    
    # Production UAE Pass settings
    UAE_PASS.update({
        "ENVIRONMENT": "production",
        "REDIRECT_URL": env("UAE_PASS_REDIRECT_URL", default="https://your-production-domain.com/api/auth/uaepass/callback/"),
        "PKI_PRIVATE_KEY": env("UAE_PASS_PKI_PRIVATE_KEY", default=None),
        "PKI_CERT_FILE": env("UAE_PASS_PKI_CERT_FILE", default=None),
    })

elif ENV_NAME == "staging":
    # Staging settings (similar to production but less strict)
    DEBUG = False
    
    # Security settings
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Email configuration
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    
    # Staging UAE Pass settings
    UAE_PASS.update({
        "ENVIRONMENT": "staging",
        "REDIRECT_URL": env("UAE_PASS_REDIRECT_URL", default="https://your-staging-domain.com/api/auth/uaepass/callback/"),
    })

else:
    # Development settings
    DEBUG = True
    
    # Email configuration
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    
    # Django Debug Toolbar
    if DEBUG:
        try:
            import debug_toolbar
            INSTALLED_APPS += ["debug_toolbar"]
            MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]
            INTERNAL_IPS = ["127.0.0.1"]
        except ImportError:
            pass
    
    # Development-specific JWT settings
    SIMPLE_JWT.update({
        "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
        "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    })
    
    # Development-specific feature flags
    FEATURES.update({
        "ENABLE_DEBUG_TOOLBAR": True,
        "ENABLE_API_DOCUMENTATION": True,
        "ENABLE_SWAGGER_UI": True,
    })
    
    # Disable password validation in development
    AUTH_PASSWORD_VALIDATORS = []
    
    # Allow all CORS origins in development
    CORS_ALLOW_ALL_ORIGINS = True
    
    # Disable HTTPS requirements
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    
    # Development UAE Pass settings
    UAE_PASS.update({
        "ENVIRONMENT": "qa",
        "REDIRECT_URL": "http://localhost:8000/api/auth/uaepass/callback/",
        "PKI_PRIVATE_KEY": None,
        "PKI_CERT_FILE": None,
    })
    
    # Simple logging for development
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
            },
        },
        "root": {
            "handlers": ["console"],
            "level": "INFO",
        },
        "loggers": {
            "django": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "django.db.backends": {
                "handlers": ["console"],
                "level": "DEBUG",
                "propagate": False,
            },
        },
    } 