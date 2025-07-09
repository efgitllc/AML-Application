from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel, UserActionMixin
from customer_management.models import Customer
from transaction_monitoring.models import Transaction

class FraudPattern(AbstractBaseModel):
    """
    Model for defining fraud detection patterns
    """
    name = models.CharField(max_length=100, unique=True)
    pattern_type = models.CharField(
        max_length=50,
        choices=[
            ('TRANSACTION', _('Transaction Pattern')),
            ('BEHAVIOR', _('Behavioral Pattern')),
            ('BIOMETRIC', _('Biometric Pattern')),
            ('DEVICE', _('Device Pattern')),
            ('NETWORK', _('Network Pattern')),
            ('LOCATION', _('Location Pattern')),
            ('CUSTOM', _('Custom Pattern'))
        ]
    )
    description = models.TextField()
    detection_rules = models.JSONField(
        help_text=_('Rules for pattern detection')
    )
    risk_score = models.IntegerField(
        help_text=_('Risk score for this pattern (0-100)')
    )
    threshold = models.JSONField(
        help_text=_('Threshold configuration for alerts')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('fraud pattern')
        verbose_name_plural = _('fraud patterns')
        ordering = ['name']
        indexes = [
            models.Index(fields=['pattern_type', 'is_active']),
            models.Index(fields=['risk_score']),
        ]

    def __str__(self):
        return f"{self.name} ({self.pattern_type})"

class VoicePrint(AbstractBaseModel):
    """
    Model for storing customer voice biometric data
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='voice_prints'
    )
    voice_id = models.CharField(max_length=100, unique=True)
    voice_features = models.JSONField(
        help_text=_('Extracted voice biometric features')
    )
    enrollment_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    quality_score = models.FloatField(
        help_text=_('Voice print quality score (0-1)')
    )
    
    class Meta:
        verbose_name = _('voice print')
        verbose_name_plural = _('voice prints')
        indexes = [
            models.Index(fields=['voice_id']),
            models.Index(fields=['customer', 'is_active'])
        ]

    def __str__(self):
        return f"{self.customer} - {self.voice_id}"

class VoiceVerification(AbstractBaseModel):
    """
    Model for voice verification attempts and results
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='voice_verifications'
    )
    voice_print = models.ForeignKey(
        VoicePrint,
        on_delete=models.PROTECT,
        related_name='verifications'
    )
    verification_id = models.CharField(max_length=100, unique=True)
    verification_type = models.CharField(
        max_length=50,
        choices=[
            ('AUTHENTICATION', _('Authentication')),
            ('TRANSACTION', _('Transaction Verification')),
            ('ENROLLMENT', _('Voice Print Enrollment')),
            ('UPDATE', _('Voice Print Update'))
        ]
    )
    audio_features = models.JSONField(
        help_text=_('Features extracted from verification audio')
    )
    match_score = models.FloatField(
        help_text=_('Voice match confidence score (0-1)')
    )
    liveness_score = models.FloatField(
        help_text=_('Voice liveness detection score (0-1)')
    )
    verification_result = models.CharField(
        max_length=20,
        choices=[
            ('MATCH', _('Match')),
            ('NO_MATCH', _('No Match')),
            ('INCONCLUSIVE', _('Inconclusive')),
            ('ERROR', _('Error'))
        ]
    )
    verification_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('voice verification')
        verbose_name_plural = _('voice verifications')
        indexes = [
            models.Index(fields=['verification_id']),
            models.Index(fields=['verification_type', 'verification_result'])
        ]

class FraudDetectionRule(AbstractBaseModel):
    """
    Model for fraud detection rules and patterns
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    rule_type = models.CharField(
        max_length=50,
        choices=[
            ('TRANSACTION', _('Transaction Pattern')),
            ('BEHAVIOR', _('Behavioral Pattern')),
            ('VOICE', _('Voice Pattern')),
            ('DEVICE', _('Device Pattern')),
            ('LOCATION', _('Location Pattern')),
            ('COMBINED', _('Combined Pattern'))
        ]
    )
    conditions = models.JSONField(
        help_text=_('Rule conditions and thresholds')
    )
    risk_score = models.IntegerField(
        help_text=_('Risk score when rule matches (0-100)')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('fraud detection rule')
        verbose_name_plural = _('fraud detection rules')
        ordering = ['name']
        indexes = [
            models.Index(fields=['rule_type', 'is_active'])
        ]

class FraudAlert(AbstractBaseModel, UserActionMixin):
    """
    Model for fraud detection alerts
    """
    alert_id = models.CharField(max_length=100, unique=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='fraud_alerts'
    )
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='fraud_alerts'
    )
    detection_rule = models.ForeignKey(
        FraudDetectionRule,
        on_delete=models.PROTECT,
        related_name='alerts'
    )
    alert_type = models.CharField(
        max_length=50,
        choices=[
            ('TRANSACTION', _('Suspicious Transaction')),
            ('VOICE', _('Voice Verification Failed')),
            ('BEHAVIOR', _('Unusual Behavior')),
            ('DEVICE', _('Suspicious Device')),
            ('LOCATION', _('Suspicious Location')),
            ('COMBINED', _('Multiple Indicators'))
        ]
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('LOW', _('Low')),
            ('MEDIUM', _('Medium')),
            ('HIGH', _('High')),
            ('CRITICAL', _('Critical'))
        ]
    )
    alert_details = models.JSONField(
        help_text=_('Detailed alert information')
    )
    detection_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('NEW', _('New')),
            ('INVESTIGATING', _('Under Investigation')),
            ('CONFIRMED', _('Confirmed Fraud')),
            ('FALSE_POSITIVE', _('False Positive')),
            ('RESOLVED', _('Resolved'))
        ],
        default='NEW'
    )
    resolution_notes = models.TextField(blank=True)
    resolved_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('fraud alert')
        verbose_name_plural = _('fraud alerts')
        ordering = ['-detection_date']
        indexes = [
            models.Index(fields=['alert_id']),
            models.Index(fields=['alert_type', 'severity']),
            models.Index(fields=['status', 'detection_date'])
        ]

    def __str__(self):
        return f"{self.alert_type} - {self.alert_id}"

class DeviceFingerprint(AbstractBaseModel):
    """
    Model for device fingerprinting and fraud detection
    """
    device_id = models.CharField(max_length=100, unique=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='devices'
    )
    device_type = models.CharField(
        max_length=50,
        choices=[
            ('MOBILE', _('Mobile Device')),
            ('DESKTOP', _('Desktop/Laptop')),
            ('TABLET', _('Tablet')),
            ('OTHER', _('Other'))
        ]
    )
    device_details = models.JSONField(
        help_text=_('Device fingerprint details')
    )
    risk_score = models.FloatField(
        help_text=_('Device risk score (0-1)')
    )
    is_trusted = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    location_history = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Device location history')
    )
    
    class Meta:
        verbose_name = _('device fingerprint')
        verbose_name_plural = _('device fingerprints')
        indexes = [
            models.Index(fields=['device_id']),
            models.Index(fields=['customer', 'is_trusted'])
        ]

    def __str__(self):
        return f"{self.customer} - {self.device_id}"

class FraudCase(AbstractBaseModel):
    """
    Model for managing fraud investigation cases
    """
    case_id = models.CharField(max_length=100, unique=True)
    alerts = models.ManyToManyField(
        FraudAlert,
        related_name='fraud_cases'
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='fraud_cases'
    )
    case_type = models.CharField(
        max_length=50,
        choices=[
            ('IDENTITY_THEFT', _('Identity Theft')),
            ('ACCOUNT_TAKEOVER', _('Account Takeover')),
            ('TRANSACTION_FRAUD', _('Transaction Fraud')),
            ('SYNTHETIC_IDENTITY', _('Synthetic Identity')),
            ('OTHER', _('Other'))
        ]
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('LOW', _('Low')),
            ('MEDIUM', _('Medium')),
            ('HIGH', _('High')),
            ('CRITICAL', _('Critical'))
        ],
        default='MEDIUM'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('OPEN', _('Open')),
            ('INVESTIGATING', _('Under Investigation')),
            ('PENDING_ACTION', _('Pending Action')),
            ('CLOSED', _('Closed')),
            ('REOPENED', _('Reopened'))
        ],
        default='OPEN'
    )
    assigned_to = models.UUIDField(null=True, blank=True)
    investigation_notes = models.TextField(blank=True)
    evidence = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Evidence collected during investigation')
    )
    resolution = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Case resolution details')
    )
    
    class Meta:
        verbose_name = _('fraud case')
        verbose_name_plural = _('fraud cases')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['case_type', 'status']),
            models.Index(fields=['customer', 'priority']),
            models.Index(fields=['case_id']),
        ]

    def __str__(self):
        return f"{self.case_type} - {self.case_id}"
