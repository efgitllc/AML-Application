from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import AbstractBaseModel, StatusMixin, RiskLevelMixin
import uuid


class RegulatoryFramework(AbstractBaseModel):
    """
    Different regulatory frameworks and standards
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    framework_type = models.CharField(
        max_length=50,
        choices=[
            ('AML_CFT', _('Anti-Money Laundering / Counter-Terrorism Financing')),
            ('KYC', _('Know Your Customer')),
            ('CDD', _('Customer Due Diligence')),
            ('FATCA', _('Foreign Account Tax Compliance Act')),
            ('CRS', _('Common Reporting Standard')),
            ('GDPR', _('General Data Protection Regulation')),
            ('PCI_DSS', _('Payment Card Industry Data Security Standard')),
            ('BASEL', _('Basel Framework')),
            ('COSO', _('Committee of Sponsoring Organizations')),
            ('SOX', _('Sarbanes-Oxley Act')),
            ('LOCAL', _('Local Regulations')),
            ('CUSTOM', _('Custom Framework'))
        ]
    )
    jurisdiction = models.CharField(
        max_length=100,
        help_text=_('Regulatory jurisdiction (UAE, US, EU, etc.)')
    )
    authority = models.CharField(
        max_length=200,
        help_text=_('Regulatory authority or body')
    )
    description = models.TextField()
    requirements = models.JSONField(
        help_text=_('Framework requirements and rules')
    )
    implementation_guidelines = models.JSONField(
        help_text=_('Implementation guidelines and best practices')
    )
    version = models.CharField(max_length=20)
    effective_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('regulatory framework')
        verbose_name_plural = _('regulatory frameworks')
        ordering = ['jurisdiction', 'name']
        unique_together = ['name', 'version']
        indexes = [
            models.Index(fields=['framework_type', 'jurisdiction']),
            models.Index(fields=['code', 'is_active']),
            models.Index(fields=['effective_date', 'expiry_date']),
        ]

    def __str__(self):
        return f"{self.name} ({self.jurisdiction})"


class CompliancePolicy(AbstractBaseModel):
    """
    Internal compliance policies mapped to regulatory frameworks
    """
    policy_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=150, unique=True)
    policy_type = models.CharField(
        max_length=50,
        choices=[
            ('AML_POLICY', _('AML Policy')),
            ('KYC_POLICY', _('KYC Policy')),
            ('RISK_POLICY', _('Risk Management Policy')),
            ('DATA_PROTECTION', _('Data Protection Policy')),
            ('PRIVACY_POLICY', _('Privacy Policy')),
            ('OPERATIONAL', _('Operational Policy')),
            ('SECURITY', _('Security Policy')),
            ('GOVERNANCE', _('Governance Policy')),
            ('REPORTING', _('Reporting Policy')),
            ('TRAINING', _('Training Policy'))
        ]
    )
    frameworks = models.ManyToManyField(
        RegulatoryFramework,
        related_name='policies'
    )
    description = models.TextField()
    policy_content = models.TextField()
    procedures = models.JSONField(
        help_text=_('Detailed procedures and steps')
    )
    controls = models.JSONField(
        help_text=_('Control measures and checkpoints')
    )
    
    # Approval and Versioning
    version = models.CharField(max_length=20)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='approved_policies'
    )
    approval_date = models.DateTimeField(null=True, blank=True)
    effective_date = models.DateField()
    review_date = models.DateField()
    next_review_date = models.DateField()
    
    # Status and Classification
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', _('Draft')),
            ('PENDING_REVIEW', _('Pending Review')),
            ('APPROVED', _('Approved')),
            ('ACTIVE', _('Active')),
            ('SUPERSEDED', _('Superseded')),
            ('ARCHIVED', _('Archived'))
        ],
        default='DRAFT'
    )
    classification = models.CharField(
        max_length=30,
        choices=[
            ('PUBLIC', _('Public')),
            ('INTERNAL', _('Internal')),
            ('CONFIDENTIAL', _('Confidential')),
            ('RESTRICTED', _('Restricted'))
        ],
        default='INTERNAL'
    )
    
    class Meta:
        verbose_name = _('compliance policy')
        verbose_name_plural = _('compliance policies')
        ordering = ['-effective_date', 'name']
        unique_together = ['name', 'version']
        indexes = [
            models.Index(fields=['policy_type', 'status']),
            models.Index(fields=['effective_date', 'review_date']),
            models.Index(fields=['classification']),
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"


class ComplianceRequirement(AbstractBaseModel):
    """
    Specific compliance requirements from frameworks
    """
    requirement_id = models.CharField(max_length=50, unique=True)
    framework = models.ForeignKey(
        RegulatoryFramework,
        on_delete=models.CASCADE,
        related_name='requirements'
    )
    policy = models.ForeignKey(
        CompliancePolicy,
        on_delete=models.CASCADE,
        related_name='requirements'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirement_type = models.CharField(
        max_length=50,
        choices=[
            ('MANDATORY', _('Mandatory')),
            ('RECOMMENDED', _('Recommended')),
            ('OPTIONAL', _('Optional')),
            ('CONDITIONAL', _('Conditional'))
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
    implementation_criteria = models.JSONField(
        help_text=_('Criteria for implementing this requirement')
    )
    success_criteria = models.JSONField(
        help_text=_('Criteria for successful compliance')
    )
    evidence_requirements = models.JSONField(
        help_text=_('Required evidence for compliance')
    )
    testing_procedures = models.JSONField(
        help_text=_('Testing and validation procedures')
    )
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('CONTINUOUS', _('Continuous')),
            ('DAILY', _('Daily')),
            ('WEEKLY', _('Weekly')),
            ('MONTHLY', _('Monthly')),
            ('QUARTERLY', _('Quarterly')),
            ('ANNUALLY', _('Annually')),
            ('AS_NEEDED', _('As Needed'))
        ]
    )
    
    class Meta:
        verbose_name = _('compliance requirement')
        verbose_name_plural = _('compliance requirements')
        ordering = ['framework', 'priority', 'title']
        indexes = [
            models.Index(fields=['framework', 'requirement_type']),
            models.Index(fields=['priority', 'frequency']),
        ]

    def __str__(self):
        return f"{self.requirement_id} - {self.title}"


class ComplianceAssessment(AbstractBaseModel, StatusMixin):
    """
    Compliance assessments and reviews
    """
    assessment_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=150)
    assessment_type = models.CharField(
        max_length=50,
        choices=[
            ('INTERNAL_AUDIT', _('Internal Audit')),
            ('EXTERNAL_AUDIT', _('External Audit')),
            ('SELF_ASSESSMENT', _('Self Assessment')),
            ('REGULATORY_EXAM', _('Regulatory Examination')),
            ('THIRD_PARTY_REVIEW', _('Third-party Review')),
            ('CONTINUOUS_MONITORING', _('Continuous Monitoring'))
        ]
    )
    scope = models.JSONField(
        help_text=_('Assessment scope and coverage')
    )
    frameworks = models.ManyToManyField(
        RegulatoryFramework,
        related_name='assessments'
    )
    policies = models.ManyToManyField(
        CompliancePolicy,
        related_name='assessments'
    )
    
    # Timeline
    planned_start_date = models.DateField()
    planned_end_date = models.DateField()
    actual_start_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    
    # Team
    lead_assessor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='led_assessments'
    )
    assessors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='participated_assessments'
    )
    external_assessors = models.JSONField(
        null=True,
        blank=True,
        help_text=_('External assessment team details')
    )
    
    # Results
    overall_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    risk_rating = models.CharField(
        max_length=20,
        choices=[
            ('LOW', _('Low Risk')),
            ('MEDIUM', _('Medium Risk')),
            ('HIGH', _('High Risk')),
            ('CRITICAL', _('Critical Risk'))
        ],
        null=True,
        blank=True
    )
    findings_summary = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('compliance assessment')
        verbose_name_plural = _('compliance assessments')
        ordering = ['-actual_start_date', '-planned_start_date']
        indexes = [
            models.Index(fields=['assessment_type', 'status']),
            models.Index(fields=['lead_assessor']),
            models.Index(fields=['planned_start_date', 'planned_end_date']),
        ]

    def __str__(self):
        return f"{self.name} ({self.assessment_type})"


class ComplianceFinding(AbstractBaseModel):
    """
    Individual findings from compliance assessments
    """
    finding_id = models.CharField(max_length=50, unique=True)
    assessment = models.ForeignKey(
        ComplianceAssessment,
        on_delete=models.CASCADE,
        related_name='findings'
    )
    requirement = models.ForeignKey(
        ComplianceRequirement,
        on_delete=models.CASCADE,
        related_name='findings'
    )
    finding_type = models.CharField(
        max_length=30,
        choices=[
            ('DEFICIENCY', _('Deficiency')),
            ('GAP', _('Gap')),
            ('WEAKNESS', _('Weakness')),
            ('VIOLATION', _('Violation')),
            ('OBSERVATION', _('Observation')),
            ('BEST_PRACTICE', _('Best Practice'))
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
    title = models.CharField(max_length=200)
    description = models.TextField()
    impact_assessment = models.TextField()
    root_cause = models.TextField()
    evidence = models.JSONField(
        help_text=_('Supporting evidence and documentation')
    )
    recommendation = models.TextField()
    management_response = models.TextField(blank=True)
    
    # Remediation
    remediation_plan = models.TextField(blank=True)
    target_completion_date = models.DateField(null=True, blank=True)
    actual_completion_date = models.DateField(null=True, blank=True)
    responsible_party = models.UUIDField(
        null=True,
        blank=True,
        help_text=_('Responsible party for remediation')
    )
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('OPEN', _('Open')),
            ('IN_PROGRESS', _('In Progress')),
            ('PENDING_VALIDATION', _('Pending Validation')),
            ('RESOLVED', _('Resolved')),
            ('ACCEPTED_RISK', _('Accepted Risk')),
            ('DEFERRED', _('Deferred'))
        ],
        default='OPEN'
    )
    
    class Meta:
        verbose_name = _('compliance finding')
        verbose_name_plural = _('compliance findings')
        ordering = ['-created_at', 'severity']
        indexes = [
            models.Index(fields=['assessment', 'finding_type']),
            models.Index(fields=['severity', 'status']),
            models.Index(fields=['target_completion_date']),
        ]

    def __str__(self):
        return f"{self.finding_id} - {self.title}"


class ComplianceMonitoring(AbstractBaseModel):
    """
    Ongoing compliance monitoring and tracking
    """
    monitoring_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=150)
    monitoring_type = models.CharField(
        max_length=50,
        choices=[
            ('KPI_MONITORING', _('KPI Monitoring')),
            ('THRESHOLD_MONITORING', _('Threshold Monitoring')),
            ('EXCEPTION_MONITORING', _('Exception Monitoring')),
            ('TREND_ANALYSIS', _('Trend Analysis')),
            ('AUTOMATED_CONTROLS', _('Automated Controls')),
            ('MANUAL_REVIEWS', _('Manual Reviews'))
        ]
    )
    requirements = models.ManyToManyField(
        ComplianceRequirement,
        related_name='monitoring'
    )
    monitoring_criteria = models.JSONField(
        help_text=_('Criteria and parameters for monitoring')
    )
    thresholds = models.JSONField(
        help_text=_('Alert thresholds and limits')
    )
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('REAL_TIME', _('Real-time')),
            ('HOURLY', _('Hourly')),
            ('DAILY', _('Daily')),
            ('WEEKLY', _('Weekly')),
            ('MONTHLY', _('Monthly')),
            ('QUARTERLY', _('Quarterly'))
        ]
    )
    
    # Configuration
    data_sources = models.JSONField(
        help_text=_('Data sources for monitoring')
    )
    calculation_rules = models.JSONField(
        help_text=_('Rules for calculating compliance metrics')
    )
    notification_rules = models.JSONField(
        help_text=_('Rules for generating notifications')
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    last_execution = models.DateTimeField(null=True, blank=True)
    next_execution = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('compliance monitoring')
        verbose_name_plural = _('compliance monitoring')
        ordering = ['name']
        indexes = [
            models.Index(fields=['monitoring_type', 'is_active']),
            models.Index(fields=['frequency', 'next_execution']),
        ]

    def __str__(self):
        return f"{self.name} ({self.monitoring_type})"


class ComplianceMetric(AbstractBaseModel):
    """
    Compliance metrics and KPIs
    """
    metric_id = models.CharField(max_length=50, unique=True)
    monitoring = models.ForeignKey(
        ComplianceMonitoring,
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    metric_name = models.CharField(max_length=100)
    metric_type = models.CharField(
        max_length=30,
        choices=[
            ('COUNT', _('Count')),
            ('PERCENTAGE', _('Percentage')),
            ('RATIO', _('Ratio')),
            ('AMOUNT', _('Amount')),
            ('DURATION', _('Duration')),
            ('SCORE', _('Score'))
        ]
    )
    measurement_period = models.CharField(
        max_length=20,
        choices=[
            ('DAILY', _('Daily')),
            ('WEEKLY', _('Weekly')),
            ('MONTHLY', _('Monthly')),
            ('QUARTERLY', _('Quarterly')),
            ('YEARLY', _('Yearly'))
        ]
    )
    measurement_date = models.DateField()
    value = models.DecimalField(max_digits=15, decimal_places=4)
    target_value = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        null=True,
        blank=True
    )
    threshold_warning = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        null=True,
        blank=True
    )
    threshold_critical = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        null=True,
        blank=True
    )
    
    # Status based on thresholds
    status = models.CharField(
        max_length=20,
        choices=[
            ('COMPLIANT', _('Compliant')),
            ('WARNING', _('Warning')),
            ('NON_COMPLIANT', _('Non-compliant')),
            ('CRITICAL', _('Critical'))
        ]
    )
    
    # Additional context
    data_source = models.CharField(max_length=100)
    calculation_method = models.TextField()
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('compliance metric')
        verbose_name_plural = _('compliance metrics')
        ordering = ['-measurement_date', 'metric_name']
        unique_together = ['metric_id', 'measurement_date']
        indexes = [
            models.Index(fields=['monitoring', 'measurement_date']),
            models.Index(fields=['metric_type', 'status']),
            models.Index(fields=['measurement_period', 'measurement_date']),
        ]

    def __str__(self):
        return f"{self.metric_name} - {self.measurement_date}"


class RegulatoryReport(AbstractBaseModel):
    """
    Reports submitted to regulatory authorities
    """
    report_id = models.UUIDField(default=uuid.uuid4, unique=True)
    report_type = models.CharField(
        max_length=50,
        choices=[
            ('AML_REPORT', _('AML Report')),
            ('KYC_REPORT', _('KYC Report')),
            ('COMPLIANCE_REPORT', _('Compliance Report')),
            ('INCIDENT_REPORT', _('Incident Report')),
            ('BREACH_NOTIFICATION', _('Breach Notification')),
            ('AUDIT_REPORT', _('Audit Report')),
            ('RISK_ASSESSMENT', _('Risk Assessment Report')),
            ('OTHER', _('Other'))
        ]
    )
    framework = models.ForeignKey(
        RegulatoryFramework,
        on_delete=models.PROTECT,
        related_name='reports'
    )
    regulatory_authority = models.CharField(max_length=200)
    submission_deadline = models.DateTimeField()
    submission_date = models.DateTimeField(null=True, blank=True)
    
    # Report Content
    title = models.CharField(max_length=200)
    reporting_period_start = models.DateField()
    reporting_period_end = models.DateField()
    report_content = models.TextField()
    summary = models.TextField()
    
    # Status and Tracking
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', _('Draft')),
            ('PENDING_REVIEW', _('Pending Review')),
            ('APPROVED', _('Approved')),
            ('SUBMITTED', _('Submitted')),
            ('ACKNOWLEDGED', _('Acknowledged')),
            ('REJECTED', _('Rejected')),
            ('RESUBMITTED', _('Resubmitted'))
        ],
        default='DRAFT'
    )
    
    # Team
    prepared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='prepared_reports'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_reports'
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_reports'
    )
    
    # External References
    external_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text=_('External reference number from authority')
    )
    acknowledgment_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Acknowledgment details from authority')
    )
    
    class Meta:
        verbose_name = _('regulatory report')
        verbose_name_plural = _('regulatory reports')
        ordering = ['-submission_deadline', '-created_at']
        indexes = [
            models.Index(fields=['report_type', 'framework']),
            models.Index(fields=['status', 'submission_deadline']),
            models.Index(fields=['regulatory_authority']),
        ]

    def __str__(self):
        return f"{self.report_type} - {self.title}" 