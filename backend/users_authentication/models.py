from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import RegexValidator
from core.models import AbstractBaseModel, validate_emirates_id, UserActionMixin
import uuid
from core.constants import UserRole, MFAMethod

class UserManager(BaseUserManager):
    """
    Custom user manager for UAE PASS integration
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('Email address is required'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """
    Custom User model that extends Django's AbstractUser with UAE PASS and MFA support
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=50, choices=UserRole.choices, default=UserRole.CUSTOMER_SERVICE)
    phone_number = models.CharField(
        max_length=20,
        validators=[RegexValidator(
            regex=r'^\+971\d{9}$',
            message=_('Phone number must be a valid UAE number starting with +971')
        )],
        blank=True
    )
    department = models.CharField(max_length=100, blank=True)
    emirates_id = models.CharField(
        max_length=18,
        validators=[validate_emirates_id],
        blank=True,
        null=True,
        unique=True
    )
    
    # UAE Pass Integration
    is_verified_uae_pass = models.BooleanField(default=False)
    uae_pass_last_login = models.DateTimeField(null=True, blank=True)
    uae_pass_user_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    
    # MFA Configuration
    mfa_enabled = models.BooleanField(default=False)
    mfa_method = models.CharField(
        max_length=20,
        choices=MFAMethod.choices,
        default=MFAMethod.NONE
    )
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)
    mfa_backup_codes = models.JSONField(default=list, blank=True)
    
    # Security and Tracking
    is_active = models.BooleanField(default=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_device = models.CharField(max_length=255, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    
    # User Preferences
    preferred_language = models.CharField(
        max_length=10,
        choices=[('en', 'English'), ('ar', 'Arabic')],
        default='en'
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    objects = UserManager()
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    def lock_account(self, duration_minutes=30):
        """Lock the account for the specified duration"""
        self.account_locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save(update_fields=['account_locked_until'])
    
    def unlock_account(self):
        """Unlock the account and reset failed login attempts"""
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.save(update_fields=['account_locked_until', 'failed_login_attempts'])
    
    def is_locked(self):
        """Check if the account is currently locked"""
        if self.account_locked_until and self.account_locked_until > timezone.now():
            return True
        return False
    
    def increment_failed_attempts(self):
        """Increment failed login attempts and lock account if threshold reached"""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:  # Can be moved to settings
            self.lock_account()
        self.save(update_fields=['failed_login_attempts'])
    
    def reset_failed_attempts(self):
        """Reset failed login attempts counter"""
        self.failed_login_attempts = 0
        self.save(update_fields=['failed_login_attempts'])
    
    def generate_mfa_backup_codes(self):
        """Generate new backup codes for MFA"""
        import secrets
        codes = [secrets.token_hex(4) for _ in range(10)]
        self.mfa_backup_codes = codes
        self.save(update_fields=['mfa_backup_codes'])
        return codes
    
    def verify_backup_code(self, code):
        """Verify and consume a backup code"""
        if code in self.mfa_backup_codes:
            self.mfa_backup_codes.remove(code)
            self.save(update_fields=['mfa_backup_codes'])
            return True
        return False

class UAEPassProfile(AbstractBaseModel):
    """
    Model for storing UAE PASS profile data
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='uae_pass_profile',
        verbose_name=_('user')
    )
    uae_pass_id = models.CharField(
        _('UAE PASS ID'),
        max_length=100,
        unique=True,
        db_index=True,
        help_text=_('Unique identifier from UAE PASS')
    )
    full_name_en = models.CharField(
        _('full name (English)'),
        max_length=255
    )
    full_name_ar = models.CharField(
        _('full name (Arabic)'),
        max_length=255
    )
    gender = models.CharField(
        _('gender'),
        max_length=10,
        choices=[
            ('M', _('Male')),
            ('F', _('Female'))
        ]
    )
    nationality = models.CharField(
        _('nationality'),
        max_length=100
    )
    date_of_birth = models.DateField(
        _('date of birth')
    )
    profile_data = models.JSONField(
        _('profile data'),
        help_text=_('Additional profile data from UAE PASS')
    )
    
    class Meta:
        verbose_name = _('UAE PASS profile')
        verbose_name_plural = _('UAE PASS profiles')
        indexes = [
            models.Index(fields=['uae_pass_id']),
            models.Index(fields=['nationality']),
        ]

    def __str__(self):
        return f"UAE PASS Profile - {self.user.email}"

class UAEPassToken(AbstractBaseModel):
    """
    Model for managing UAE PASS OAuth2 tokens
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='uae_pass_token',
        verbose_name=_('user')
    )
    access_token = models.CharField(
        _('access token'),
        max_length=255,
        help_text=_('OAuth2 access token')
    )
    refresh_token = models.CharField(
        _('refresh token'),
        max_length=255,
        help_text=_('OAuth2 refresh token')
    )
    token_type = models.CharField(
        _('token type'),
        max_length=50,
        default='Bearer'
    )
    expires_at = models.DateTimeField(
        _('expires at'),
        help_text=_('Token expiration timestamp')
    )
    scope = models.CharField(
        _('scope'),
        max_length=255,
        help_text=_('OAuth2 scope')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Token is active and valid')
    )
    
    class Meta:
        verbose_name = _('UAE PASS token')
        verbose_name_plural = _('UAE PASS tokens')
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"UAE PASS Token - {self.user.email}"

    @property
    def is_expired(self):
        """Check if token is expired"""
        return self.expires_at <= timezone.now()

    def revoke(self):
        """Revoke the token"""
        self.is_active = False
        self.save(update_fields=['is_active', 'modified_at'])

class UserSession(AbstractBaseModel):
    """
    Model for tracking user sessions and activity
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name=_('user')
    )
    session_id = models.UUIDField(
        _('session ID'),
        default=uuid.uuid4,
        unique=True,
        db_index=True
    )
    ip_address = models.GenericIPAddressField(
        _('IP address')
    )
    user_agent = models.CharField(
        _('user agent'),
        max_length=255
    )
    device_info = models.JSONField(
        _('device info'),
        help_text=_('Device fingerprint and details')
    )
    location_info = models.JSONField(
        _('location info'),
        null=True,
        blank=True,
        help_text=_('Geolocation data if available')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True
    )
    last_activity = models.DateTimeField(
        _('last activity'),
        auto_now=True
    )
    mfa_verified = models.BooleanField(
        _('MFA verified'),
        default=False
    )
    risk_score = models.FloatField(
        _('risk score'),
        default=0.0,
        help_text=_('Session risk score (0-1)')
    )
    
    class Meta:
        verbose_name = _('user session')
        verbose_name_plural = _('user sessions')
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['last_activity']),
        ]

    def __str__(self):
        return f"Session {self.session_id} - {self.user.email}"

    def end_session(self):
        """End the user session"""
        self.is_active = False
        self.save(update_fields=['is_active', 'modified_at'])

class UserActivity(AbstractBaseModel):
    """
    Model to track user activities for audit purposes
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(max_length=50)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    endpoint = models.CharField(max_length=255)
    request_method = models.CharField(max_length=10)
    request_body = models.JSONField(null=True, blank=True)
    response_status = models.IntegerField()
    error_message = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('user activity')
        verbose_name_plural = _('user activities')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['activity_type']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.activity_type} - {self.created_at}"

class UserPermission(AbstractBaseModel):
    """
    Model to manage fine-grained user permissions
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='custom_permissions'
    )
    permission_name = models.CharField(max_length=255)
    module_name = models.CharField(max_length=100)
    can_create = models.BooleanField(default=False)
    can_read = models.BooleanField(default=True)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    restrictions = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Additional restrictions or filters for this permission')
    )
    
    class Meta:
        verbose_name = _('user permission')
        verbose_name_plural = _('user permissions')
        unique_together = ['user', 'permission_name', 'module_name']
        indexes = [
            models.Index(fields=['user', 'module_name']),
            models.Index(fields=['permission_name']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.module_name} - {self.permission_name}"

class MFADevice(AbstractBaseModel):
    """
    Model for multi-factor authentication devices
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='mfa_devices'
    )
    device_type = models.CharField(
        max_length=20,
        choices=[
            ('AUTHENTICATOR', _('Authenticator App')),
            ('SMS', _('SMS')),
            ('EMAIL', _('Email')),
            ('BIOMETRIC', _('Biometric'))
        ]
    )
    identifier = models.CharField(
        max_length=255,
        help_text=_('Phone number, email, or device identifier')
    )
    secret_key = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Secret key for authenticator apps')
    )
    is_primary = models.BooleanField(default=False)
    is_confirmed = models.BooleanField(default=False)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('MFA device')
        verbose_name_plural = _('MFA devices')
        unique_together = ['user', 'device_type', 'identifier']
        indexes = [
            models.Index(fields=['device_type', 'is_primary'])
        ]

    def __str__(self):
        return f"{self.user.email} - {self.device_type}"

class MFAVerification(AbstractBaseModel):
    """
    Model for tracking MFA verification attempts
    """
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='mfa_verifications'
    )
    device = models.ForeignKey(
        MFADevice,
        on_delete=models.CASCADE,
        related_name='verifications'
    )
    verification_type = models.CharField(
        max_length=50,
        choices=[
            ('LOGIN', _('Login')),
            ('TRANSACTION', _('Transaction')),
            ('PASSWORD_RESET', _('Password Reset')),
            ('PROFILE_UPDATE', _('Profile Update'))
        ]
    )
    code_generated = models.CharField(max_length=20)
    code_expiry = models.DateTimeField()
    attempts = models.PositiveIntegerField(default=0)
    verified_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    class Meta:
        verbose_name = _('MFA verification')
        verbose_name_plural = _('MFA verifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['code_expiry']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.verification_type}"
