from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import AbstractBaseModel, RiskLevelMixin
from core.constants import RiskLevel
from customer_management.models import Customer
from transaction_monitoring.models import Transaction


class RiskCategory(AbstractBaseModel):
    """
    Model for risk categories and factors
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    category_type = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER', _('Customer Risk')),
            ('TRANSACTION', _('Transaction Risk')),
            ('GEOGRAPHIC', _('Geographic Risk')),
            ('PRODUCT', _('Product Risk')),
            ('CHANNEL', _('Channel Risk')),
            ('BUSINESS', _('Business Risk'))
        ]
    )
    weight = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_('Category weight in overall risk calculation')
    )
    risk_factors = models.JSONField(
        default=dict,
        help_text=_('Risk factors and their weights')
    )
    scoring_method = models.CharField(
        max_length=50,
        choices=[
            ('WEIGHTED_AVERAGE', _('Weighted Average')),
            ('MAXIMUM', _('Maximum Risk')),
            ('MULTIPLICATIVE', _('Multiplicative')),
            ('CUSTOM', _('Custom Formula'))
        ]
    )
    custom_formula = models.JSONField(
        default=dict,
        help_text=_('Custom scoring formula configuration')
    )
    thresholds = models.JSONField(
        default=dict,
        help_text=_('Risk level thresholds')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('risk category')
        verbose_name_plural = _('risk categories')
        ordering = ['name']
        indexes = [
            models.Index(fields=['category_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category_type})"

class RiskFactor(AbstractBaseModel):
    """
    Model for risk factors used in risk scoring
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER', _('Customer')),
            ('TRANSACTION', _('Transaction')),
            ('GEOGRAPHIC', _('Geographic')),
            ('PRODUCT', _('Product')),
            ('CHANNEL', _('Channel')),
            ('BUSINESS', _('Business')),
        ]
    )
    weight = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_('Weight factor (0-1)')
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('risk factor')
        verbose_name_plural = _('risk factors')
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category})"

class Region(AbstractBaseModel):
    """
    Model for managing geographical regions and their risk profiles
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    parent_region = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_regions'
    )
    risk_level = models.CharField(
        max_length=20,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW
    )
    risk_factors = models.JSONField(
        default=dict,
        help_text=_('Specific risk factors for this region')
    )
    sanctions_status = models.BooleanField(default=False)
    fatf_status = models.CharField(
        max_length=50,
        choices=[
            ('COMPLIANT', _('Compliant')),
            ('LARGELY_COMPLIANT', _('Largely Compliant')),
            ('PARTIALLY_COMPLIANT', _('Partially Compliant')),
            ('NON_COMPLIANT', _('Non-Compliant')),
            ('NOT_RATED', _('Not Rated'))
        ],
        default='NOT_RATED'
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('region')
        verbose_name_plural = _('regions')
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['risk_level']),
            models.Index(fields=['sanctions_status']),
        ]

    def __str__(self):
        return self.name

class Product(AbstractBaseModel):
    """
    Model for managing products and their risk profiles
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    category = models.CharField(
        max_length=50,
        choices=[
            ('ACCOUNT', _('Account')),
            ('LOAN', _('Loan')),
            ('INVESTMENT', _('Investment')),
            ('INSURANCE', _('Insurance')),
            ('TRADE_FINANCE', _('Trade Finance')),
            ('PAYMENT_SERVICE', _('Payment Service')),
            ('OTHER', _('Other'))
        ]
    )
    description = models.TextField()
    risk_level = models.CharField(
        max_length=20,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW
    )
    risk_factors = models.JSONField(
        default=dict,
        help_text=_('Specific risk factors for this product')
    )
    regulatory_requirements = models.JSONField(
        default=dict,
        help_text=_('Regulatory requirements and restrictions')
    )
    kyc_requirements = models.JSONField(
        default=dict,
        help_text=_('KYC requirements for this product')
    )
    transaction_limits = models.JSONField(
        default=dict,
        help_text=_('Transaction limits and thresholds')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('product')
        verbose_name_plural = _('products')
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['category', 'risk_level']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name

class RiskAssessment(AbstractBaseModel):
    """
    Model for risk assessments
    """
    assessment_type = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER', _('Customer Assessment')),
            ('TRANSACTION', _('Transaction Assessment')),
            ('PERIODIC', _('Periodic Review')),
            ('TRIGGERED', _('Triggered Review'))
        ]
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='risk_assessments'
    )
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='risk_assessments'
    )
    risk_scores = models.JSONField(
        default=dict,
        help_text=_('Category-wise risk scores')
    )
    overall_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    risk_level = models.CharField(
        max_length=20,
        choices=[
            ('LOW', _('Low Risk')),
            ('MEDIUM', _('Medium Risk')),
            ('HIGH', _('High Risk')),
            ('CRITICAL', _('Critical Risk'))
        ]
    )
    assessment_date = models.DateTimeField()
    next_review_date = models.DateTimeField()
    factors_considered = models.JSONField(
        default=dict,
        help_text=_('Risk factors considered in assessment')
    )
    mitigating_factors = models.JSONField(
        default=dict,
        help_text=_('Risk mitigating factors')
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reviewed_assessments'
    )
    approval_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('APPROVED', _('Approved')),
            ('REJECTED', _('Rejected')),
            ('UNDER_REVIEW', _('Under Review'))
        ],
        default='PENDING'
    )

    class Meta:
        verbose_name = _('risk assessment')
        verbose_name_plural = _('risk assessments')
        ordering = ['-assessment_date']
        indexes = [
            models.Index(fields=['assessment_type', 'customer']),
            models.Index(fields=['risk_level', 'approval_status']),
            models.Index(fields=['next_review_date']),
        ]

    def __str__(self):
        return f"{self.customer} - {self.assessment_type} ({self.overall_score})"

class RiskMatrix(AbstractBaseModel):
    """
    Model for risk assessment matrices
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    matrix_type = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER', _('Customer Matrix')),
            ('TRANSACTION', _('Transaction Matrix')),
            ('PRODUCT', _('Product Matrix')),
            ('COMBINED', _('Combined Matrix'))
        ]
    )
    risk_levels = models.JSONField(
        default=dict,
        help_text=_('Risk level definitions')
    )
    scoring_criteria = models.JSONField(
        default=dict,
        help_text=_('Scoring criteria for each cell')
    )
    thresholds = models.JSONField(
        default=dict,
        help_text=_('Threshold values for risk levels')
    )
    mitigation_rules = models.JSONField(
        default=dict,
        help_text=_('Risk mitigation rules')
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('risk matrix')
        verbose_name_plural = _('risk matrices')
        ordering = ['name']
        indexes = [
            models.Index(fields=['matrix_type', 'is_active']),
        ]

    def __str__(self):
        return self.name

class RiskModelVersion(AbstractBaseModel):
    """
    Model for versioning risk models
    """
    model_name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    model_type = models.CharField(
        max_length=50,
        choices=[
            ('SCORING', _('Scoring Model')),
            ('MATRIX', _('Risk Matrix')),
            ('RULES', _('Rule-based Model')),
            ('ML', _('Machine Learning Model'))
        ]
    )
    model_parameters = models.JSONField(
        default=dict,
        help_text=_('Model parameters and configuration')
    )
    training_data = models.JSONField(
        default=dict,
        help_text=_('Training data summary')
    )
    performance_metrics = models.JSONField(
        default=dict,
        help_text=_('Model performance metrics')
    )
    validation_results = models.JSONField(
        default=dict,
        help_text=_('Model validation results')
    )
    is_active = models.BooleanField(default=True)
    deployed_at = models.DateTimeField(auto_now_add=True)
    deployed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='deployed_models'
    )

    class Meta:
        verbose_name = _('risk model version')
        verbose_name_plural = _('risk model versions')
        unique_together = ['model_name', 'version']
        ordering = ['-deployed_at']
        indexes = [
            models.Index(fields=['model_name', 'is_active']),
            models.Index(fields=['model_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.model_name} v{self.version}"

class EDDRequest(AbstractBaseModel):
    """
    Enhanced Due Diligence (EDD) request raised for a customer that has been
    identified as high-risk through onboarding, periodic review, or a triggered
    event (e.g. unusual transaction pattern).
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="edd_requests",
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="edd_requests_created",
    )
    request_date = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()
    risk_level_at_request = models.CharField(
        max_length=20,
        choices=RiskLevel.choices,
        default=RiskLevel.HIGH,
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", _("Pending")),
            ("UNDER_REVIEW", _("Under Review")),
            ("COMPLETED", _("Completed")),
            ("REJECTED", _("Rejected")),
            ("CANCELLED", _("Cancelled")),
        ],
        default="PENDING",
    )
    escalation_required = models.BooleanField(default=False)
    due_date = models.DateTimeField()
    completion_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("EDD request")
        verbose_name_plural = _("EDD requests")
        ordering = ["-request_date"]
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['risk_level_at_request']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"EDD Request for {self.customer} - {self.status}"

class EDDReview(AbstractBaseModel):
    """
    Review notes by compliance analysts as part of an EDD request lifecycle.
    Multiple reviews can exist (first line, second line, quality assurance).
    """
    request = models.ForeignKey(
        EDDRequest,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="edd_reviews_performed",
    )
    review_date = models.DateTimeField(auto_now_add=True)
    findings = models.JSONField(
        default=dict,
        help_text=_("Structured findings captured during review"),
    )
    recommendation = models.CharField(
        max_length=20,
        choices=[
            ("APPROVE", _("Approve")),
            ("REJECT", _("Reject")),
            ("ESCALATE", _("Escalate")),
        ],
    )
    risk_level_assessed = models.CharField(
        max_length=20,
        choices=RiskLevel.choices,
        default=RiskLevel.HIGH,
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = _("EDD review")
        verbose_name_plural = _("EDD reviews")
        ordering = ["-review_date"]
        indexes = [
            models.Index(fields=['request', 'recommendation']),
            models.Index(fields=['reviewer']),
        ]

    def __str__(self):
        return f"Review for {self.request} by {self.reviewer}"

class EDDApproval(AbstractBaseModel):
    """
    Final approval step for an EDD request issued by senior compliance /
    MLRO (Money Laundering Reporting Officer).
    """
    request = models.ForeignKey(
        EDDRequest,
        on_delete=models.CASCADE,
        related_name="approvals",
    )
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="edd_approvals_given",
    )
    approval_date = models.DateTimeField(auto_now_add=True)
    decision = models.CharField(
        max_length=20,
        choices=[
            ("APPROVED", _("Approved")),
            ("REJECTED", _("Rejected")),
        ],
    )
    comments = models.TextField(blank=True)

    class Meta:
        verbose_name = _("EDD approval")
        verbose_name_plural = _("EDD approvals")
        ordering = ["-approval_date"]
        indexes = [
            models.Index(fields=['request', 'decision']),
            models.Index(fields=['approver']),
        ]

    def __str__(self):
        return f"Approval for {self.request} - {self.decision}"

class RiskScore(AbstractBaseModel):
    """Enhanced risk scoring model with ML capabilities"""
    entity = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE,
        related_name='risk_scores'
    )
    base_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text=_('Base risk score calculated from static factors')
    )
    ml_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text=_('Machine learning based risk score')
    )
    behavioral_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text=_('Score based on behavioral analysis')
    )
    risk_factors = models.JSONField(
        default=dict,
        help_text=_('Detailed breakdown of risk factors')
    )
    historical_scores = models.JSONField(
        default=list,
        help_text=_('Historical risk score data')
    )
    last_assessment = models.DateTimeField(
        help_text=_('Timestamp of last risk assessment')
    )
    next_assessment = models.DateTimeField(
        help_text=_('Scheduled time for next assessment')
    )
    confidence_level = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text=_('Confidence level of the risk score')
    )

    class Meta:
        indexes = [
            models.Index(fields=['entity', 'base_score']),
            models.Index(fields=['last_assessment']),
            models.Index(fields=['next_assessment']),
        ]
        verbose_name = _('Risk Score')
        verbose_name_plural = _('Risk Scores')

    def __str__(self):
        return f"Risk Score for {self.entity} - {self.base_score}"
