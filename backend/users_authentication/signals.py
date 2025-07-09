"""
Users Authentication signals
"""
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import User

@receiver(pre_save, sender=User)
def update_user_last_login(sender, instance, **kwargs):
    """
    Update user's last login time when they log in
    """
    if instance.last_login and (not instance.last_login_at or instance.last_login > instance.last_login_at):
        instance.last_login_at = instance.last_login 