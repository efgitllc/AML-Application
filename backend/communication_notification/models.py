from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from core.models import AbstractBaseModel, StatusMixin
import uuid


class NotificationTemplate(AbstractBaseModel):
    """
    Templates for different types of notifications
    """
    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(
        max_length=50,
        choices=[
            ('EMAIL', _('Email Template')),
            ('SMS', _('SMS Template')),
            ('PUSH', _('Push Notification')),
            ('SYSTEM', _('System Alert')),
            ('WEBHOOK', _('Webhook Template'))
        ]
    )
    subject_template = models.CharField(
        max_length=255,
        help_text=_('Template for subject/title')
    )
    body_template = models.TextField(
        help_text=_('Template for message body')
    )
    variables = models.JSONField(
        help_text=_('Available template variables')
    )
    language = models.CharField(
        max_length=10,
        default='en',
        choices=[
            ('en', _('English')),
            ('ar', _('Arabic')),
            ('hi', _('Hindi')),
            ('ur', _('Urdu'))
        ]
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('notification template')
        verbose_name_plural = _('notification templates')
        ordering = ['name']
        indexes = [
            models.Index(fields=['template_type', 'language']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.template_type})"


class NotificationChannel(AbstractBaseModel):
    """
    Communication channels configuration
    """
    name = models.CharField(max_length=100, unique=True)
    channel_type = models.CharField(
        max_length=30,
        choices=[
            ('EMAIL', _('Email')),
            ('SMS', _('SMS')),
            ('PUSH', _('Push Notification')),
            ('WEBHOOK', _('Webhook')),
            ('SLACK', _('Slack')),
            ('TEAMS', _('Microsoft Teams')),
            ('SYSTEM', _('System Internal'))
        ]
    )
    configuration = models.JSONField(
        help_text=_('Channel-specific configuration')
    )
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(
        default=0,
        help_text=_('Channel priority (higher number = higher priority)')
    )
    retry_config = models.JSONField(
        help_text=_('Retry configuration for failed notifications')
    )
    rate_limit = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Rate limiting configuration')
    )
    
    class Meta:
        verbose_name = _('notification channel')
        verbose_name_plural = _('notification channels')
        ordering = ['-priority', 'name']
        indexes = [
            models.Index(fields=['channel_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.channel_type})"


class Notification(AbstractBaseModel, StatusMixin):
    """
    Individual notification records
    """
    notification_id = models.UUIDField(default=uuid.uuid4, unique=True)
    notification_type = models.CharField(
        max_length=50,
        choices=[
            ('ALERT', _('Alert Notification')),
            ('CASE_UPDATE', _('Case Update')),
            ('TRANSACTION_ALERT', _('Transaction Alert')),
            ('KYC_REMINDER', _('KYC Reminder')),
            ('REGULATORY_DEADLINE', _('Regulatory Deadline')),
            ('SYSTEM_MAINTENANCE', _('System Maintenance')),
            ('WORKFLOW_ACTION', _('Workflow Action Required')),
            ('APPROVAL_REQUEST', _('Approval Request')),
            ('COMPLIANCE_ISSUE', _('Compliance Issue')),
            ('SECURITY_ALERT', _('Security Alert')),
            ('REPORT_READY', _('Report Ready')),
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
    
    # Recipients
    recipient_type = models.CharField(
        max_length=20,
        choices=[
            ('USER', _('Specific User')),
            ('ROLE', _('User Role')),
            ('GROUP', _('User Group')),
            ('DEPARTMENT', _('Department')),
            ('ALL', _('All Users'))
        ]
    )
    recipient_id = models.UUIDField(
        null=True,
        blank=True,
        help_text=_('Specific recipient ID (user, role, etc.)')
    )
    recipient_criteria = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Criteria for selecting recipients')
    )
    
    # Message Content
    subject = models.CharField(max_length=255)
    message = models.TextField()
    metadata = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Additional notification metadata')
    )
    
    # Related Objects
    related_object_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text=_('Type of related object (case, transaction, etc.)')
    )
    related_object_id = models.UUIDField(
        null=True,
        blank=True,
        help_text=_('ID of related object')
    )
    
    # Delivery Configuration
    channels = models.ManyToManyField(
        NotificationChannel,
        through='NotificationDelivery'
    )
    
    # Scheduling
    scheduled_for = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When to send the notification')
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When notification expires')
    )
    
    # Status and Tracking
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', _('Draft')),
            ('QUEUED', _('Queued')),
            ('SENDING', _('Sending')),
            ('SENT', _('Sent')),
            ('DELIVERED', _('Delivered')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled')),
            ('EXPIRED', _('Expired'))
        ],
        default='DRAFT'
    )
    
    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification_type', 'priority']),
            models.Index(fields=['recipient_type', 'recipient_id']),
            models.Index(fields=['status', 'scheduled_for']),
            models.Index(fields=['related_object_type', 'related_object_id']),
        ]

    def __str__(self):
        return f"{self.notification_type} - {self.subject}"


class NotificationDelivery(AbstractBaseModel):
    """
    Tracks delivery of notifications through specific channels
    """
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='deliveries'
    )
    channel = models.ForeignKey(
        NotificationChannel,
        on_delete=models.CASCADE,
        related_name='deliveries'
    )
    recipient_address = models.CharField(
        max_length=255,
        help_text=_('Actual delivery address (email, phone, etc.)')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('QUEUED', _('Queued')),
            ('SENDING', _('Sending')),
            ('SENT', _('Sent')),
            ('DELIVERED', _('Delivered')),
            ('BOUNCED', _('Bounced')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='PENDING'
    )
    attempts = models.IntegerField(default=0)
    last_attempt = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    external_message_id = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('External service message ID')
    )
    delivery_metadata = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Channel-specific delivery metadata')
    )
    
    class Meta:
        verbose_name = _('notification delivery')
        verbose_name_plural = _('notification deliveries')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification', 'channel']),
            models.Index(fields=['status', 'last_attempt']),
            models.Index(fields=['external_message_id']),
        ]

    def __str__(self):
        return f"{self.notification.subject} via {self.channel.name}"


class NotificationSubscription(AbstractBaseModel):
    """
    User notification preferences and subscriptions
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_subscriptions'
    )
    notification_type = models.CharField(
        max_length=50,
        help_text=_('Type of notification to subscribe to')
    )
    channels = models.ManyToManyField(
        NotificationChannel,
        help_text=_('Preferred channels for this notification type')
    )
    is_active = models.BooleanField(default=True)
    preferences = models.JSONField(
        null=True,
        blank=True,
        help_text=_('User-specific preferences for this notification type')
    )
    
    class Meta:
        verbose_name = _('notification subscription')
        verbose_name_plural = _('notification subscriptions')
        unique_together = ['user', 'notification_type']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['notification_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.notification_type}"


class CommunicationLog(AbstractBaseModel):
    """
    Log of all communications (audit trail)
    """
    communication_id = models.UUIDField(default=uuid.uuid4, unique=True)
    communication_type = models.CharField(
        max_length=30,
        choices=[
            ('OUTBOUND_EMAIL', _('Outbound Email')),
            ('INBOUND_EMAIL', _('Inbound Email')),
            ('SMS', _('SMS')),
            ('PHONE_CALL', _('Phone Call')),
            ('SYSTEM_ALERT', _('System Alert')),
            ('WEBHOOK', _('Webhook')),
            ('API_NOTIFICATION', _('API Notification'))
        ]
    )
    
    # Participants
    sender = models.CharField(max_length=255)
    recipients = models.JSONField(
        help_text=_('List of recipients')
    )
    
    # Message Details
    subject = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    attachments = models.JSONField(
        null=True,
        blank=True,
        help_text=_('List of attachments')
    )
    
    # Related Context
    related_case_id = models.UUIDField(null=True, blank=True)
    related_customer_id = models.UUIDField(null=True, blank=True)
    related_transaction_id = models.UUIDField(null=True, blank=True)
    
    # Delivery Status
    delivery_status = models.CharField(
        max_length=20,
        choices=[
            ('SENT', _('Sent')),
            ('DELIVERED', _('Delivered')),
            ('READ', _('Read')),
            ('REPLIED', _('Replied')),
            ('BOUNCED', _('Bounced')),
            ('FAILED', _('Failed'))
        ]
    )
    delivery_timestamp = models.DateTimeField()
    
    # Compliance
    retention_period = models.IntegerField(
        help_text=_('Retention period in days')
    )
    is_confidential = models.BooleanField(default=True)
    classification = models.CharField(
        max_length=30,
        choices=[
            ('PUBLIC', _('Public')),
            ('INTERNAL', _('Internal')),
            ('CONFIDENTIAL', _('Confidential')),
            ('RESTRICTED', _('Restricted'))
        ],
        default='CONFIDENTIAL'
    )
    
    class Meta:
        verbose_name = _('communication log')
        verbose_name_plural = _('communication logs')
        ordering = ['-delivery_timestamp']
        indexes = [
            models.Index(fields=['communication_type', 'delivery_status']),
            models.Index(fields=['related_case_id']),
            models.Index(fields=['related_customer_id']),
            models.Index(fields=['delivery_timestamp']),
            models.Index(fields=['is_confidential', 'classification']),
        ]

    def __str__(self):
        return f"{self.communication_type} - {self.subject}"


class NotificationRule(AbstractBaseModel):
    """
    Rules for automatic notification triggering
    """
    name = models.CharField(max_length=100, unique=True)
    rule_type = models.CharField(
        max_length=50,
        choices=[
            ('EVENT_BASED', _('Event-based Rule')),
            ('THRESHOLD', _('Threshold Rule')),
            ('SCHEDULE', _('Scheduled Rule')),
            ('ESCALATION', _('Escalation Rule'))
        ]
    )
    trigger_conditions = models.JSONField(
        help_text=_('Conditions that trigger the notification')
    )
    notification_config = models.JSONField(
        help_text=_('Notification configuration')
    )
    recipient_config = models.JSONField(
        help_text=_('Recipient selection configuration')
    )
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = _('notification rule')
        verbose_name_plural = _('notification rules')
        ordering = ['-priority', 'name']
        indexes = [
            models.Index(fields=['rule_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.rule_type})" 