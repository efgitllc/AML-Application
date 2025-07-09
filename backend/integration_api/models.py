from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel


class ExternalSystem(AbstractBaseModel):
    """
    Model for external system integrations
    """
    name = models.CharField(max_length=100, unique=True)
    system_type = models.CharField(
        max_length=50,
        choices=[
            ('BANKING', _('Banking System')),
            ('KYC', _('KYC Provider')),
            ('SCREENING', _('Screening Database')),
            ('REGULATORY', _('Regulatory System')),
            ('PAYMENT', _('Payment System')),
            ('CUSTOM', _('Custom Integration'))
        ]
    )
    description = models.TextField()
    base_url = models.URLField()
    auth_type = models.CharField(
        max_length=50,
        choices=[
            ('API_KEY', _('API Key')),
            ('OAUTH2', _('OAuth 2.0')),
            ('JWT', _('JWT Token')),
            ('BASIC', _('Basic Auth')),
            ('CERT', _('Certificate'))
        ]
    )
    auth_credentials = models.JSONField(
        help_text=_('Encrypted authentication credentials')
    )
    connection_params = models.JSONField(
        help_text=_('Additional connection parameters')
    )
    rate_limit = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Rate limiting configuration')
    )
    timeout_settings = models.JSONField(
        help_text=_('Timeout and retry settings')
    )
    is_active = models.BooleanField(default=True)
    health_check_url = models.CharField(max_length=200, blank=True)
    
    class Meta:
        verbose_name = _('external system')
        verbose_name_plural = _('external systems')
        ordering = ['name']
        indexes = [
            models.Index(fields=['system_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.system_type})"

class APIEndpoint(AbstractBaseModel):
    """
    Model for API endpoint configurations
    """
    system = models.ForeignKey(
        ExternalSystem,
        on_delete=models.CASCADE,
        related_name='endpoints'
    )
    name = models.CharField(max_length=100)
    endpoint_url = models.CharField(max_length=200)
    http_method = models.CharField(
        max_length=10,
        choices=[
            ('GET', 'GET'),
            ('POST', 'POST'),
            ('PUT', 'PUT'),
            ('PATCH', 'PATCH'),
            ('DELETE', 'DELETE')
        ]
    )
    request_schema = models.JSONField(
        help_text=_('Expected request payload schema')
    )
    response_schema = models.JSONField(
        help_text=_('Expected response schema')
    )
    headers = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Custom headers for endpoint')
    )
    query_params = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Query parameter definitions')
    )
    retry_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Retry configuration for endpoint')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('API endpoint')
        verbose_name_plural = _('API endpoints')
        unique_together = ['system', 'endpoint_url', 'http_method']
        ordering = ['system', 'name']
        indexes = [
            models.Index(fields=['system', 'is_active']),
            models.Index(fields=['http_method']),
        ]

    def __str__(self):
        return f"{self.system.name} - {self.name}"

class DataMapping(AbstractBaseModel):
    """
    Model for data field mappings
    """
    name = models.CharField(max_length=100)
    source_system = models.ForeignKey(
        ExternalSystem,
        on_delete=models.CASCADE,
        related_name='source_mappings'
    )
    target_system = models.ForeignKey(
        ExternalSystem,
        on_delete=models.CASCADE,
        related_name='target_mappings'
    )
    mapping_type = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER', _('Customer Data')),
            ('TRANSACTION', _('Transaction Data')),
            ('DOCUMENT', _('Document Data')),
            ('RISK', _('Risk Data')),
            ('CUSTOM', _('Custom Data'))
        ]
    )
    field_mappings = models.JSONField(
        help_text=_('Field mapping configurations')
    )
    transformation_rules = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Data transformation rules')
    )
    validation_rules = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Data validation rules')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('data mapping')
        verbose_name_plural = _('data mappings')
        ordering = ['source_system', 'mapping_type']
        indexes = [
            models.Index(fields=['source_system', 'target_system']),
            models.Index(fields=['mapping_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.source_system.name} → {self.target_system.name} ({self.mapping_type})"

class BatchJob(AbstractBaseModel):
    """
    Model for batch processing jobs
    """
    name = models.CharField(max_length=100)
    job_type = models.CharField(
        max_length=50,
        choices=[
            ('IMPORT', _('Data Import')),
            ('EXPORT', _('Data Export')),
            ('SYNC', _('Data Synchronization')),
            ('PROCESS', _('Batch Processing')),
            ('CLEANUP', _('Data Cleanup'))
        ]
    )
    source_system = models.ForeignKey(
        ExternalSystem,
        on_delete=models.CASCADE,
        related_name='source_jobs'
    )
    target_system = models.ForeignKey(
        ExternalSystem,
        on_delete=models.CASCADE,
        related_name='target_jobs'
    )
    data_mapping = models.ForeignKey(
        DataMapping,
        on_delete=models.SET_NULL,
        null=True,
        related_name='batch_jobs'
    )
    schedule = models.JSONField(
        help_text=_('Job schedule configuration')
    )
    filters = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Data filtering criteria')
    )
    batch_size = models.IntegerField(default=1000)
    timeout = models.IntegerField(
        help_text=_('Job timeout in seconds'),
        default=3600
    )
    retry_config = models.JSONField(
        help_text=_('Retry configuration for failed jobs')
    )
    notification_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Notification settings for job status')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('batch job')
        verbose_name_plural = _('batch jobs')
        ordering = ['name']
        indexes = [
            models.Index(fields=['job_type', 'is_active']),
            models.Index(fields=['source_system', 'target_system']),
        ]

    def __str__(self):
        return f"{self.name} ({self.job_type})"

class BatchJobExecution(AbstractBaseModel):
    """
    Model for tracking batch job executions
    """
    job = models.ForeignKey(
        BatchJob,
        on_delete=models.CASCADE,
        related_name='executions'
    )
    execution_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(
        max_length=50,
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
    total_records = models.IntegerField(default=0)
    processed_records = models.IntegerField(default=0)
    failed_records = models.IntegerField(default=0)
    error_details = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Details of any errors encountered')
    )
    performance_metrics = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Job performance metrics')
    )
    
    # User tracking
    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='triggered_jobs'
    )
    
    class Meta:
        verbose_name = _('batch job execution')
        verbose_name_plural = _('batch job executions')
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['job', '-start_time']),
            models.Index(fields=['status']),
            models.Index(fields=['execution_id']),
        ]

    def __str__(self):
        return f"{self.job.name} - {self.execution_id}"

class APIClient(AbstractBaseModel):
    """Enhanced API client management"""
    name = models.CharField(
        max_length=100,
        help_text=_('Name of the API client')
    )
    api_key = models.CharField(
        max_length=64,
        unique=True,
        help_text=_('Unique API key for authentication')
    )
    api_secret = models.CharField(
        max_length=256,
        help_text=_('API secret for request signing')
    )
    allowed_endpoints = models.JSONField(
        help_text=_('List of allowed API endpoints and methods')
    )
    rate_limit = models.IntegerField(
        help_text=_('Maximum requests per minute'),
        default=60
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_('Whether this API client is active')
    )
    last_access = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('Last API access timestamp')
    )
    ip_whitelist = models.JSONField(
        null=True,
        blank=True,
        help_text=_('List of allowed IP addresses')
    )
    access_level = models.CharField(
        max_length=20,
        choices=[
            ('READ', _('Read Only')),
            ('WRITE', _('Read Write')),
            ('ADMIN', _('Administrative'))
        ],
        default='READ',
        help_text=_('API access level')
    )
    expiry_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('API key expiration date')
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['api_key']),
            models.Index(fields=['is_active'])
        ]
        verbose_name = _('API Client')
        verbose_name_plural = _('API Clients')

    def __str__(self):
        return f"{self.name} ({self.access_level})"

class APIAccessLog(AbstractBaseModel):
    """API access logging"""
    client = models.ForeignKey(
        APIClient,
        on_delete=models.CASCADE,
        help_text=_('API client making the request')
    )
    endpoint = models.CharField(
        max_length=255,
        help_text=_('Accessed API endpoint')
    )
    method = models.CharField(
        max_length=10,
        help_text=_('HTTP method used')
    )
    ip_address = models.GenericIPAddressField(
        help_text=_('Client IP address')
    )
    request_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Request payload data')
    )
    response_status = models.IntegerField(
        help_text=_('HTTP response status code')
    )
    response_time = models.FloatField(
        help_text=_('Request processing time in seconds')
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['client', 'endpoint']),
            models.Index(fields=['created_at'])
        ]
        verbose_name = _('API Access Log')
        verbose_name_plural = _('API Access Logs')
