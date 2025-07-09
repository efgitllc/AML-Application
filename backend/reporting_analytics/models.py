from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel
from django.core.validators import MinValueValidator, MaxValueValidator

from customer_management.models import Customer
from transaction_monitoring.models import Transaction
from case_management.models import Case, SARCase

class Report(AbstractBaseModel):
    """
    Model for managing analytical reports
    """
    name = models.CharField(max_length=200)
    description = models.TextField()
    report_type = models.CharField(
        max_length=50,
        choices=[
            ('DASHBOARD', _('Dashboard Report')),
            ('REGULATORY', _('Regulatory Report')),
            ('ANALYTICS', _('Analytics Report')),
            ('COMPLIANCE', _('Compliance Report')),
            ('CUSTOM', _('Custom Report'))
        ]
    )
    parameters = models.JSONField(
        default=dict,
        help_text=_('Report generation parameters')
    )
    schedule = models.JSONField(
        default=dict,
        help_text=_('Report scheduling configuration')
    )
    recipients = models.JSONField(
        default=list,
        help_text=_('List of report recipients')
    )
    format = models.CharField(
        max_length=20,
        choices=[
            ('PDF', _('PDF')),
            ('EXCEL', _('Excel')),
            ('CSV', _('CSV')),
            ('JSON', _('JSON')),
            ('HTML', _('HTML'))
        ],
        default='PDF'
    )
    is_active = models.BooleanField(default=True)
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('report')
        verbose_name_plural = _('reports')
        ordering = ['name']
        indexes = [
            models.Index(fields=['report_type', 'is_active']),
            models.Index(fields=['next_run']),
        ]

    def __str__(self):
        return self.name

class ReportExecution(AbstractBaseModel):
    """
    Model for tracking report execution history
    """
    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        related_name='executions'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('RUNNING', _('Running')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='PENDING'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    execution_time = models.DurationField(null=True, blank=True)
    file_path = models.FileField(
        upload_to='reports/%Y/%m/',
        null=True,
        blank=True
    )
    file_size = models.BigIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    error_message = models.TextField(blank=True)
    parameters_used = models.JSONField(
        default=dict,
        help_text=_('Parameters used for this execution')
    )
    record_count = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    executed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='executed_reports'
    )

    class Meta:
        verbose_name = _('report execution')
        verbose_name_plural = _('report executions')
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['report', 'status']),
            models.Index(fields=['start_time']),
            models.Index(fields=['executed_by']),
        ]

    def __str__(self):
        return f"{self.report.name} - {self.start_time}"

class RegulatoryReport(AbstractBaseModel):
    """
    Model for regulatory reports and filings
    """
    report_type = models.CharField(
        max_length=50,
        choices=[
            ('STR', _('Suspicious Transaction Report')),
            ('SAR', _('Suspicious Activity Report')),
            ('CTR', _('Cash Transaction Report')),
            ('FBAR', _('Foreign Bank Account Report')),
            ('8300', _('Form 8300')),
            ('GOAML', _('goAML Report')),
            ('FINTRAC', _('FINTRAC Report')),
            ('OTHER', _('Other Regulatory Report'))
        ]
    )
    reporting_period_start = models.DateField()
    reporting_period_end = models.DateField()
    submission_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', _('Draft')),
            ('IN_REVIEW', _('In Review')),
            ('APPROVED', _('Approved')),
            ('SUBMITTED', _('Submitted')),
            ('ACKNOWLEDGED', _('Acknowledged')),
            ('REJECTED', _('Rejected'))
        ],
        default='DRAFT'
    )
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        help_text=_('Reference number from regulatory authority')
    )
    data = models.JSONField(
        default=dict,
        help_text=_('Report data in structured format')
    )
    file_path = models.FileField(
        upload_to='regulatory_reports/%Y/%m/',
        null=True,
        blank=True
    )
    prepared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='prepared_regulatory_reports'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_regulatory_reports'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_regulatory_reports'
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_regulatory_reports'
    )

    class Meta:
        verbose_name = _('regulatory report')
        verbose_name_plural = _('regulatory reports')
        ordering = ['-due_date']
        indexes = [
            models.Index(fields=['report_type', 'status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['submission_date']),
        ]

    def __str__(self):
        return f"{self.report_type} - {self.reporting_period_start} to {self.reporting_period_end}"

class AnalyticsMetric(AbstractBaseModel):
    """
    Model for storing analytics metrics and KPIs
    """
    metric_name = models.CharField(max_length=100)
    metric_type = models.CharField(
        max_length=50,
        choices=[
            ('COUNT', _('Count')),
            ('SUM', _('Sum')),
            ('AVERAGE', _('Average')),
            ('PERCENTAGE', _('Percentage')),
            ('RATIO', _('Ratio')),
            ('TREND', _('Trend'))
        ]
    )
    category = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER', _('Customer Metrics')),
            ('TRANSACTION', _('Transaction Metrics')),
            ('ALERT', _('Alert Metrics')),
            ('CASE', _('Case Metrics')),
            ('COMPLIANCE', _('Compliance Metrics')),
            ('RISK', _('Risk Metrics')),
            ('OPERATIONAL', _('Operational Metrics'))
        ]
    )
    value = models.DecimalField(max_digits=20, decimal_places=4)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    dimensions = models.JSONField(
        default=dict,
        help_text=_('Dimensional attributes for the metric')
    )
    metadata = models.JSONField(
        default=dict,
        help_text=_('Additional metric metadata')
    )

    class Meta:
        verbose_name = _('analytics metric')
        verbose_name_plural = _('analytics metrics')
        ordering = ['-period_end']
        indexes = [
            models.Index(fields=['metric_name', 'period_end']),
            models.Index(fields=['category', 'metric_type']),
            models.Index(fields=['period_start', 'period_end']),
        ]

    def __str__(self):
        return f"{self.metric_name}: {self.value}"

class Dashboard(AbstractBaseModel):
    """
    Model for dashboard configurations
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    layout = models.JSONField(
        default=dict,
        help_text=_('Dashboard layout configuration')
    )
    widgets = models.JSONField(
        default=list,
        help_text=_('List of dashboard widgets')
    )
    filters = models.JSONField(
        default=dict,
        help_text=_('Default filters for the dashboard')
    )
    permissions = models.JSONField(
        default=dict,
        help_text=_('User/role permissions for the dashboard')
    )
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    refresh_interval = models.IntegerField(
        default=300,
        validators=[MinValueValidator(60), MaxValueValidator(3600)],
        help_text=_('Refresh interval in seconds')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_dashboards'
    )

    class Meta:
        verbose_name = _('dashboard')
        verbose_name_plural = _('dashboards')
        ordering = ['name']
        indexes = [
            models.Index(fields=['is_public', 'is_active']),
        ]

    def __str__(self):
        return self.name

class Widget(AbstractBaseModel):
    """
    Model for dashboard widgets
    """
    name = models.CharField(max_length=100)
    widget_type = models.CharField(
        max_length=50,
        choices=[
            ('CHART', _('Chart')),
            ('TABLE', _('Table')),
            ('METRIC', _('Metric')),
            ('MAP', _('Map')),
            ('TIMELINE', _('Timeline')),
            ('GAUGE', _('Gauge')),
            ('TEXT', _('Text'))
        ]
    )
    configuration = models.JSONField(
        default=dict,
        help_text=_('Widget configuration and settings')
    )
    data_source = models.JSONField(
        default=dict,
        help_text=_('Data source configuration')
    )
    size = models.JSONField(
        default=dict,
        help_text=_('Widget size configuration')
    )
    position = models.JSONField(
        default=dict,
        help_text=_('Widget position on dashboard')
    )
    is_active = models.BooleanField(default=True)
    
    # Explicit user tracking fields with unique related_names
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='analytics_widget_created'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='analytics_widget_updated'
    )

    class Meta:
        verbose_name = _('analytics widget')
        verbose_name_plural = _('analytics widgets')
        ordering = ['name']
        indexes = [
            models.Index(fields=['widget_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.widget_type})"

class DataSource(AbstractBaseModel):
    """
    Model for defining data sources for reports and analytics
    """
    name = models.CharField(max_length=100, unique=True)
    source_type = models.CharField(
        max_length=50,
        choices=[
            ('DATABASE', _('Database Query')),
            ('API', _('API Endpoint')),
            ('FILE', _('File Import')),
            ('CALCULATED', _('Calculated Field'))
        ]
    )
    connection_config = models.JSONField(
        default=dict,
        help_text=_('Connection configuration')
    )
    query_config = models.JSONField(
        default=dict,
        help_text=_('Query or retrieval configuration')
    )
    schema = models.JSONField(
        default=dict,
        help_text=_('Data schema definition')
    )
    refresh_schedule = models.JSONField(
        default=dict,
        help_text=_('Data refresh schedule')
    )
    is_active = models.BooleanField(default=True)
    last_refresh = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('data source')
        verbose_name_plural = _('data sources')
        ordering = ['name']
        indexes = [
            models.Index(fields=['source_type', 'is_active']),
            models.Index(fields=['last_refresh']),
        ]

    def __str__(self):
        return self.name

class ReportTemplate(AbstractBaseModel):
    """
    Model for report templates
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    template_type = models.CharField(
        max_length=50,
        choices=[
            ('REGULATORY', _('Regulatory Report')),
            ('ANALYTICAL', _('Analytical Report')),
            ('OPERATIONAL', _('Operational Report')),
            ('EXECUTIVE', _('Executive Summary'))
        ]
    )
    template_content = models.TextField(
        help_text=_('Template content with placeholders')
    )
    parameters = models.JSONField(
        default=dict,
        help_text=_('Template parameters definition')
    )
    styling = models.JSONField(
        default=dict,
        help_text=_('Report styling configuration')
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('report template')
        verbose_name_plural = _('report templates')
        ordering = ['name']
        indexes = [
            models.Index(fields=['template_type', 'is_active']),
        ]

    def __str__(self):
        return self.name

class PerformanceMetric(AbstractBaseModel):
    """
    Model for tracking system and business performance metrics
    """
    metric_name = models.CharField(max_length=100)
    metric_category = models.CharField(
        max_length=50,
        choices=[
            ('SYSTEM', _('System Performance')),
            ('BUSINESS', _('Business Performance')),
            ('COMPLIANCE', _('Compliance Performance')),
            ('USER', _('User Performance'))
        ]
    )
    value = models.FloatField()
    unit = models.CharField(max_length=50, blank=True)
    threshold_warning = models.FloatField(null=True, blank=True)
    threshold_critical = models.FloatField(null=True, blank=True)
    measurement_time = models.DateTimeField()
    tags = models.JSONField(
        default=dict,
        help_text=_('Metric tags and labels')
    )

    class Meta:
        verbose_name = _('performance metric')
        verbose_name_plural = _('performance metrics')
        ordering = ['-measurement_time']
        indexes = [
            models.Index(fields=['metric_name', 'measurement_time']),
            models.Index(fields=['metric_category']),
        ]

    def __str__(self):
        return f"{self.metric_name}: {self.value} {self.unit}"
