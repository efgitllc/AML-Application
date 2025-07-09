from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel


class EncryptionKey(AbstractBaseModel):
    """
    Model for managing encryption keys
    """
    name = models.CharField(max_length=100, unique=True)
    key_type = models.CharField(
        max_length=50,
        choices=[
            ('SYMMETRIC', _('Symmetric Key')),
            ('ASYMMETRIC', _('Asymmetric Key')),
            ('HMAC', _('HMAC Key')),
            ('MASTER', _('Master Key')),
            ('DATA', _('Data Key'))
        ]
    )
    algorithm = models.CharField(
        max_length=50,
        choices=[
            ('AES_256', _('AES-256')),
            ('RSA_2048', _('RSA-2048')),
            ('RSA_4096', _('RSA-4096')),
            ('ED25519', _('ED25519')),
            ('CHACHA20', _('ChaCha20'))
        ]
    )
    key_material = models.BinaryField(
        help_text=_('Encrypted key material')
    )
    key_metadata = models.JSONField(
        help_text=_('Key metadata and attributes')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', _('Active')),
            ('INACTIVE', _('Inactive')),
            ('COMPROMISED', _('Compromised')),
            ('ROTATED', _('Rotated')),
            ('ARCHIVED', _('Archived'))
        ],
        default='ACTIVE'
    )
    expiry_date = models.DateTimeField(null=True, blank=True)
    rotation_period = models.DurationField(null=True, blank=True)
    last_rotated = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_keys'
    )
    
    class Meta:
        verbose_name = _('encryption key')
        verbose_name_plural = _('encryption keys')
        ordering = ['name']
        indexes = [
            models.Index(fields=['key_type', 'status']),
            models.Index(fields=['algorithm']),
        ]

    def __str__(self):
        return f"{self.name} ({self.key_type})"

class EncryptedData(AbstractBaseModel):
    """
    Model for tracking encrypted data objects
    """
    data_id = models.CharField(max_length=100, unique=True)
    encryption_key = models.ForeignKey(
        EncryptionKey,
        on_delete=models.PROTECT,
        related_name='encrypted_data'
    )
    encrypted_data = models.BinaryField()
    data_type = models.CharField(
        max_length=50,
        choices=[
            ('PII', _('Personal Information')),
            ('FINANCIAL', _('Financial Data')),
            ('DOCUMENT', _('Document')),
            ('CREDENTIALS', _('Credentials')),
            ('OTHER', _('Other'))
        ]
    )
    encryption_algorithm = models.CharField(max_length=50)
    iv = models.BinaryField(null=True, blank=True)
    tag = models.BinaryField(null=True, blank=True)
    additional_authenticated_data = models.BinaryField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('encrypted data')
        verbose_name_plural = _('encrypted data')
        indexes = [
            models.Index(fields=['data_id']),
            models.Index(fields=['data_type']),
        ]

    def __str__(self):
        return f"{self.data_type} - {self.data_id}"

class SecurityAudit(AbstractBaseModel):
    """
    Model for security audit logs
    """
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('ACCESS', _('Access Event')),
            ('AUTHENTICATION', _('Authentication Event')),
            ('AUTHORIZATION', _('Authorization Event')),
            ('ENCRYPTION', _('Encryption Event')),
            ('CONFIGURATION', _('Configuration Change')),
            ('SECURITY', _('Security Event'))
        ]
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('INFO', _('Information')),
            ('WARNING', _('Warning')),
            ('ERROR', _('Error')),
            ('CRITICAL', _('Critical'))
        ]
    )
    event_data = models.JSONField(
        help_text=_('Detailed event information')
    )
    source_ip = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=500)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='security_events'
    )
    success = models.BooleanField()
    failure_reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('security audit')
        verbose_name_plural = _('security audits')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'severity']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['source_ip']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.severity} ({self.created_at})"

class SecurityPolicy(AbstractBaseModel):
    """
    Model for security policy configuration
    """
    name = models.CharField(max_length=100, unique=True)
    policy_type = models.CharField(
        max_length=50,
        choices=[
            ('PASSWORD', _('Password Policy')),
            ('ACCESS', _('Access Control')),
            ('ENCRYPTION', _('Encryption Policy')),
            ('AUDIT', _('Audit Policy')),
            ('COMPLIANCE', _('Compliance Policy')),
            ('CUSTOM', _('Custom Policy'))
        ]
    )
    description = models.TextField()
    policy_rules = models.JSONField(
        help_text=_('Policy rules and settings')
    )
    enforcement_level = models.CharField(
        max_length=20,
        choices=[
            ('STRICT', _('Strict')),
            ('MODERATE', _('Moderate')),
            ('FLEXIBLE', _('Flexible')),
            ('ADVISORY', _('Advisory'))
        ]
    )
    is_active = models.BooleanField(default=True)
    version = models.CharField(max_length=20)
    effective_from = models.DateTimeField()
    effective_to = models.DateTimeField(null=True, blank=True)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reviewed_policies'
    )
    
    class Meta:
        verbose_name = _('security policy')
        verbose_name_plural = _('security policies')
        unique_together = ['name', 'version']
        ordering = ['name', '-version']
        indexes = [
            models.Index(fields=['policy_type', 'is_active']),
            models.Index(fields=['enforcement_level']),
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"

class SecurityControl(AbstractBaseModel):
    """
    Model for security control implementation
    """
    name = models.CharField(max_length=100, unique=True)
    control_type = models.CharField(
        max_length=50,
        choices=[
            ('PREVENTIVE', _('Preventive Control')),
            ('DETECTIVE', _('Detective Control')),
            ('CORRECTIVE', _('Corrective Control')),
            ('DETERRENT', _('Deterrent Control'))
        ]
    )
    description = models.TextField()
    implementation = models.JSONField(
        help_text=_('Control implementation details')
    )
    effectiveness = models.CharField(
        max_length=20,
        choices=[
            ('HIGH', _('High')),
            ('MEDIUM', _('Medium')),
            ('LOW', _('Low')),
            ('UNKNOWN', _('Unknown'))
        ]
    )
    automated = models.BooleanField(
        help_text=_('Whether control is automated')
    )
    monitoring_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Control monitoring configuration')
    )
    last_tested = models.DateTimeField(null=True, blank=True)
    test_results = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Latest test results')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('security control')
        verbose_name_plural = _('security controls')
        ordering = ['name']
        indexes = [
            models.Index(fields=['control_type', 'effectiveness']),
            models.Index(fields=['automated', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.control_type})"

class SecurityAuditLog(AbstractBaseModel):
    """
    Model for security audit logging
    """
    event_id = models.CharField(max_length=100, unique=True)
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('AUTH', _('Authentication')),
            ('ACCESS', _('Access Control')),
            ('ENCRYPTION', _('Encryption Operation')),
            ('KEY_MANAGEMENT', _('Key Management')),
            ('CONFIGURATION', _('Security Configuration')),
            ('VIOLATION', _('Security Violation')),
            ('OTHER', _('Other'))
        ]
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('INFO', _('Information')),
            ('WARNING', _('Warning')),
            ('ERROR', _('Error')),
            ('CRITICAL', _('Critical'))
        ]
    )
    source = models.CharField(max_length=100)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_audit_actions'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_audits_reviewed'
    )
    target_type = models.CharField(max_length=50)
    target_id = models.CharField(max_length=100)
    event_data = models.JSONField(
        help_text=_('Detailed event information')
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('SUCCESS', _('Success')),
            ('FAILURE', _('Failure')),
            ('BLOCKED', _('Blocked')),
            ('UNKNOWN', _('Unknown'))
        ]
    )
    
    class Meta:
        verbose_name = _('security audit log')
        verbose_name_plural = _('security audit logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'severity']),
            models.Index(fields=['actor']),
            models.Index(fields=['target_type', 'target_id']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.event_id}"

class SecurityConfiguration(AbstractBaseModel):
    """
    Model for managing security configurations
    """
    name = models.CharField(max_length=100, unique=True)
    config_type = models.CharField(
        max_length=50,
        choices=[
            ('PASSWORD_POLICY', _('Password Policy')),
            ('ACCESS_CONTROL', _('Access Control')),
            ('ENCRYPTION', _('Encryption Settings')),
            ('AUDIT', _('Audit Settings')),
            ('SESSION', _('Session Settings')),
            ('OTHER', _('Other'))
        ]
    )
    settings = models.JSONField(
        help_text=_('Configuration settings')
    )
    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)
    last_modified_by = models.UUIDField()
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('security configuration')
        verbose_name_plural = _('security configurations')
        ordering = ['name']
        indexes = [
            models.Index(fields=['config_type', 'is_active']),
            models.Index(fields=['name', 'version']),
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"

class SecurityIncident(AbstractBaseModel):
    """
    Model for tracking security incidents
    """
    incident_id = models.CharField(max_length=100, unique=True)
    incident_type = models.CharField(
        max_length=50,
        choices=[
            ('UNAUTHORIZED_ACCESS', _('Unauthorized Access')),
            ('DATA_BREACH', _('Data Breach')),
            ('MALWARE', _('Malware')),
            ('POLICY_VIOLATION', _('Policy Violation')),
            ('SUSPICIOUS_ACTIVITY', _('Suspicious Activity')),
            ('OTHER', _('Other'))
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
    status = models.CharField(
        max_length=20,
        choices=[
            ('NEW', _('New')),
            ('INVESTIGATING', _('Under Investigation')),
            ('CONTAINED', _('Contained')),
            ('RESOLVED', _('Resolved')),
            ('CLOSED', _('Closed'))
        ],
        default='NEW'
    )
    description = models.TextField()
    affected_systems = models.JSONField()
    affected_data = models.JSONField(null=True, blank=True)
    detection_source = models.CharField(max_length=100)
    detection_date = models.DateTimeField()
    resolution_date = models.DateTimeField(null=True, blank=True)
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reported_incidents'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_incidents'
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_incidents'
    )
    resolution_notes = models.TextField(blank=True)
    mitigation_steps = models.JSONField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('security incident')
        verbose_name_plural = _('security incidents')
        ordering = ['-detection_date']
        indexes = [
            models.Index(fields=['incident_type', 'severity']),
            models.Index(fields=['status', 'assigned_to']),
            models.Index(fields=['incident_id']),
        ]

    def __str__(self):
        return f"{self.incident_type} - {self.incident_id}"
