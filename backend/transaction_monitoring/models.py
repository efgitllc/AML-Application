from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.conf import settings
from core.models import AbstractBaseModel, RiskLevelMixin, StatusMixin
from core.constants import TransactionType
import uuid

class Transaction(AbstractBaseModel, RiskLevelMixin, StatusMixin):
    """
    Model to store transaction details with enhanced monitoring
    """
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True)
    transaction_type = models.CharField(
        max_length=50,
        choices=TransactionType.choices,
        db_index=True
    )
    amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='AED')
    source_account = models.CharField(max_length=50)
    destination_account = models.CharField(max_length=50)
    transaction_date = models.DateTimeField(db_index=True)
    description = models.TextField(blank=True)
    reference_number = models.CharField(max_length=100, blank=True)
    is_suspicious = models.BooleanField(default=False, db_index=True)
    alert_generated = models.BooleanField(default=False)
    monitoring_status = models.CharField(max_length=50, default='PENDING')
    monitoring_notes = models.TextField(blank=True)
    monitoring_history = models.JSONField(default=list)

    class Meta:
        verbose_name = _('Transaction')
        verbose_name_plural = _('Transactions')
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['transaction_type', 'amount']),
            models.Index(fields=['source_account', 'destination_account']),
            models.Index(fields=['is_suspicious', 'alert_generated']),
        ]

    def __str__(self):
        return f"{self.transaction_id} - {self.amount} {self.currency}"

    def mark_suspicious(self, reason: str = "", user=None) -> None:
        """Mark transaction as suspicious and update monitoring history"""
        if not self.is_suspicious:
            self.is_suspicious = True
            self.monitoring_history.append({
                'date': timezone.now().isoformat(),
                'action': 'MARKED_SUSPICIOUS',
                'reason': reason,
                'user': str(user.id) if user else None
            })
            self.monitoring_status = 'UNDER_REVIEW'
            self.monitoring_notes = reason
            self.save()

    def generate_alert(self, alert_type: str, details: dict) -> None:
        """Generate alert for suspicious transaction"""
        if not self.alert_generated:
            self.alert_generated = True
            self.monitoring_history.append({
                'date': timezone.now().isoformat(),
                'action': 'ALERT_GENERATED',
                'alert_type': alert_type,
                'details': details
            })
            self.save()

class TransactionPattern(AbstractBaseModel):
    """
    Model to store transaction patterns for monitoring
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    pattern_type = models.CharField(max_length=50)
    rules = models.JSONField(
        help_text=_("Pattern matching rules")
    )
    threshold = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    time_window = models.DurationField(
        help_text=_("Time window for pattern detection")
    )
    is_active = models.BooleanField(default=True, db_index=True)
    priority = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    alert_template = models.JSONField(
        help_text=_("Template for alert generation")
    )

    class Meta:
        verbose_name = _('Transaction Pattern')
        verbose_name_plural = _('Transaction Patterns')
        ordering = ['-priority', 'name']
        indexes = [
            models.Index(fields=['pattern_type', 'is_active']),
            models.Index(fields=['priority', 'is_active']),
        ]

    def __str__(self):
        return self.name

class MonitoringRule(AbstractBaseModel, StatusMixin):
    """
    Model to define transaction monitoring rules and thresholds.
    """
    name = models.CharField(
        max_length=100,
        help_text="Name of the monitoring rule"
    )
    description = models.TextField(
        help_text="Description of what this rule monitors"
    )
    rule_type = models.CharField(
        max_length=50,
        choices=[
            ('AMOUNT_THRESHOLD', 'Amount Threshold'),
            ('FREQUENCY', 'Transaction Frequency'),
            ('VELOCITY', 'Transaction Velocity'),
            ('PATTERN', 'Pattern Recognition'),
            ('GEOGRAPHY', 'Geographic Risk'),
            ('TIME_BASED', 'Time-based Analysis'),
            ('CUSTOMER_BEHAVIOR', 'Customer Behavior'),
        ],
        help_text="Type of monitoring rule"
    )
    threshold_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Amount threshold for the rule"
    )
    threshold_count = models.IntegerField(
        null=True,
        blank=True,
        help_text="Count threshold for frequency-based rules"
    )
    time_window_hours = models.IntegerField(
        default=24,
        help_text="Time window in hours for the rule evaluation"
    )
    risk_score_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.0,
        help_text="Weight of this rule in overall risk scoring"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this rule is currently active"
    )
    auto_escalate = models.BooleanField(
        default=False,
        help_text="Whether alerts from this rule should auto-escalate"
    )
    rule_conditions = models.JSONField(
        default=dict,
        help_text="JSON field for complex rule conditions"
    )

    class Meta:
        db_table = 'monitoring_rules'
        verbose_name = 'Monitoring Rule'
        verbose_name_plural = 'Monitoring Rules'
        ordering = ['name']
        indexes = [
            models.Index(fields=['rule_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.rule_type})"

    def evaluate_transaction(self, transaction):
        """
        Evaluate if a transaction triggers this rule
        Returns tuple: (is_triggered, alert_message)
        """
        # This would contain the logic to evaluate the rule against a transaction
        # For now, just a placeholder
        return False, ""

    def activate(self):
        """Activate the rule"""
        self.is_active = True
        self.save()

    def deactivate(self):
        """Deactivate the rule"""
        self.is_active = False
        self.save()

class TransactionAlert(AbstractBaseModel, StatusMixin):
    """
    Model to represent alerts generated from transaction monitoring.
    """
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    alert_type = models.CharField(
        max_length=50,
        choices=[
            ('AMOUNT_THRESHOLD', 'Amount Threshold Exceeded'),
            ('FREQUENCY', 'High Frequency'),
            ('PATTERN', 'Suspicious Pattern'),
            ('VELOCITY', 'Velocity Check Failed'),
            ('WATCHLIST', 'Watchlist Match'),
            ('GEOGRAPHY', 'Geographic Risk'),
            ('BEHAVIOR', 'Behavioral Anomaly'),
        ],
        help_text="Type of alert generated"
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High'),
            ('CRITICAL', 'Critical'),
        ],
        default='MEDIUM'
    )
    alert_message = models.TextField(
        help_text="Detailed message about the alert"
    )
    threshold_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Threshold value that triggered the alert"
    )
    actual_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual value that exceeded the threshold"
    )
    is_escalated = models.BooleanField(
        default=False,
        help_text="Whether this alert has been escalated"
    )
    escalated_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the alert was escalated"
    )
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the alert was resolved"
    )
    resolution_notes = models.TextField(
        blank=True,
        help_text="Notes about how the alert was resolved"
    )

    class Meta:
        db_table = 'transaction_alerts'
        verbose_name = 'Transaction Alert'
        verbose_name_plural = 'Transaction Alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['alert_type']),
            models.Index(fields=['severity']),
            models.Index(fields=['is_escalated']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Alert for Transaction {self.transaction.id} - {self.alert_type}"

    def escalate(self):
        """Mark alert as escalated"""
        self.is_escalated = True
        self.escalated_at = timezone.now()
        self.save()

    def resolve(self, notes=""):
        """Mark alert as resolved"""
        self.status = 'RESOLVED'
        self.resolved_at = timezone.now()
        if notes:
            self.resolution_notes = notes
        self.save()
