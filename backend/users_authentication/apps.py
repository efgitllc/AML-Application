"""
Users Authentication app configuration
"""
from django.apps import AppConfig


class UsersAuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users_authentication'
    verbose_name = 'Users Authentication'

    def ready(self):
        import users_authentication.signals  # noqa
