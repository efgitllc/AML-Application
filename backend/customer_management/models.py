from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator, EmailValidator
from django.utils import timezone
from django.conf import settings
from core.models import AbstractBaseModel, RiskLevelMixin, StatusMixin
from core.constants import CustomerType
import uuid
from typing import Dict, Any

class CustomerSegment(AbstractBaseModel):
    """
    Model for customer segmentation
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    criteria = models.JSONField(
        help_text=_('Segmentation criteria and rules')
    )
    priority = models.IntegerField(default=0)
    benefits = models.JSONField(
        help_text=_('Segment-specific benefits or features')
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('customer segment')
        verbose_name_plural = _('customer segments')
        ordering = ['priority', 'name']
        indexes = [
            models.Index(fields=['priority', 'is_active']),
        ]

    def __str__(self):
        return self.name

class Customer(AbstractBaseModel, RiskLevelMixin, StatusMixin):
    """
    Model to store customer information with enhanced KYC
    """
    customer_id = models.UUIDField(default=uuid.uuid4, unique=True)
    customer_type = models.CharField(
        max_length=50,
        choices=CustomerType.choices,
        db_index=True
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    nationality = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    identification_type = models.CharField(max_length=50)
    identification_number = models.CharField(max_length=100)
    is_pep = models.BooleanField(default=False, db_index=True)
    is_sanctioned = models.BooleanField(default=False, db_index=True)
    kyc_status = models.CharField(max_length=50, default='PENDING')
    kyc_expiry = models.DateField(null=True, blank=True)
    kyc_documents = models.JSONField(default=list)
    risk_factors = models.JSONField(default=dict)
    
    # New fields for segmentation
    segment = models.ForeignKey(
        CustomerSegment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customers'
    )
    segment_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_('Customer segment score (0-100)')
    )
    segment_history = models.JSONField(
        default=list,
        help_text=_('History of segment changes')
    )
    last_segment_review = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('Customer')
        verbose_name_plural = _('Customers')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer_type', 'kyc_status']),
            models.Index(fields=['is_pep', 'is_sanctioned']),
            models.Index(fields=['identification_type', 'identification_number']),
        ]

    def __str__(self):
        return f"{self.name} ({self.customer_id})"

    def update_kyc_status(self, new_status: str, expiry_date=None, documents=None) -> None:
        """Update KYC status and related information"""
        self.kyc_status = new_status
        if expiry_date:
            self.kyc_expiry = expiry_date
        if documents:
            self.kyc_documents.extend(documents)
        self.save()

    def mark_as_pep(self, reason: str = "") -> None:
        """Mark customer as PEP and update risk level"""
        if not self.is_pep:
            self.is_pep = True
            self.risk_factors['pep'] = {
                'date': timezone.now().isoformat(),
                'reason': reason
            }
            self.risk_level = 'HIGH'
            self.save()

    def update_segment(self, new_segment: CustomerSegment, score: int = None, reason: str = "") -> None:
        """Update customer segment and maintain history"""
        if new_segment != self.segment:
            self.segment_history.append({
                'date': timezone.now().isoformat(),
                'old_segment': self.segment.name if self.segment else None,
                'new_segment': new_segment.name,
                'old_score': self.segment_score,
                'new_score': score if score is not None else self.segment_score,
                'reason': reason
            })
            self.segment = new_segment
            if score is not None:
                self.segment_score = score
            self.last_segment_review = timezone.now()
            self.save()

class CustomerAddress(AbstractBaseModel):
    """
    Model to store customer address information
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    address_type = models.CharField(
        max_length=50,
        choices=[
            ('RESIDENTIAL', _('Residential')),
            ('BUSINESS', _('Business')),
            ('MAILING', _('Mailing')),
            ('OTHER', _('Other'))
        ]
    )
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    is_primary = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_method = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = _('Customer Address')
        verbose_name_plural = _('Customer Addresses')
        ordering = ['-is_primary', '-created_at']
        indexes = [
            models.Index(fields=['address_type', 'country']),
            models.Index(fields=['is_primary', 'is_verified']),
        ]

    def __str__(self):
        return f"{self.customer.name} - {self.address_type} Address"

class CustomerDocument(AbstractBaseModel):
    """
    Model to store customer document information
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('PASSPORT', _('Passport')),
            ('ID_CARD', _('ID Card')),
            ('DRIVING_LICENSE', _('Driving License')),
            ('TRADE_LICENSE', _('Trade License')),
            ('OTHER', _('Other'))
        ]
    )
    document_number = models.CharField(max_length=100)
    issuing_country = models.CharField(max_length=100)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    file_path = models.FileField(upload_to='customer_documents/%Y/%m/')
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_method = models.CharField(max_length=50, blank=True)
    verification_result = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Customer Document')
        verbose_name_plural = _('Customer Documents')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document_type', 'issuing_country']),
            models.Index(fields=['is_verified', 'expiry_date']),
        ]

    def __str__(self):
        return f"{self.customer.name} - {self.document_type}"

class CustomerRelationship(AbstractBaseModel):
    """
    Model for tracking relationships between customers
    """
    from_customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='outgoing_relationships'
    )
    to_customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='incoming_relationships'
    )
    relationship_type = models.CharField(
        max_length=50,
        choices=[
            ('DIRECTOR', _('Director')),
            ('SHAREHOLDER', _('Shareholder')),
            ('BENEFICIAL_OWNER', _('Beneficial Owner')),
            ('FAMILY_MEMBER', _('Family Member')),
            ('BUSINESS_ASSOCIATE', _('Business Associate')),
            ('AUTHORIZED_PERSON', _('Authorized Person')),
            ('OTHER', _('Other'))
        ]
    )
    details = models.JSONField(
        help_text=_('Additional relationship details')
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    ownership_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_('Ownership percentage if applicable')
    )
    is_active = models.BooleanField(default=True)
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('VERIFIED', _('Verified')),
            ('REJECTED', _('Rejected')),
            ('EXPIRED', _('Expired'))
        ],
        default='PENDING'
    )
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_documents = models.JSONField(default=list)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = _('customer relationship')
        verbose_name_plural = _('customer relationships')
        ordering = ['-created_at']
        unique_together = ['from_customer', 'to_customer', 'relationship_type']
        indexes = [
            models.Index(fields=['relationship_type', 'is_active']),
            models.Index(fields=['verification_status']),
        ]

    def __str__(self):
        return f"{self.from_customer.name} -> {self.relationship_type} -> {self.to_customer.name}"

    def verify_relationship(self, status: str, documents: list = None, notes: str = "") -> None:
        """Verify relationship and update status"""
        self.verification_status = status
        self.verification_date = timezone.now()
        if documents:
            self.verification_documents.extend(documents)
        self.notes = notes
        self.save()

class CustomerJourney(AbstractBaseModel):
    """
    Model for tracking customer journey and lifecycle events
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='journey_events'
    )
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('ONBOARDING_STARTED', _('Onboarding Started')),
            ('KYC_SUBMITTED', _('KYC Documents Submitted')),
            ('KYC_VERIFIED', _('KYC Verified')),
            ('ACCOUNT_ACTIVATED', _('Account Activated')),
            ('RISK_ASSESSMENT', _('Risk Assessment')),
            ('SEGMENT_CHANGE', _('Segment Change')),
            ('PRODUCT_ADDED', _('Product Added')),
            ('SERVICE_ISSUE', _('Service Issue')),
            ('COMPLAINT_FILED', _('Complaint Filed')),
            ('REVIEW_COMPLETED', _('Review Completed')),
            ('STATUS_CHANGE', _('Status Change')),
            ('ACCOUNT_SUSPENDED', _('Account Suspended')),
            ('ACCOUNT_REACTIVATED', _('Account Reactivated')),
            ('RELATIONSHIP_ADDED', _('Relationship Added')),
            ('DOCUMENT_EXPIRED', _('Document Expired')),
            ('OTHER', _('Other'))
        ]
    )
    event_date = models.DateTimeField()
    event_details = models.JSONField(
        help_text=_('Detailed event information')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='COMPLETED'
    )
    source = models.CharField(
        max_length=50,
        choices=[
            ('SYSTEM', _('System Generated')),
            ('USER', _('User Action')),
            ('SCHEDULED', _('Scheduled Event')),
            ('EXTERNAL', _('External Trigger'))
        ]
    )
    triggered_by = models.UUIDField(null=True, blank=True)
    next_actions = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Required follow-up actions')
    )
    metrics = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Event-specific metrics')
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = _('customer journey')
        verbose_name_plural = _('customer journeys')
        ordering = ['-event_date']
        indexes = [
            models.Index(fields=['customer', 'event_type']),
            models.Index(fields=['event_date', 'status']),
        ]

    def __str__(self):
        return f"{self.customer.name} - {self.event_type} ({self.event_date})"

    def add_next_action(self, action: Dict[str, Any]) -> None:
        """Add a follow-up action to the event"""
        if not self.next_actions:
            self.next_actions = []
        action['added_date'] = timezone.now().isoformat()
        self.next_actions.append(action)
        self.save()

    def update_metrics(self, metrics: Dict[str, Any]) -> None:
        """Update event metrics"""
        if not self.metrics:
            self.metrics = {}
        self.metrics.update(metrics)
        self.metrics['last_updated'] = timezone.now().isoformat()
        self.save()
