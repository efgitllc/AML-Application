from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import AbstractBaseModel, StatusMixin, RiskLevelMixin, AuditMixin
from customer_management.models import Customer
from transaction_monitoring.models import Transaction, TransactionAlert

class Case(AbstractBaseModel):
    """
    Model for managing AML investigation cases
    """
    case_number = models.CharField(
        max_length=50,
        unique=True,
        help_text=_('Unique case reference number')
    )
    case_type = models.CharField(
        max_length=50,
        choices=[
            ('STR', _('Suspicious Transaction Report')),
            ('KYC', _('KYC Investigation')),
            ('SANCTIONS', _('Sanctions Investigation')),
            ('FRAUD', _('Fraud Investigation')),
            ('PEP', _('PEP Review')),
            ('PERIODIC_REVIEW', _('Periodic Review')),
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
            ('NEW', _('New')),
            ('ASSIGNED', _('Assigned')),
            ('IN_PROGRESS', _('In Progress')),
            ('PENDING_INFO', _('Pending Information')),
            ('UNDER_REVIEW', _('Under Review')),
            ('ESCALATED', _('Escalated')),
            ('CLOSED', _('Closed')),
            ('REOPENED', _('Reopened'))
        ],
        default='NEW'
    )
    
    # Case Participants
    primary_customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='primary_cases'
    )
    related_customers = models.ManyToManyField(
        Customer,
        related_name='related_cases',
        blank=True
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_cases'
    )
    escalated_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='escalated_cases'
    )
    
    # Case Details
    summary = models.TextField()
    risk_rating = models.CharField(
        max_length=20,
        choices=[
            ('LOW', _('Low Risk')),
            ('MEDIUM', _('Medium Risk')),
            ('HIGH', _('High Risk')),
            ('CRITICAL', _('Critical Risk'))
        ],
        default='MEDIUM'
    )
    source = models.CharField(
        max_length=50,
        choices=[
            ('ALERT', _('System Alert')),
            ('MANUAL', _('Manual Entry')),
            ('EXTERNAL', _('External Source')),
            ('REGULATORY', _('Regulatory Request'))
        ]
    )
    detection_date = models.DateTimeField()
    due_date = models.DateTimeField()
    closed_date = models.DateTimeField(null=True, blank=True)
    
    # Related Records
    related_alerts = models.ManyToManyField(
        TransactionAlert,
        related_name='related_cases',
        blank=True
    )
    related_transactions = models.ManyToManyField(
        Transaction,
        related_name='related_cases',
        blank=True
    )
    
    class Meta:
        verbose_name = _('case')
        verbose_name_plural = _('cases')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['case_number']),
            models.Index(fields=['case_type', 'status']),
            models.Index(fields=['priority', 'due_date']),
            models.Index(fields=['assigned_to']),
        ]

    def __str__(self):
        return f"{self.case_number} - {self.case_type}"

class CaseActivity(AbstractBaseModel):
    """
    Model for tracking case activities and updates
    """
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(
        max_length=50,
        choices=[
            ('STATUS_CHANGE', _('Status Change')),
            ('ASSIGNMENT', _('Assignment')),
            ('COMMENT', _('Comment')),
            ('DOCUMENT_ADDED', _('Document Added')),
            ('EVIDENCE_ADDED', _('Evidence Added')),
            ('CUSTOMER_CONTACTED', _('Customer Contacted')),
            ('REVIEW', _('Review')),
            ('DECISION', _('Decision Made'))
        ]
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='case_activities'
    )
    description = models.TextField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('case activity')
        verbose_name_plural = _('case activities')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['case', '-created_at']),
            models.Index(fields=['activity_type']),
        ]

    def __str__(self):
        return f"{self.case.case_number} - {self.activity_type}"

class CaseDocument(AbstractBaseModel):
    """
    Model for managing case-related documents
    """
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('EVIDENCE', _('Evidence')),
            ('REPORT', _('Report')),
            ('CORRESPONDENCE', _('Correspondence')),
            ('CUSTOMER_STATEMENT', _('Customer Statement')),
            ('REGULATORY_FILING', _('Regulatory Filing')),
            ('SUPPORTING_DOC', _('Supporting Document')),
            ('OTHER', _('Other'))
        ]
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to='case_documents/%Y/%m/',
        max_length=255
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_case_documents'
    )
    is_confidential = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = _('case document')
        verbose_name_plural = _('case documents')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['case', 'document_type']),
            models.Index(fields=['is_confidential']),
        ]

    def __str__(self):
        return f"{self.case.case_number} - {self.title}"

class CaseDecision(AbstractBaseModel):
    """
    Model for tracking case decisions and outcomes
    """
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='decisions'
    )
    decision_type = models.CharField(
        max_length=50,
        choices=[
            ('STR_FILING', _('File STR')),
            ('ACCOUNT_CLOSURE', _('Close Account')),
            ('RELATIONSHIP_TERMINATION', _('Terminate Relationship')),
            ('ENHANCED_MONITORING', _('Enhanced Monitoring')),
            ('NO_ACTION', _('No Action Required')),
            ('OTHER', _('Other'))
        ]
    )
    decision_maker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='case_decisions'
    )
    decision_date = models.DateTimeField()
    rationale = models.TextField()
    evidence_references = models.JSONField(
        null=True,
        blank=True,
        help_text=_('References to supporting evidence')
    )
    regulatory_references = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Relevant regulatory requirements or guidelines')
    )
    action_items = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Required actions following the decision')
    )
    review_notes = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_case_decisions'
    )
    approval_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('case decision')
        verbose_name_plural = _('case decisions')
        ordering = ['-decision_date']
        indexes = [
            models.Index(fields=['case', 'decision_type']),
            models.Index(fields=['decision_maker']),
        ]

    def __str__(self):
        return f"{self.case.case_number} - {self.decision_type}"

class RegulatoryFiling(AbstractBaseModel):
    """
    Model for managing regulatory filings (e.g., STRs)
    """
    case = models.ForeignKey(
        Case,
        on_delete=models.PROTECT,
        related_name='regulatory_filings'
    )
    filing_type = models.CharField(
        max_length=50,
        choices=[
            ('STR', _('Suspicious Transaction Report')),
            ('CTR', _('Cash Transaction Report')),
            ('SAR', _('Suspicious Activity Report')),
            ('OTHER', _('Other Regulatory Filing'))
        ]
    )
    filing_reference = models.CharField(
        max_length=100,
        unique=True,
        help_text=_('Reference number assigned by regulatory authority')
    )
    regulatory_body = models.CharField(
        max_length=100,
        help_text=_('Name of the regulatory authority')
    )
    filing_date = models.DateTimeField()
    due_date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', _('Draft')),
            ('PENDING_REVIEW', _('Pending Review')),
            ('SUBMITTED', _('Submitted')),
            ('ACCEPTED', _('Accepted')),
            ('REJECTED', _('Rejected')),
            ('AMENDED', _('Amended'))
        ],
        default='DRAFT'
    )
    prepared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='prepared_filings'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_filings'
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_filings'
    )
    filing_data = models.JSONField(
        help_text=_('Complete filing data in required format')
    )
    attachments = models.JSONField(
        null=True,
        blank=True,
        help_text=_('References to attached documents')
    )
    submission_response = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Response from regulatory system')
    )
    
    class Meta:
        verbose_name = _('regulatory filing')
        verbose_name_plural = _('regulatory filings')
        ordering = ['-filing_date']
        indexes = [
            models.Index(fields=['filing_type', 'status']),
            models.Index(fields=['filing_reference']),
            models.Index(fields=['regulatory_body']),
        ]

    def __str__(self):
        return f"{self.filing_reference} - {self.filing_type}"

class SARCase(AbstractBaseModel):
    """
    Model for Suspicious Activity Report (SAR) cases
    """
    case_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='sar_cases'
    )
    transactions = models.ManyToManyField(
        Transaction,
        related_name='sar_cases'
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ('DRAFT', _('Draft')),
            ('UNDER_REVIEW', _('Under Review')),
            ('APPROVED', _('Approved for Filing')),
            ('FILED', _('Filed with Regulator')),
            ('REJECTED', _('Rejected')),
            ('CLOSED', _('Closed'))
        ],
        default='DRAFT'
    )
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
    suspicious_activity = models.JSONField(
        help_text=_('Details of suspicious activities')
    )
    risk_assessment = models.JSONField(
        help_text=_('Risk assessment details')
    )
    investigation_notes = models.TextField()
    evidence_documents = models.JSONField(
        help_text=_('List of supporting documents')
    )
    
    # Filing Details
    filing_deadline = models.DateTimeField()
    filed_date = models.DateTimeField(null=True, blank=True)
    regulatory_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text=_('Reference number from regulator')
    )
    
    # User Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_sar_cases'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_sar_cases'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_sar_cases'
    )
    
    class Meta:
        verbose_name = _('SAR case')
        verbose_name_plural = _('SAR cases')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['case_number']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['assigned_to']),
        ]

    def __str__(self):
        return f"{self.case_number} - {self.customer}"

class goAMLSubmission(AbstractBaseModel):
    """
    Model for tracking goAML report submissions
    """
    sar_case = models.ForeignKey(
        SARCase,
        on_delete=models.CASCADE,
        related_name='goaml_submissions'
    )
    submission_id = models.CharField(max_length=100, unique=True)
    report_type = models.CharField(
        max_length=50,
        choices=[
            ('STR', _('Suspicious Transaction Report')),
            ('SAR', _('Suspicious Activity Report')),
            ('CTR', _('Cash Transaction Report')),
            ('CBWTR', _('Cross-Border Wire Transfer Report'))
        ]
    )
    xml_content = models.TextField(
        help_text=_('Generated XML content for submission')
    )
    submission_status = models.CharField(
        max_length=50,
        choices=[
            ('PENDING', _('Pending')),
            ('VALIDATING', _('XML Validation')),
            ('SUBMITTED', _('Submitted')),
            ('ACCEPTED', _('Accepted')),
            ('REJECTED', _('Rejected')),
            ('ERROR', _('Error'))
        ],
        default='PENDING'
    )
    validation_errors = models.JSONField(
        null=True,
        blank=True,
        help_text=_('XML validation errors if any')
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    response_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Response from goAML system')
    )
    
    # User tracking
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='goaml_submissions'
    )
    
    class Meta:
        verbose_name = _('goAML submission')
        verbose_name_plural = _('goAML submissions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['submission_id']),
            models.Index(fields=['submission_status']),
        ]

    def __str__(self):
        return f"{self.submission_id} - {self.report_type}"

class CaseRegulatoryReport(AbstractBaseModel):
    """
    Model for case-specific regulatory reports and filings
    """
    sar_case = models.ForeignKey(
        SARCase,
        on_delete=models.CASCADE,
        related_name='regulatory_reports'
    )
    report_type = models.CharField(
        max_length=50,
        choices=[
            ('FINTRAC', _('FINTRAC Report')),
            ('AUSTRAC', _('AUSTRAC Report')),
            ('FINCEN', _('FinCEN Report')),
            ('OTHER', _('Other Report'))
        ]
    )
    report_data = models.JSONField(
        help_text=_('Report data in required format')
    )
    submission_status = models.CharField(
        max_length=50,
        choices=[
            ('DRAFT', _('Draft')),
            ('READY', _('Ready for Submission')),
            ('SUBMITTED', _('Submitted')),
            ('ACCEPTED', _('Accepted')),
            ('REJECTED', _('Rejected'))
        ],
        default='DRAFT'
    )
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        help_text=_('Reference number from regulatory system')
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    acknowledgment = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Acknowledgment from regulatory system')
    )
    
    # User tracking
    prepared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='case_prepared_reports'
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='case_submitted_reports'
    )
    
    class Meta:
        verbose_name = _('case regulatory report')
        verbose_name_plural = _('case regulatory reports')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['report_type', 'submission_status']),
            models.Index(fields=['reference_number']),
        ]

    def __str__(self):
        return f"{self.report_type} - {self.sar_case.case_number}"
