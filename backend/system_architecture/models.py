from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel


class SystemComponent(AbstractBaseModel):
    """
    Model for system components and services
    """
    name = models.CharField(max_length=100, unique=True)
    component_type = models.CharField(
        max_length=50,
        choices=[
            ('SERVICE', _('Microservice')),
            ('DATABASE', _('Database')),
            ('CACHE', _('Cache Service')),
            ('QUEUE', _('Message Queue')),
            ('STORAGE', _('Storage Service')),
            ('INTEGRATION', _('Integration Service'))
        ]
    )
    description = models.TextField()
    version = models.CharField(max_length=20)
    configuration = models.JSONField(
        help_text=_('Component configuration')
    )
    dependencies = models.JSONField(
        help_text=_('Component dependencies')
    )
    health_check = models.JSONField(
        help_text=_('Health check configuration')
    )
    metrics_config = models.JSONField(
        help_text=_('Performance metrics configuration')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', _('Active')),
            ('INACTIVE', _('Inactive')),
            ('MAINTENANCE', _('Maintenance')),
            ('DEPRECATED', _('Deprecated')),
            ('FAILED', _('Failed'))
        ],
        default='ACTIVE'
    )
    is_critical = models.BooleanField(
        help_text=_('Whether component is critical')
    )
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_components'
    )
    
    class Meta:
        verbose_name = _('system component')
        verbose_name_plural = _('system components')
        ordering = ['name']
        indexes = [
            models.Index(fields=['component_type', 'status']),
            models.Index(fields=['is_critical']),
        ]

    def __str__(self):
        return f"{self.name} ({self.component_type})"

class SystemConfiguration(AbstractBaseModel):
    """
    Model for system-wide configuration
    """
    name = models.CharField(max_length=100, unique=True)
    config_type = models.CharField(
        max_length=50,
        choices=[
            ('SYSTEM', _('System Configuration')),
            ('SECURITY', _('Security Configuration')),
            ('INTEGRATION', _('Integration Configuration')),
            ('MONITORING', _('Monitoring Configuration')),
            ('FEATURE', _('Feature Flags')),
            ('CUSTOM', _('Custom Configuration'))
        ]
    )
    description = models.TextField()
    configuration = models.JSONField(
        help_text=_('Configuration settings')
    )
    environment = models.CharField(
        max_length=20,
        choices=[
            ('DEV', _('Development')),
            ('TEST', _('Testing')),
            ('STAGING', _('Staging')),
            ('PROD', _('Production'))
        ]
    )
    is_encrypted = models.BooleanField(
        help_text=_('Whether values are encrypted')
    )
    version = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    last_modified = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='modified_configs'
    )
    
    class Meta:
        verbose_name = _('system configuration')
        verbose_name_plural = _('system configurations')
        unique_together = ['name', 'environment']
        ordering = ['name']
        indexes = [
            models.Index(fields=['config_type', 'environment']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.environment})"

class SystemMetric(AbstractBaseModel):
    """
    Model for system performance metrics
    """
    name = models.CharField(max_length=100)
    metric_type = models.CharField(
        max_length=50,
        choices=[
            ('PERFORMANCE', _('Performance Metric')),
            ('RESOURCE', _('Resource Usage')),
            ('AVAILABILITY', _('Availability')),
            ('ERROR_RATE', _('Error Rate')),
            ('LATENCY', _('Latency')),
            ('CUSTOM', _('Custom Metric'))
        ]
    )
    component = models.ForeignKey(
        SystemComponent,
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    value = models.JSONField(
        help_text=_('Metric value and metadata')
    )
    unit = models.CharField(max_length=50)
    timestamp = models.DateTimeField()
    aggregation_period = models.CharField(
        max_length=20,
        choices=[
            ('MINUTE', _('Per Minute')),
            ('HOUR', _('Per Hour')),
            ('DAY', _('Per Day')),
            ('WEEK', _('Per Week')),
            ('MONTH', _('Per Month'))
        ]
    )
    thresholds = models.JSONField(
        help_text=_('Alert thresholds')
    )
    tags = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Metric tags')
    )
    
    class Meta:
        verbose_name = _('system metric')
        verbose_name_plural = _('system metrics')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['component', 'metric_type']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['aggregation_period']),
        ]

    def __str__(self):
        return f"{self.component.name} - {self.name}"

class SystemEvent(AbstractBaseModel):
    """
    Model for system events and notifications
    """
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('DEPLOYMENT', _('Deployment Event')),
            ('CONFIGURATION', _('Configuration Change')),
            ('SCALING', _('Scaling Event')),
            ('MAINTENANCE', _('Maintenance Event')),
            ('INCIDENT', _('Incident Event')),
            ('ALERT', _('System Alert'))
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
    component = models.ForeignKey(
        SystemComponent,
        on_delete=models.CASCADE,
        related_name='events'
    )
    event_data = models.JSONField(
        help_text=_('Event details')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('NEW', _('New')),
            ('ACKNOWLEDGED', _('Acknowledged')),
            ('IN_PROGRESS', _('In Progress')),
            ('RESOLVED', _('Resolved')),
            ('CLOSED', _('Closed'))
        ],
        default='NEW'
    )
    resolution = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Resolution details')
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_events'
    )
    
    class Meta:
        verbose_name = _('system event')
        verbose_name_plural = _('system events')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'severity']),
            models.Index(fields=['component', 'status']),
            models.Index(fields=['assigned_to']),
        ]

    def __str__(self):
        return f"{self.component.name} - {self.event_type} ({self.severity})"

class Deployment(AbstractBaseModel):
    """
    Model for tracking system deployments
    """
    deployment_id = models.CharField(max_length=100, unique=True)
    environment = models.CharField(
        max_length=20,
        choices=[
            ('DEV', _('Development')),
            ('TEST', _('Testing')),
            ('STAGING', _('Staging')),
            ('PROD', _('Production'))
        ]
    )
    components = models.ManyToManyField(
        SystemComponent,
        related_name='deployments'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('PLANNED', _('Planned')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('ROLLED_BACK', _('Rolled Back'))
        ],
        default='PLANNED'
    )
    deployment_config = models.JSONField(
        help_text=_('Deployment configuration')
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    deployed_by = models.UUIDField()
    
    class Meta:
        verbose_name = _('deployment')
        verbose_name_plural = _('deployments')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['environment', 'status']),
            models.Index(fields=['deployment_id']),
        ]

    def __str__(self):
        return f"{self.environment} - {self.deployment_id}"

class CloudResource(AbstractBaseModel):
    """
    Model for tracking cloud resources
    """
    resource_id = models.CharField(max_length=100, unique=True)
    resource_type = models.CharField(
        max_length=50,
        choices=[
            ('VM', _('Virtual Machine')),
            ('CONTAINER', _('Container')),
            ('DATABASE', _('Database')),
            ('STORAGE', _('Storage')),
            ('NETWORK', _('Network Resource')),
            ('FUNCTION', _('Serverless Function')),
            ('OTHER', _('Other'))
        ]
    )
    provider = models.CharField(
        max_length=20,
        choices=[
            ('AWS', _('Amazon Web Services')),
            ('AZURE', _('Microsoft Azure')),
            ('GCP', _('Google Cloud Platform')),
            ('OTHER', _('Other'))
        ]
    )
    region = models.CharField(max_length=50)
    specifications = models.JSONField(
        help_text=_('Resource specifications')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('RUNNING', _('Running')),
            ('STOPPED', _('Stopped')),
            ('TERMINATED', _('Terminated')),
            ('ERROR', _('Error'))
        ]
    )
    cost_center = models.CharField(max_length=50)
    tags = models.JSONField(default=dict)
    
    class Meta:
        verbose_name = _('cloud resource')
        verbose_name_plural = _('cloud resources')
        ordering = ['resource_type', 'resource_id']
        indexes = [
            models.Index(fields=['resource_type', 'provider']),
            models.Index(fields=['status', 'region']),
        ]

    def __str__(self):
        return f"{self.resource_type} - {self.resource_id}"

class ArchitectureDocument(AbstractBaseModel):
    """
    Model for storing architecture documentation
    """
    title = models.CharField(max_length=255)
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('DESIGN', _('Design Document')),
            ('DIAGRAM', _('Architecture Diagram')),
            ('SPEC', _('Technical Specification')),
            ('GUIDE', _('Implementation Guide')),
            ('OTHER', _('Other'))
        ]
    )
    content = models.TextField()
    version = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', _('Draft')),
            ('REVIEW', _('Under Review')),
            ('APPROVED', _('Approved')),
            ('DEPRECATED', _('Deprecated'))
        ],
        default='DRAFT'
    )
    components = models.ManyToManyField(
        SystemComponent,
        related_name='documents',
        blank=True
    )
    attachments = models.JSONField(
        null=True,
        blank=True,
        help_text=_('References to attached files')
    )
    author = models.UUIDField()
    reviewers = models.JSONField(default=list)
    
    class Meta:
        verbose_name = _('architecture document')
        verbose_name_plural = _('architecture documents')
        unique_together = ['title', 'version']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document_type', 'status']),
            models.Index(fields=['title', 'version']),
        ]

    def __str__(self):
        return f"{self.title} v{self.version}"
