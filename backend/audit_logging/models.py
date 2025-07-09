from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel

class AuditLog(AbstractBaseModel):
    """
    Model for audit trail logging
    """
    action = models.CharField(
        max_length=50,
        choices=[
            ('CREATE', _('Create')),
            ('READ', _('Read')),
            ('UPDATE', _('Update')),
            ('DELETE', _('Delete')),
            ('LOGIN', _('Login')),
            ('LOGOUT', _('Logout')),
            ('EXPORT', _('Export')),
            ('IMPORT', _('Import')),
            ('APPROVE', _('Approve')),
            ('REJECT', _('Reject')),
            ('SUBMIT', _('Submit')),
            ('DOWNLOAD', _('Download')),
            ('UPLOAD', _('Upload')),
            ('EXECUTE', _('Execute')),
            ('OTHER', _('Other'))
        ]
    )
    entity_type = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=100)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=500)
    location = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Geographic location data')
    )
    request_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Request payload data')
    )
    response_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Response payload data')
    )
    changes = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Changes made in the action')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('SUCCESS', _('Success')),
            ('FAILURE', _('Failure')),
            ('ERROR', _('Error')),
            ('WARNING', _('Warning'))
        ]
    )
    error_message = models.TextField(blank=True)
    session_id = models.CharField(max_length=100)
    correlation_id = models.CharField(
        max_length=100,
        help_text=_('Request correlation ID')
    )
    
    class Meta:
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action', 'entity_type']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['correlation_id']),
        ]

    def __str__(self):
        return f"{self.action} - {self.entity_type} ({self.status})"

class DataChangeLog(AbstractBaseModel):
    """
    Model for tracking data changes
    """
    table_name = models.CharField(max_length=100)
    record_id = models.CharField(max_length=100)
    operation = models.CharField(
        max_length=20,
        choices=[
            ('INSERT', _('Insert')),
            ('UPDATE', _('Update')),
            ('DELETE', _('Delete')),
            ('TRUNCATE', _('Truncate'))
        ]
    )
    old_values = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Previous record values')
    )
    new_values = models.JSONField(
        null=True,
        blank=True,
        help_text=_('New record values')
    )
    changed_fields = models.JSONField(
        help_text=_('List of changed fields')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='data_changes'
    )
    source = models.CharField(
        max_length=50,
        choices=[
            ('API', _('API Request')),
            ('UI', _('User Interface')),
            ('BATCH', _('Batch Process')),
            ('SYSTEM', _('System Process')),
            ('MIGRATION', _('Data Migration')),
            ('OTHER', _('Other Source'))
        ]
    )
    transaction_id = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = _('data change log')
        verbose_name_plural = _('data change logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['table_name', 'operation']),
            models.Index(fields=['record_id']),
            models.Index(fields=['transaction_id']),
        ]

    def __str__(self):
        return f"{self.operation} - {self.table_name} ({self.record_id})"

class ErrorLog(AbstractBaseModel):
    """
    Model for error logging
    """
    error_type = models.CharField(
        max_length=50,
        choices=[
            ('VALIDATION', _('Validation Error')),
            ('PERMISSION', _('Permission Error')),
            ('AUTHENTICATION', _('Authentication Error')),
            ('BUSINESS_LOGIC', _('Business Logic Error')),
            ('INTEGRATION', _('Integration Error')),
            ('SYSTEM', _('System Error')),
            ('DATABASE', _('Database Error')),
            ('NETWORK', _('Network Error')),
            ('OTHER', _('Other Error'))
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
    error_message = models.TextField()
    error_details = models.JSONField(
        help_text=_('Detailed error information')
    )
    stack_trace = models.TextField(blank=True)
    source = models.CharField(
        max_length=100,
        help_text=_('Error source location')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='error_logs'
    )
    request_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Request context data')
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
    resolution_status = models.CharField(
        max_length=20,
        choices=[
            ('NEW', _('New')),
            ('INVESTIGATING', _('Investigating')),
            ('RESOLVED', _('Resolved')),
            ('IGNORED', _('Ignored'))
        ],
        default='NEW'
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='resolved_errors'
    )
    resolution_notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('error log')
        verbose_name_plural = _('error logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['error_type', 'severity']),
            models.Index(fields=['environment', 'resolution_status']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.error_type} - {self.severity} ({self.resolution_status})"

class PerformanceLog(AbstractBaseModel):
    """
    Model for performance monitoring
    """
    operation = models.CharField(max_length=100)
    component = models.CharField(max_length=100)
    execution_time = models.FloatField(
        help_text=_('Execution time in milliseconds')
    )
    resource_usage = models.JSONField(
        help_text=_('Resource utilization metrics')
    )
    context = models.JSONField(
        help_text=_('Operation context data')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='performance_logs'
    )
    request_id = models.CharField(max_length=100)
    environment = models.CharField(
        max_length=20,
        choices=[
            ('DEV', _('Development')),
            ('TEST', _('Testing')),
            ('STAGING', _('Staging')),
            ('PROD', _('Production'))
        ]
    )
    
    class Meta:
        verbose_name = _('performance log')
        verbose_name_plural = _('performance logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['operation', 'component']),
            models.Index(fields=['execution_time']),
            models.Index(fields=['environment']),
        ]

    def __str__(self):
        return f"{self.operation} - {self.component} ({self.execution_time}ms)" 