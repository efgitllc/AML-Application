from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import AbstractBaseModel, StatusMixin, RiskLevelMixin
import uuid


class SARTemplate(AbstractBaseModel):
    """
    Template for Suspicious Activity Reports
    """
    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(
        max_length=50,
        choices=[
            ('TRANSACTION', _('Transaction-based SAR')),
            ('CUSTOMER', _('Customer-based SAR')),
            ('ACTIVITY', _('Activity-based SAR')),
            ('TERRORISM', _('Terrorism Financing')),
            ('MONEY_LAUNDERING', _('Money Laundering')),
            ('OTHER', _('Other'))
        ]
    )
    description = models.TextField()
    template_fields = models.JSONField(
        help_text=_('Template field definitions')
    )
    validation_rules = models.JSONField(
        help_text=_('Field validation rules')
    )
    regulatory_requirements = models.JSONField(
        help_text=_('Regulatory requirement mappings')
    )
    is_active = models.BooleanField(default=True)
    version = models.CharField(max_length=20, default='1.0')
    
    class Meta:
        verbose_name = _('SAR template')
        verbose_name_plural = _('SAR templates')
        ordering = ['name', '-version']
        unique_together = ['name', 'version']
        indexes = [
            models.Index(fields=['template_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"


class SuspiciousActivityReport(AbstractBaseModel, StatusMixin, RiskLevelMixin):
    """
    Main Suspicious Activity Report model
    """
    sar_id = models.UUIDField(default=uuid.uuid4, unique=True)
    reference_number = models.CharField(
        max_length=50,
        unique=True,
        help_text=_('SAR reference number')
    )
    template = models.ForeignKey(
        SARTemplate,
        on_delete=models.PROTECT,
        related_name='reports'
    )
    
    # Report Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', _('Draft')),
            ('PENDING_REVIEW', _('Pending Review')),
            ('UNDER_INVESTIGATION', _('Under Investigation')),
            ('READY_FOR_FILING', _('Ready for Filing')),
            ('FILED', _('Filed')),
            ('ACKNOWLEDGED', _('Acknowledged')),
            ('REJECTED', _('Rejected')),
            ('AMENDED', _('Amended')),
            ('CLOSED', _('Closed'))
        ],
        default='DRAFT'
    )
    
    # Priority and Classification
    priority = models.CharField(
        max_length=20,
        choices=[
            ('LOW', _('Low')),
            ('MEDIUM', _('Medium')),
            ('HIGH', _('High')),
            ('URGENT', _('Urgent'))
        ],
        default='MEDIUM'
    )
    
    classification = models.CharField(
        max_length=50,
        choices=[
            ('STRUCTURING', _('Structuring')),
            ('SMURFING', _('Smurfing')),
            ('UNUSUAL_TRANSACTION', _('Unusual Transaction Pattern')),
            ('HIGH_RISK_JURISDICTION', _('High Risk Jurisdiction')),
            ('PEP_INVOLVEMENT', _('PEP Involvement')),
            ('SANCTIONS_SCREENING', _('Sanctions Screening Hit')),
            ('TERRORISM_FINANCING', _('Terrorism Financing')),
            ('TRADE_FINANCE', _('Trade Finance Anomaly')),
            ('CORRESPONDENT_BANKING', _('Correspondent Banking')),
            ('WIRE_TRANSFER', _('Wire Transfer Anomaly')),
            ('OTHER', _('Other'))
        ]
    )
    
    # Report Content
    suspicious_activity_description = models.TextField(
        help_text=_('Detailed description of suspicious activity')
    )
    supporting_documentation = models.JSONField(
        help_text=_('List of supporting documents')
    )
    investigation_summary = models.TextField(
        help_text=_('Investigation findings summary')
    )
    
    # Financial Information
    total_amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='AED')
    transaction_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Timing
    activity_start_date = models.DateTimeField()
    activity_end_date = models.DateTimeField()
    detection_date = models.DateTimeField(default=timezone.now)
    filing_deadline = models.DateTimeField()
    filed_date = models.DateTimeField(null=True, blank=True)
    
    # Regulatory Information
    regulatory_authority = models.CharField(
        max_length=100,
        default='UAE Financial Intelligence Unit (FIU)'
    )
    regulatory_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text=_('Reference number from regulatory authority')
    )
    acknowledgment_received = models.BooleanField(default=False)
    acknowledgment_date = models.DateTimeField(null=True, blank=True)
    
    # User Assignment
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_sars'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_sars'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_sars'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_sars'
    )
    
    class Meta:
        verbose_name = _('suspicious activity report')
        verbose_name_plural = _('suspicious activity reports')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference_number']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['classification']),
            models.Index(fields=['filing_deadline']),
            models.Index(fields=['assigned_to']),
        ]

    def __str__(self):
        return f"SAR-{self.reference_number}"


class SARSubject(AbstractBaseModel):
    """
    Subjects involved in SAR (customers, entities, etc.)
    """
    sar = models.ForeignKey(
        SuspiciousActivityReport,
        on_delete=models.CASCADE,
        related_name='subjects'
    )
    subject_type = models.CharField(
        max_length=20,
        choices=[
            ('PRIMARY', _('Primary Subject')),
            ('SECONDARY', _('Secondary Subject')),
            ('BENEFICIARY', _('Beneficiary')),
            ('ORIGINATOR', _('Originator')),
            ('INTERMEDIARY', _('Intermediary'))
        ]
    )
    customer_id = models.UUIDField(
        help_text=_('Reference to customer record')
    )
    subject_role = models.CharField(
        max_length=100,
        help_text=_('Role in suspicious activity')
    )
    involvement_details = models.JSONField(
        help_text=_('Details of subject involvement')
    )
    
    class Meta:
        verbose_name = _('SAR subject')
        verbose_name_plural = _('SAR subjects')
        ordering = ['subject_type']
        indexes = [
            models.Index(fields=['sar', 'subject_type']),
            models.Index(fields=['customer_id']),
        ]

    def __str__(self):
        return f"{self.sar.reference_number} - {self.subject_type}"


class SARTransaction(AbstractBaseModel):
    """
    Transactions involved in SAR
    """
    sar = models.ForeignKey(
        SuspiciousActivityReport,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_id = models.UUIDField(
        help_text=_('Reference to transaction record')
    )
    transaction_role = models.CharField(
        max_length=50,
        choices=[
            ('SUSPICIOUS', _('Suspicious Transaction')),
            ('SUPPORTING', _('Supporting Evidence')),
            ('PATTERN', _('Part of Pattern')),
            ('RELATED', _('Related Transaction'))
        ]
    )
    suspicion_indicators = models.JSONField(
        help_text=_('Specific suspicion indicators for this transaction')
    )
    
    class Meta:
        verbose_name = _('SAR transaction')
        verbose_name_plural = _('SAR transactions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sar', 'transaction_role']),
            models.Index(fields=['transaction_id']),
        ]

    def __str__(self):
        return f"{self.sar.reference_number} - Transaction"


class SARWorkflow(AbstractBaseModel):
    """
    SAR workflow and approval process
    """
    sar = models.OneToOneField(
        SuspiciousActivityReport,
        on_delete=models.CASCADE,
        related_name='workflow'
    )
    current_step = models.CharField(
        max_length=50,
        choices=[
            ('CREATION', _('SAR Creation')),
            ('INVESTIGATION', _('Investigation')),
            ('REVIEW', _('Review')),
            ('COMPLIANCE_CHECK', _('Compliance Check')),
            ('APPROVAL', _('Management Approval')),
            ('FILING', _('Regulatory Filing')),
            ('MONITORING', _('Post-filing Monitoring')),
            ('CLOSURE', _('Case Closure'))
        ]
    )
    workflow_history = models.JSONField(
        default=list,
        help_text=_('Workflow step history')
    )
    required_approvals = models.JSONField(
        help_text=_('Required approval configuration')
    )
    approval_status = models.JSONField(
        help_text=_('Current approval status')
    )
    sla_config = models.JSONField(
        help_text=_('SLA configuration for steps')
    )
    escalation_rules = models.JSONField(
        help_text=_('Escalation rules configuration')
    )
    
    class Meta:
        verbose_name = _('SAR workflow')
        verbose_name_plural = _('SAR workflows')
        indexes = [
            models.Index(fields=['current_step']),
        ]

    def __str__(self):
        return f"{self.sar.reference_number} - {self.current_step}"


class SARComment(AbstractBaseModel):
    """
    Comments and notes on SAR
    """
    sar = models.ForeignKey(
        SuspiciousActivityReport,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    comment_type = models.CharField(
        max_length=30,
        choices=[
            ('GENERAL', _('General Comment')),
            ('INVESTIGATION', _('Investigation Note')),
            ('REVIEW', _('Review Comment')),
            ('COMPLIANCE', _('Compliance Note')),
            ('MANAGEMENT', _('Management Comment')),
            ('EXTERNAL', _('External Communication'))
        ]
    )
    comment = models.TextField()
    is_confidential = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sar_comments'
    )
    
    class Meta:
        verbose_name = _('SAR comment')
        verbose_name_plural = _('SAR comments')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sar', 'comment_type']),
            models.Index(fields=['is_confidential']),
        ]

    def __str__(self):
        return f"{self.sar.reference_number} - {self.comment_type}"


class SARDocument(AbstractBaseModel):
    """
    Documents attached to SAR
    """
    sar = models.ForeignKey(
        SuspiciousActivityReport,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('EVIDENCE', _('Evidence Document')),
            ('TRANSACTION_RECORD', _('Transaction Record')),
            ('CUSTOMER_INFO', _('Customer Information')),
            ('INVESTIGATION_REPORT', _('Investigation Report')),
            ('REGULATORY_FILING', _('Regulatory Filing')),
            ('CORRESPONDENCE', _('Correspondence')),
            ('OTHER', _('Other'))
        ]
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file_path = models.FileField(
        upload_to='sar_documents/%Y/%m/',
        max_length=255
    )
    file_size = models.IntegerField()
    file_hash = models.CharField(max_length=64)
    is_confidential = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sar_documents'
    )
    
    class Meta:
        verbose_name = _('SAR document')
        verbose_name_plural = _('SAR documents')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sar', 'document_type']),
            models.Index(fields=['is_confidential']),
        ]

    def __str__(self):
        return f"{self.sar.reference_number} - {self.title}"
