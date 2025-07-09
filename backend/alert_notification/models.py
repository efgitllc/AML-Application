from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import AbstractBaseModel
from transaction_monitoring.models import TransactionAlert
from case_management.models import Case

class NotificationTemplate(AbstractBaseModel):
    """
    Model for managing notification templates
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    notification_type = models.CharField(
        max_length=50,
        choices=[
            ('EMAIL', _('Email')),
            ('SMS', _('SMS')),
            ('PUSH', _('Push Notification')),
            ('IN_APP', _('In-App Notification')),
            ('WEBHOOK', _('Webhook')),
            ('SYSTEM', _('System Alert'))
        ]
    )
    template_content = models.TextField(
        help_text=_('Template content with placeholders')
    )
    subject_template = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Subject line template for email notifications')
    )
    placeholders = models.JSONField(
        default=dict,
        help_text=_('List of available placeholders and their descriptions')
    )
    is_active = models.BooleanField(default=True)
    
    # Template Settings
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
    category = models.CharField(
        max_length=50,
        choices=[
            ('ALERT', _('Alert Notification')),
            ('CASE', _('Case Update')),
            ('TASK', _('Task Assignment')),
            ('REVIEW', _('Review Required')),
            ('SYSTEM', _('System Notification')),
            ('COMPLIANCE', _('Compliance Alert')),
            ('OTHER', _('Other'))
        ]
    )
    
    class Meta:
        verbose_name = _('notification template')
        verbose_name_plural = _('notification templates')
        ordering = ['name']
        indexes = [
            models.Index(fields=['notification_type']),
            models.Index(fields=['category', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.notification_type})"

class NotificationRule(AbstractBaseModel):
    """
    Model for configuring notification rules and triggers
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.PROTECT,
        related_name='rules'
    )
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('ALERT_CREATED', _('Alert Created')),
            ('ALERT_UPDATED', _('Alert Updated')),
            ('CASE_CREATED', _('Case Created')),
            ('CASE_UPDATED', _('Case Updated')),
            ('CASE_ASSIGNED', _('Case Assigned')),
            ('TASK_ASSIGNED', _('Task Assigned')),
            ('DEADLINE_APPROACHING', _('Deadline Approaching')),
            ('STATUS_CHANGE', _('Status Changed')),
            ('RISK_LEVEL_CHANGE', _('Risk Level Changed')),
            ('DOCUMENT_EXPIRED', _('Document Expired')),
            ('THRESHOLD_EXCEEDED', _('Threshold Exceeded'))
        ]
    )
    conditions = models.JSONField(
        default=dict,
        help_text=_('Conditions that trigger the notification')
    )
    recipient_rules = models.JSONField(
        default=dict,
        help_text=_('Rules for determining notification recipients')
    )
    is_active = models.BooleanField(default=True)
    
    # Rule Settings
    cooldown_period = models.DurationField(
        null=True,
        blank=True,
        help_text=_('Minimum time between repeated notifications')
    )
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('notification rule')
        verbose_name_plural = _('notification rules')
        ordering = ['name']
        indexes = [
            models.Index(fields=['event_type', 'is_active']),
            models.Index(fields=['valid_from', 'valid_until']),
        ]

    def __str__(self):
        return f"{self.name} - {self.event_type}"

class Notification(AbstractBaseModel):
    """
    Model for tracking sent notifications
    """
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.PROTECT,
        related_name='notifications'
    )
    rule = models.ForeignKey(
        NotificationRule,
        on_delete=models.PROTECT,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=[
            ('EMAIL', _('Email')),
            ('SMS', _('SMS')),
            ('PUSH', _('Push Notification')),
            ('IN_APP', _('In-App Notification')),
            ('WEBHOOK', _('Webhook')),
            ('SYSTEM', _('System Alert'))
        ]
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications_received'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='notifications_created'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications_reviewed'
    )
    subject = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    
    # Related Entities
    related_alert = models.ForeignKey(
        TransactionAlert,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    related_case = models.ForeignKey(
        Case,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    # Delivery Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('SENDING', _('Sending')),
            ('DELIVERED', _('Delivered')),
            ('FAILED', _('Failed')),
            ('READ', _('Read')),
            ('ACTIONED', _('Actioned'))
        ],
        default='PENDING'
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # Additional Information
    metadata = models.JSONField(
        default=dict,
        help_text=_('Additional notification metadata')
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('LOW', _('Low')),
            ('MEDIUM', _('Medium')),
            ('HIGH', _('High')),
            ('URGENT', _('Urgent'))
        ]
    )
    requires_action = models.BooleanField(default=False)
    action_deadline = models.DateTimeField(null=True, blank=True)
    retry_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    max_retries = models.IntegerField(
        default=3,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )

    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification_type', 'status']),
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['requires_action', 'action_deadline']),
        ]

    def __str__(self):
        return f"{self.notification_type} to {self.recipient} - {self.subject}"

class NotificationPreference(AbstractBaseModel):
    """
    Model for managing user notification preferences
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    
    # Channel Settings
    email_address = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    device_tokens = models.JSONField(
        default=list,
        help_text=_('Push notification device tokens')
    )
    
    # Notification Preferences
    alert_preferences = models.JSONField(
        default=dict,
        help_text=_('Preferences for different alert types')
    )
    quiet_hours = models.JSONField(
        default=dict,
        help_text=_('Do not disturb time windows')
    )
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('IMMEDIATE', _('Immediate')),
            ('HOURLY', _('Hourly Digest')),
            ('DAILY', _('Daily Digest')),
            ('WEEKLY', _('Weekly Digest'))
        ],
        default='IMMEDIATE'
    )
    
    class Meta:
        verbose_name = _('notification preference')
        verbose_name_plural = _('notification preferences')
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"Preferences for {self.user}"

class WebSocketConnection(AbstractBaseModel):
    """
    Model for tracking active WebSocket connections
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='websocket_connections'
    )
    connection_id = models.CharField(max_length=100, unique=True)
    client_info = models.JSONField(
        default=dict,
        help_text=_('Client device/browser information')
    )
    is_active = models.BooleanField(default=True)
    last_ping = models.DateTimeField(auto_now=True)
    subscribed_channels = models.JSONField(
        default=list,
        help_text=_('List of subscribed notification channels')
    )

    class Meta:
        verbose_name = _('WebSocket connection')
        verbose_name_plural = _('WebSocket connections')
        ordering = ['-last_ping']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['connection_id']),
            models.Index(fields=['last_ping']),
        ]

    def __str__(self):
        return f"Connection {self.connection_id} - {self.user}"

class NotificationChannel(AbstractBaseModel):
    """
    Model for defining notification channels and their configurations
    """
    name = models.CharField(max_length=100, unique=True)
    channel_type = models.CharField(
        max_length=50,
        choices=[
            ('EMAIL', _('Email')),
            ('SMS', _('SMS')),
            ('PUSH', _('Push Notification')),
            ('WEBHOOK', _('Webhook')),
            ('SLACK', _('Slack')),
            ('TEAMS', _('Microsoft Teams'))
        ]
    )
    configuration = models.JSONField(
        default=dict,
        help_text=_('Channel-specific configuration settings')
    )
    is_active = models.BooleanField(default=True)
    rate_limit = models.JSONField(
        default=dict,
        help_text=_('Rate limiting configuration')
    )
    
    class Meta:
        verbose_name = _('notification channel')
        verbose_name_plural = _('notification channels')
        ordering = ['name']
        indexes = [
            models.Index(fields=['channel_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.channel_type})"

class NotificationQueue(AbstractBaseModel):
    """
    Model for queuing notifications for batch processing
    """
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='queue_entries'
    )
    channel = models.ForeignKey(
        NotificationChannel,
        on_delete=models.CASCADE,
        related_name='queued_notifications'
    )
    scheduled_time = models.DateTimeField()
    priority = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text=_('Priority level (1=highest, 10=lowest)')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('QUEUED', _('Queued')),
            ('PROCESSING', _('Processing')),
            ('SENT', _('Sent')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='QUEUED'
    )
    attempts = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    last_error = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('notification queue')
        verbose_name_plural = _('notification queues')
        ordering = ['priority', 'scheduled_time']
        indexes = [
            models.Index(fields=['status', 'scheduled_time']),
            models.Index(fields=['priority', 'scheduled_time']),
        ]

    def __str__(self):
        return f"Queue entry for {self.notification} via {self.channel}"
