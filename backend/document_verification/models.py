from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
from core.models import (
    AbstractBaseModel,
    DocumentType,
    DocumentMixin,
    UserActionMixin,
    StatusMixin,
    AuditMixin,
    DOCUMENT_STATUS_CHOICES
)
from core.constants import MAX_FILE_SIZES, ALLOWED_DOCUMENT_EXTENSIONS
from core.validators import validate_file_size
from customer_management.models import Customer

class Document(AbstractBaseModel):
    """Enhanced document verification model"""
    document_type = models.CharField(
        max_length=50,
        choices=DocumentType.choices,
        help_text=_('Type of document (passport, ID card, etc.)')
    )
    document_number = models.CharField(
        max_length=100,
        help_text=_('Unique document identifier')
    )
    issuing_authority = models.CharField(
        max_length=100,
        help_text=_('Authority that issued the document')
    )
    issuing_country = models.CharField(
        max_length=100,
        help_text=_('Country that issued the document')
    )
    issue_date = models.DateField(
        help_text=_('Date when document was issued')
    )
    expiry_date = models.DateField(
        help_text=_('Document expiration date')
    )
    document_hash = models.CharField(
        max_length=64,
        unique=True,
        help_text=_('SHA-256 hash of document content')
    )
    ocr_data = models.JSONField(
        default=dict,
        help_text=_('Extracted data from OCR processing')
    )
    verification_status = models.CharField(
        max_length=20,
        choices=DOCUMENT_STATUS_CHOICES,
        default='PENDING'
    )
    verification_method = models.CharField(
        max_length=50,
        choices=[
            ('AUTOMATED', _('Automated')),
            ('MANUAL', _('Manual')),
            ('THIRD_PARTY', _('Third Party')),
            ('BIOMETRIC', _('Biometric')),
            ('NFC', _('NFC Chip')),
            ('OCR', _('OCR')),
            ('BARCODE', _('Barcode')),
        ]
    )
    verification_timestamp = models.DateTimeField(
        auto_now=True,
        help_text=_('When the document was last verified')
    )
    verification_confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        default=0.0,
        help_text=_('Verification confidence score (0-1)')
    )
    biometric_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Biometric verification data if applicable')
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['document_type', 'document_number']),
            models.Index(fields=['verification_status']),
            models.Index(fields=['issuing_country']),
        ]
        verbose_name = _('Document')
        verbose_name_plural = _('Documents')
        unique_together = ['document_type', 'document_number', 'issuing_country']

    def __str__(self):
        return f"{self.document_type} - {self.document_number}"

class DocumentVerification(AbstractBaseModel, DocumentMixin, UserActionMixin):
    """
    Enhanced document verification model with OCR, facial liveness, and NFC support
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='document_verifications'
    )
    
    # OCR Fields
    ocr_data = models.JSONField(
        default=dict,
        help_text=_('Extracted text and field data from document')
    )
    ocr_confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        default=0.0,
        help_text=_('OCR extraction confidence score')
    )
    ocr_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('NEEDS_REVIEW', _('Needs Review'))
        ],
        default='PENDING'
    )
    
    # Facial Liveness Fields
    facial_match_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True,
        blank=True,
        help_text=_('Face matching confidence score')
    )
    liveness_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True,
        blank=True,
        help_text=_('Liveness detection confidence score')
    )
    face_image = models.ImageField(
        upload_to='face_images/%Y/%m/',
        null=True,
        blank=True,
        validators=[validate_file_size]
    )
    liveness_video = models.FileField(
        upload_to='liveness_videos/%Y/%m/',
        null=True,
        blank=True,
        validators=[validate_file_size]
    )
    
    # NFC/Chip Reading Fields
    nfc_data = models.JSONField(
        default=dict,
        help_text=_('Data extracted from NFC chip')
    )
    nfc_verification_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('VERIFIED', _('Verified')),
            ('FAILED', _('Failed')),
            ('UNSUPPORTED', _('Unsupported')),
            ('ERROR', _('Error'))
        ],
        default='PENDING'
    )
    
    # Barcode Fields
    barcode_data = models.JSONField(
        default=dict,
        help_text=_('Data extracted from document barcode')
    )
    barcode_type = models.CharField(
        max_length=20,
        choices=[
            ('QR', _('QR Code')),
            ('PDF417', _('PDF417')),
            ('DATAMATRIX', _('Data Matrix')),
            ('CODE128', _('Code 128')),
            ('OTHER', _('Other'))
        ],
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = _('document verification')
        verbose_name_plural = _('document verifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['ocr_status']),
            models.Index(fields=['nfc_verification_status']),
            models.Index(fields=['customer']),
        ]

class VerificationResult(AbstractBaseModel):
    """
    Model to store verification results and decisions
    """
    document_verification = models.OneToOneField(
        DocumentVerification,
        on_delete=models.CASCADE,
        related_name='verification_result_record'
    )
    is_verified = models.BooleanField(default=False)
    overall_confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        default=0.0,
        help_text=_('Overall verification confidence score')
    )
    verification_method = models.CharField(
        max_length=50,
        choices=[
            ('OCR', _('OCR Verification')),
            ('FACIAL', _('Facial Verification')),
            ('NFC', _('NFC Chip Verification')),
            ('BARCODE', _('Barcode Verification')),
            ('MANUAL', _('Manual Verification')),
            ('COMBINED', _('Combined Methods'))
        ]
    )
    verification_details = models.JSONField(
        default=dict,
        help_text=_('Detailed verification results')
    )
    risk_flags = models.JSONField(
        default=list,
        help_text=_('Potential risk flags identified')
    )
    reviewer_notes = models.TextField(blank=True)
    review_date = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_verifications'
    )

    class Meta:
        verbose_name = _('verification result')
        verbose_name_plural = _('verification results')
        indexes = [
            models.Index(fields=['is_verified']),
            models.Index(fields=['overall_confidence']),
        ]

class LiveVerificationSession(AbstractBaseModel):
    """
    Model for managing live verification sessions
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='live_verification_sessions'
    )
    session_type = models.CharField(
        max_length=50,
        choices=[
            ('DOCUMENT', _('Document Verification')),
            ('FACIAL', _('Facial Verification')),
            ('LIVENESS', _('Liveness Check')),
            ('COMBINED', _('Combined Verification'))
        ]
    )
    session_token = models.CharField(max_length=100, unique=True)
    session_status = models.CharField(
        max_length=20,
        choices=[
            ('INITIATED', _('Initiated')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('EXPIRED', _('Expired')),
            ('FAILED', _('Failed'))
        ],
        default='INITIATED'
    )
    expiry_time = models.DateTimeField()
    session_data = models.JSONField(
        default=dict,
        help_text=_('Session-specific data and parameters')
    )
    verification_attempts = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    max_attempts = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    class Meta:
        verbose_name = _('live verification session')
        verbose_name_plural = _('live verification sessions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_token']),
            models.Index(fields=['session_status']),
            models.Index(fields=['expiry_time']),
        ]

class BiometricVerification(AbstractBaseModel):
    """
    Model for biometric verification including facial liveness
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='biometric_verifications'
    )
    verification_type = models.CharField(
        max_length=50,
        choices=[
            ('FACIAL', _('Facial Recognition')),
            ('LIVENESS', _('Liveness Detection')),
            ('FINGERPRINT', _('Fingerprint')),
            ('VOICE', _('Voice Recognition')),
            ('COMBINED', _('Combined Biometrics'))
        ]
    )
    reference_image = models.FileField(
        upload_to='biometric_references/%Y/%m/',
        help_text=_('Reference image/data for comparison'),
        validators=[validate_file_size]
    )
    capture_data = models.FileField(
        upload_to='biometric_captures/%Y/%m/',
        help_text=_('Captured biometric data'),
        validators=[validate_file_size]
    )
    liveness_check = models.JSONField(
        default=dict,
        help_text=_('Liveness detection results')
    )
    match_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_('Biometric match confidence score')
    )
    verification_status = models.CharField(
        max_length=50,
        choices=[
            ('PENDING', _('Pending')),
            ('IN_PROGRESS', _('In Progress')),
            ('VERIFIED', _('Verified')),
            ('FAILED', _('Failed')),
            ('NEEDS_REVIEW', _('Needs Review'))
        ],
        default='PENDING'
    )
    verification_result = models.JSONField(
        default=dict,
        help_text=_('Detailed verification results')
    )
    
    # User Assignment
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='biometric_verifications'
    )
    verification_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('biometric verification')
        verbose_name_plural = _('biometric verifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['verification_type']),
            models.Index(fields=['verification_status']),
            models.Index(fields=['match_score']),
        ]

    def __str__(self):
        return f"{self.customer} - {self.verification_type}"

class VerificationSession(AbstractBaseModel):
    """
    Model for managing document and biometric verification sessions
    """
    session_id = models.CharField(max_length=100, unique=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='verification_sessions'
    )
    session_type = models.CharField(
        max_length=50,
        choices=[
            ('ONBOARDING', _('Initial Onboarding')),
            ('UPDATE', _('Information Update')),
            ('PERIODIC', _('Periodic Review')),
            ('ENHANCED', _('Enhanced Due Diligence'))
        ]
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ('INITIATED', _('Session Initiated')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('EXPIRED', _('Expired')),
            ('FAILED', _('Failed'))
        ],
        default='INITIATED'
    )
    document_verifications = models.ManyToManyField(
        DocumentVerification,
        related_name='sessions'
    )
    biometric_verifications = models.ManyToManyField(
        BiometricVerification,
        related_name='sessions'
    )
    session_data = models.JSONField(
        default=dict,
        help_text=_('Session configuration and progress data')
    )
    expiry_time = models.DateTimeField()
    completion_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('verification session')
        verbose_name_plural = _('verification sessions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['session_type', 'status']),
            models.Index(fields=['expiry_time']),
        ]

    def __str__(self):
        return f"Session {self.session_id} - {self.customer}"

class DocumentExtraction(AbstractBaseModel):
    """
    Model for storing extracted information from documents
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='extractions'
    )
    extraction_type = models.CharField(
        max_length=50,
        choices=[
            ('TEXT_OCR', _('Text OCR')),
            ('FACE_DETECTION', _('Face Detection')),
            ('MRZ_READING', _('MRZ Reading')),
            ('BARCODE_READING', _('Barcode Reading')),
            ('TABLE_EXTRACTION', _('Table Extraction')),
            ('FIELD_EXTRACTION', _('Field Extraction'))
        ]
    )
    extracted_data = models.JSONField(
        default=dict,
        help_text=_('Extracted information in structured format')
    )
    confidence_scores = models.JSONField(
        default=dict,
        help_text=_('Confidence scores for extracted fields')
    )
    extraction_method = models.CharField(
        max_length=50,
        choices=[
            ('TESSERACT', _('Tesseract OCR')),
            ('AZURE_OCR', _('Azure OCR')),
            ('GOOGLE_VISION', _('Google Vision')),
            ('AWS_TEXTRACT', _('AWS Textract')),
            ('CUSTOM', _('Custom Extraction'))
        ]
    )
    processing_time = models.DurationField(null=True, blank=True)

    class Meta:
        verbose_name = _('document extraction')
        verbose_name_plural = _('document extractions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['extraction_type']),
            models.Index(fields=['extraction_method']),
        ]

    def __str__(self):
        return f"{self.document} - {self.extraction_type}"

class DocumentTemplate(AbstractBaseModel):
    """
    Model for managing document templates and extraction rules
    """
    name = models.CharField(max_length=100, unique=True)
    document_type = models.CharField(
        max_length=50,
        choices=DocumentType.choices
    )
    issuing_country = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    
    # Template Configuration
    template_regions = models.JSONField(
        default=dict,
        help_text=_('Defined regions for data extraction')
    )
    validation_rules = models.JSONField(
        default=dict,
        help_text=_('Rules for validating extracted data')
    )
    sample_images = models.JSONField(
        default=list,
        help_text=_('Reference to sample document images')
    )
    
    # Processing Settings
    preprocessing_steps = models.JSONField(
        default=list,
        help_text=_('Image preprocessing steps')
    )
    extraction_settings = models.JSONField(
        default=dict,
        help_text=_('OCR and extraction configuration')
    )

    class Meta:
        verbose_name = _('document template')
        verbose_name_plural = _('document templates')
        unique_together = ['document_type', 'issuing_country', 'version']
        ordering = ['document_type', 'issuing_country']
        indexes = [
            models.Index(fields=['document_type', 'is_active']),
            models.Index(fields=['issuing_country']),
        ]

    def __str__(self):
        return f"{self.name} - {self.document_type} ({self.issuing_country})"
