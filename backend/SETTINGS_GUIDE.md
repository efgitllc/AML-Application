# AML Platform Settings Guide

## New Settings Structure

The settings have been reorganized for better maintainability:

- `settings.py` - Main settings file with all common configurations
- `settings_dev.py` - Development-specific overrides
- `settings_prod.py` - Production-specific overrides

## Environment Variables

Create a `.env` file in the backend directory with these variables:

```env
# Django Configuration
DJANGO_ENV=development
DEBUG=True
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL: DATABASE_URL=postgres://user:password@localhost:5432/aml_db

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# AWS Configuration (for production)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION_NAME=us-east-1

# UAE Pass Configuration
UAE_PASS_CLIENT_ID=your-uae-pass-client-id
UAE_PASS_CLIENT_SECRET=your-uae-pass-client-secret
UAE_PASS_ENVIRONMENT=staging
UAE_PASS_SCOPE=urn:uae:digitalid:profile
UAE_PASS_ACR_VALUES=urn:safelayer:tws:policies:authentication:level:low
UAE_PASS_REDIRECT_URL=http://localhost:8000/api/auth/uaepass/callback/

# UAE Pass PKI (for production only)
UAE_PASS_PKI_PRIVATE_KEY=path/to/private-key.pem
UAE_PASS_PKI_CERT_FILE=path/to/certificate.pem

# Sentry Configuration (for error tracking)
DJANGO_SENTRY_DSN=your-sentry-dsn-here

# Admin Configuration
DJANGO_ADMIN_URL=admin/
```

## Environment Modes

### Development Mode
- Set `DJANGO_ENV=development`
- Uses QA UAE Pass endpoints
- Debug toolbar enabled
- Console email backend
- SQLite database (default)

### Production Mode
- Set `DJANGO_ENV=production`
- Uses production UAE Pass endpoints
- Enhanced security settings
- Sentry integration
- AWS S3 for media files
- Requires PKI certificates for UAE Pass

### Staging Mode
- Set `DJANGO_ENV=staging`
- Uses staging UAE Pass endpoints
- Production-like security
- Optional Sentry integration

## UAE Pass Configuration

The UAE Pass integration automatically configures endpoints based on the environment:

- **Development/QA**: Uses `qa-id.uaepass.ae`
- **Staging**: Uses `stg-id.uaepass.ae`
- **Production**: Uses `id.uaepass.ae`

## Migration from Old Structure

All settings from the old structure have been migrated:
- ✅ Base settings → `settings.py`
- ✅ Development settings → `settings_dev.py`
- ✅ Production settings → `settings_prod.py`
- ✅ UAE Pass settings → Integrated in main settings
- ✅ Local settings → Covered by development settings

## Running the Application

```bash
# Development
python manage.py runserver

# Production (set environment first)
export DJANGO_ENV=production
python manage.py runserver

# Or use gunicorn for production
gunicorn aml_platform.wsgi:application
``` 