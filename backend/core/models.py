from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from django.core.cache import cache
from django.db.models import Q
import uuid
import hashlib
from typing import Optional, Dict, Any
from .constants import (
    RiskLevel,
    ALLOWED_DOCUMENT_EXTENSIONS,
    MAX_FILE_SIZES,
    DocumentType,
    TransactionType,
    CustomerType
)
from .validators import validate_file_size, validate_emirates_id, validate_trade_license

class RiskLevelMixin(models.Model):
    """
    Mixin to add risk level field to models with enhanced risk scoring
    """
    risk_level = models.CharField(
        max_length=20,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW,
        db_index=True
    )
    risk_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_("Risk score between 0-100")
    )
    risk_assessment_date = models.DateTimeField(null=True, blank=True, db_index=True)
    risk_assessment_notes = models.TextField(blank=True)
    risk_factors = models.JSONField(
        default=dict,
        help_text=_("Factors contributing to risk score")
    )
    previous_risk_levels = models.JSONField(
        default=list,
        help_text=_("History of risk level changes")
    )

    class Meta:
        abstract = True

    def update_risk_score(self, new_score: int, factors: Dict[str, Any], notes: str = "") -> None:
        """Update risk score and maintain history"""
        if new_score != self.risk_score:
            self.previous_risk_levels.append({
                'date': timezone.now().isoformat(),
                'old_score': self.risk_score,
                'new_score': new_score,
                'factors': factors,
                'notes': notes
            })
            self.risk_score = new_score
            self.risk_factors = factors
            self.risk_assessment_date = timezone.now()
            self.risk_assessment_notes = notes
            self._update_risk_level()
            self.save()

    def _update_risk_level(self) -> None:
        """Update risk level based on score thresholds"""
        if self.risk_score >= settings.AML_SETTINGS['HIGH_RISK_THRESHOLD']:
            self.risk_level = RiskLevel.HIGH
        elif self.risk_score >= settings.AML_SETTINGS['MEDIUM_RISK_THRESHOLD']:
            self.risk_level = RiskLevel.MEDIUM
        else:
            self.risk_level = RiskLevel.LOW

class CountryRiskCategory(RiskLevelMixin):
    """
    Model to store country risk categories with enhanced validation
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=3, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    sanctions_data = models.JSONField(
        default=dict,
        help_text=_("Sanctions and restrictions data")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Country Risk Category')
        verbose_name_plural = _('Country Risk Categories')
        ordering = ['name']
        indexes = [
            models.Index(fields=['code', 'is_active']),
            models.Index(fields=['risk_level', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.risk_level}"

    def clean(self):
        """Validate country data"""
        super().clean()
        self.code = self.code.upper()
        if len(self.code) != 3:
            raise ValidationError(_('Country code must be exactly 3 characters'))

class UserActionMixin(models.Model):
    """
    Mixin to track user actions on models with enhanced auditing
    """
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,  # Prevent user deletion if they've created records
        related_name='%(class)s_created',
        db_index=True
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,  # Prevent user deletion if they've updated records
        related_name='%(class)s_updated',
        null=True,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)

    class Meta:
        abstract = True

class AbstractBaseModel(UserActionMixin):
    """
    Abstract base model with enhanced security and tracking
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True)
    metadata = models.JSONField(
        default=dict,
        help_text=_("Additional metadata")
    )
    hash = models.CharField(
        max_length=64,
        blank=True,
        help_text=_("SHA-256 hash of critical fields")
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']
        get_latest_by = 'created_at'

    def __str__(self):
        return f"{self.__class__.__name__} - {self.id}"

    def save(self, *args, **kwargs):
        """Generate hash before saving"""
        self.hash = self._generate_hash()
        super().save(*args, **kwargs)

    def _generate_hash(self) -> str:
        """Generate SHA-256 hash of critical fields"""
        critical_fields = self._get_critical_fields()
        hash_string = ''.join(str(getattr(self, field)) for field in critical_fields)
        return hashlib.sha256(hash_string.encode()).hexdigest()

    def _get_critical_fields(self) -> list:
        """Get list of fields to include in hash"""
        return ['id', 'created_at', 'created_by_id']

class StatusMixin(models.Model):
    """
    Mixin for enhanced status tracking
    """
    class StatusChoices(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        COMPLETED = 'COMPLETED', _('Completed')
        REJECTED = 'REJECTED', _('Rejected')
        CANCELLED = 'CANCELLED', _('Cancelled')
        ON_HOLD = 'ON_HOLD', _('On Hold')
        EXPIRED = 'EXPIRED', _('Expired')
        BLOCKED = 'BLOCKED', _('Blocked')

    status = models.CharField(
        max_length=50,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        db_index=True
    )
    status_changed_at = models.DateTimeField(auto_now=True, db_index=True)
    status_reason = models.TextField(blank=True)
    status_history = models.JSONField(
        default=list,
        help_text=_("History of status changes")
    )

    class Meta:
        abstract = True

    def update_status(self, new_status: str, reason: str = "", user=None) -> None:
        """Update status and maintain history"""
        if new_status != self.status:
            self.status_history.append({
                'date': timezone.now().isoformat(),
                'old_status': self.status,
                'new_status': new_status,
                'reason': reason,
                'changed_by': str(user.id) if user else None
            })
            self.status = new_status
            self.status_reason = reason
            self.status_changed_at = timezone.now()
            self.save()

class DocumentMixin(models.Model):
    """
    Consolidated mixin for secure document management
    """
    document_type = models.CharField(
        max_length=50, 
        db_index=True,
        help_text=_('Type of document')
    )
    file_path = models.FileField(
        upload_to='documents/%Y/%m/',
        validators=[
            FileExtensionValidator(allowed_extensions=ALLOWED_DOCUMENT_EXTENSIONS),
            validate_file_size
        ]
    )
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField(
        help_text=_("File size in bytes"),
        validators=[validate_file_size]
    )
    file_type = models.CharField(max_length=50)
    mime_type = models.CharField(max_length=100)
    file_hash = models.CharField(
        max_length=64,
        unique=True,
        help_text=_("SHA-256 hash of file content")
    )
    encryption_key_id = models.CharField(
        max_length=100,
        help_text=_("ID of the key used for file encryption")
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_method = models.CharField(max_length=50, blank=True)
    verification_result = models.JSONField(default=dict)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """Generate file hash before saving"""
        if self.file_path and not self.file_hash:
            self.file_hash = self._generate_file_hash()
        if self.file_path:
            self.file_name = self.file_path.name
            self.file_size = self.file_path.size
        super().save(*args, **kwargs)

    def _generate_file_hash(self) -> str:
        """Generate SHA-256 hash of file content"""
        if self.file_path:
            hash_obj = hashlib.sha256()
            for chunk in self.file_path.chunks():
                hash_obj.update(chunk)
            return hash_obj.hexdigest()
        return ""

class AuditMixin(models.Model):
    """
    Consolidated mixin for comprehensive audit logging
    """
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField(db_index=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    action = models.CharField(max_length=50, db_index=True)
    changes = models.JSONField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]

class TransactionType(models.TextChoices):
    """Types of financial transactions"""
    CASH_DEPOSIT = 'CASH_DEPOSIT', _('Cash Deposit')
    WIRE_TRANSFER = 'WIRE_TRANSFER', _('Wire Transfer')
    CHEQUE = 'CHEQUE', _('Cheque')
    CRYPTO = 'CRYPTO', _('Cryptocurrency')
    TRADE_FINANCE = 'TRADE_FINANCE', _('Trade Finance')
    REMITTANCE = 'REMITTANCE', _('Remittance')
    INTERNAL_TRANSFER = 'INTERNAL_TRANSFER', _('Internal Transfer')
    LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT', _('Loan Disbursement')
    LOAN_REPAYMENT = 'LOAN_REPAYMENT', _('Loan Repayment')
    INVESTMENT = 'INVESTMENT', _('Investment')
    FX_TRADE = 'FX_TRADE', _('Foreign Exchange Trade')
    OTHER = 'OTHER', _('Other')

class CustomerType(models.TextChoices):
    """Types of customers"""
    INDIVIDUAL = 'INDIVIDUAL', _('Individual')
    CORPORATE = 'CORPORATE', _('Corporate')
    GOVERNMENT = 'GOVERNMENT', _('Government')
    NGO = 'NGO', _('Non-Governmental Organization')
    FINANCIAL_INSTITUTION = 'FINANCIAL_INSTITUTION', _('Financial Institution')
    TRUST = 'TRUST', _('Trust')
    PARTNERSHIP = 'PARTNERSHIP', _('Partnership')
    SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP', _('Sole Proprietorship')

class DocumentType(models.TextChoices):
    """Types of identification documents"""
    EMIRATES_ID = 'EMIRATES_ID', _('Emirates ID')
    PASSPORT = 'PASSPORT', _('Passport')
    TRADE_LICENSE = 'TRADE_LICENSE', _('Trade License')
    VISA = 'VISA', _('Visa')
    INCORPORATION_CERTIFICATE = 'INCORPORATION_CERTIFICATE', _('Certificate of Incorporation')
    MEMORANDUM_OF_ASSOCIATION = 'MEMORANDUM_OF_ASSOCIATION', _('Memorandum of Association')
    BOARD_RESOLUTION = 'BOARD_RESOLUTION', _('Board Resolution')
    POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY', _('Power of Attorney')
    OTHER = 'OTHER', _('Other')

# Constants
AML_SCREENING_BATCH_SIZE = 1000
RISK_SCORE_THRESHOLD_HIGH = 75
RISK_SCORE_THRESHOLD_MEDIUM = 50
STR_REPORTING_THRESHOLD = settings.AML_SETTINGS['STR_THRESHOLD_AED']
CACHE_TIMEOUT = 3600  # 1 hour
MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

# Document format constants
SUPPORTED_DOCUMENT_FORMATS = [
    'PDF',
    'JPG', 
    'JPEG',
    'PNG',
    'TIFF',
    'BMP'
]

# Document type constants  
SUPPORTED_DOCUMENT_TYPES = [
    'PASSPORT',
    'EMIRATES_ID',
    'DRIVING_LICENSE',
    'TRADE_LICENSE',
    'BANK_STATEMENT',
    'UTILITY_BILL',
    'SALARY_CERTIFICATE'
]

# Risk level constants
RISK_LEVELS = [
    ('LOW', 'Low'),
    ('MEDIUM', 'Medium'), 
    ('HIGH', 'High'),
    ('CRITICAL', 'Critical')
]

# Document status choices
DOCUMENT_STATUS_CHOICES = [
    ('PENDING', 'Pending'),
    ('PROCESSING', 'Processing'),
    ('VERIFIED', 'Verified'),
    ('REJECTED', 'Rejected'),
    ('EXPIRED', 'Expired'),
]
