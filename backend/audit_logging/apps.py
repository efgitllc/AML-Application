from django.apps import AppConfig


class AuditLoggingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'audit_logging'
    verbose_name = 'Audit Logging' 