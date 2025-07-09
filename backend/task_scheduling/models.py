from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel


class ScheduledTask(AbstractBaseModel):
    """
    Model for scheduled task definitions
    """
    name = models.CharField(max_length=100, unique=True)
    task_type = models.CharField(
        max_length=50,
        choices=[
            ('BATCH_PROCESS', _('Batch Processing')),
            ('DATA_SYNC', _('Data Synchronization')),
            ('REPORT_GENERATION', _('Report Generation')),
            ('NOTIFICATION', _('Notification Dispatch')),
            ('CLEANUP', _('Data Cleanup')),
            ('MAINTENANCE', _('System Maintenance')),
            ('CUSTOM', _('Custom Task'))
        ]
    )
    description = models.TextField()
    function_path = models.CharField(
        max_length=200,
        help_text=_('Python path to task function')
    )
    arguments = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Task function arguments')
    )
    schedule_type = models.CharField(
        max_length=20,
        choices=[
            ('CRON', _('Cron Schedule')),
            ('INTERVAL', _('Interval Based')),
            ('ONE_TIME', _('One-time Execution')),
            ('EVENT', _('Event Triggered'))
        ]
    )
    schedule_config = models.JSONField(
        help_text=_('Schedule configuration')
    )
    timeout = models.IntegerField(
        help_text=_('Task timeout in seconds'),
        default=3600
    )
    retry_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Retry configuration')
    )
    dependencies = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='dependent_tasks',
        blank=True
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('scheduled task')
        verbose_name_plural = _('scheduled tasks')
        ordering = ['name']
        indexes = [
            models.Index(fields=['task_type', 'schedule_type']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.task_type})"

class TaskExecution(AbstractBaseModel):
    """
    Model for task execution tracking
    """
    task = models.ForeignKey(
        ScheduledTask,
        on_delete=models.CASCADE,
        related_name='executions'
    )
    execution_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('RUNNING', _('Running')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled')),
            ('TIMEOUT', _('Timeout'))
        ],
        default='PENDING'
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(
        null=True,
        blank=True,
        help_text=_('Execution duration in seconds')
    )
    input_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Task input parameters')
    )
    result = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Task execution result')
    )
    error_details = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Error information if failed')
    )
    logs = models.TextField(blank=True)
    worker_info = models.JSONField(
        help_text=_('Execution worker details')
    )
    
    class Meta:
        verbose_name = _('task execution')
        verbose_name_plural = _('task executions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['task', 'status']),
            models.Index(fields=['execution_id']),
            models.Index(fields=['started_at']),
        ]

    def __str__(self):
        return f"{self.task.name} - {self.execution_id}"

class TaskQueue(AbstractBaseModel):
    """
    Model for task queue management
    """
    name = models.CharField(max_length=100, unique=True)
    queue_type = models.CharField(
        max_length=50,
        choices=[
            ('DEFAULT', _('Default Queue')),
            ('HIGH_PRIORITY', _('High Priority')),
            ('LOW_PRIORITY', _('Low Priority')),
            ('BATCH', _('Batch Processing')),
            ('REPORTING', _('Reporting Queue')),
            ('NOTIFICATION', _('Notification Queue'))
        ]
    )
    description = models.TextField()
    configuration = models.JSONField(
        help_text=_('Queue configuration')
    )
    max_retries = models.IntegerField(default=3)
    retry_delay = models.IntegerField(
        help_text=_('Retry delay in seconds'),
        default=300
    )
    max_size = models.IntegerField(
        null=True,
        blank=True,
        help_text=_('Maximum queue size')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('task queue')
        verbose_name_plural = _('task queues')
        ordering = ['name']
        indexes = [
            models.Index(fields=['queue_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.queue_type})"

class TaskLock(AbstractBaseModel):
    """
    Model for task locking mechanism
    """
    lock_key = models.CharField(max_length=100, unique=True)
    task = models.ForeignKey(
        ScheduledTask,
        on_delete=models.CASCADE,
        related_name='locks'
    )
    locked_by = models.CharField(max_length=100)
    locked_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    metadata = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Lock metadata')
    )
    
    class Meta:
        verbose_name = _('task lock')
        verbose_name_plural = _('task locks')
        ordering = ['-locked_at']
        indexes = [
            models.Index(fields=['lock_key']),
            models.Index(fields=['task', 'locked_by']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.task.name} - {self.lock_key}" 