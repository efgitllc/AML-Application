from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel

from transaction_monitoring.models import MonitoringRule
from customer_management.models import Customer
from case_management.models import Case

class TrainingScenario(AbstractBaseModel):
    """
    Model for training scenarios and simulations
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    scenario_type = models.CharField(
        max_length=50,
        choices=[
            ('TRANSACTION', _('Transaction Scenario')),
            ('CUSTOMER', _('Customer Scenario')),
            ('RISK', _('Risk Assessment')),
            ('CASE', _('Case Management')),
            ('WORKFLOW', _('Workflow Process')),
            ('COMBINED', _('Combined Scenario'))
        ]
    )
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('BASIC', _('Basic')),
            ('INTERMEDIATE', _('Intermediate')),
            ('ADVANCED', _('Advanced')),
            ('EXPERT', _('Expert'))
        ],
        default='INTERMEDIATE'
    )
    scenario_data = models.JSONField(
        help_text=_('Scenario configuration and data')
    )
    expected_outcomes = models.JSONField(
        help_text=_('Expected scenario outcomes')
    )
    training_materials = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Associated training materials')
    )
    is_active = models.BooleanField(default=True)
    
    # Creator/Owner
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_scenarios'
    )
    
    class Meta:
        verbose_name = _('training scenario')
        verbose_name_plural = _('training scenarios')
        ordering = ['name']
        indexes = [
            models.Index(fields=['scenario_type', 'difficulty_level']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.scenario_type})"

class RuleSimulation(AbstractBaseModel):
    """
    Model for testing monitoring rules
    """
    name = models.CharField(max_length=100)
    rule = models.ForeignKey(
        MonitoringRule,
        on_delete=models.CASCADE,
        related_name='simulations'
    )
    test_data = models.JSONField(
        help_text=_('Test transaction/customer data')
    )
    parameters = models.JSONField(
        help_text=_('Simulation parameters')
    )
    expected_alerts = models.JSONField(
        help_text=_('Expected alert outcomes')
    )
    actual_results = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Actual simulation results')
    )
    is_successful = models.BooleanField(null=True)
    execution_time = models.DurationField(null=True)
    
    # Test Environment
    environment_config = models.JSONField(
        help_text=_('Test environment configuration')
    )
    
    class Meta:
        verbose_name = _('rule simulation')
        verbose_name_plural = _('rule simulations')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['rule', '-created_at']),
            models.Index(fields=['is_successful']),
        ]

    def __str__(self):
        return f"{self.rule.name} - {self.name}"

class TrainingSession(AbstractBaseModel):
    """
    Model for user training sessions
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='training_sessions'
    )
    scenario = models.ForeignKey(
        TrainingScenario,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('ABANDONED', _('Abandoned'))
        ],
        default='IN_PROGRESS'
    )
    user_actions = models.JSONField(
        help_text=_('Record of user actions and decisions')
    )
    performance_metrics = models.JSONField(
        null=True,
        blank=True,
        help_text=_('User performance metrics')
    )
    feedback = models.TextField(blank=True)
    score = models.FloatField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('training session')
        verbose_name_plural = _('training sessions')
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', '-start_time']),
            models.Index(fields=['scenario', 'status']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.scenario.name}"

class SimulatedTransaction(AbstractBaseModel):
    """
    Model for simulated transactions
    """
    simulation = models.ForeignKey(
        RuleSimulation,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_data = models.JSONField(
        help_text=_('Simulated transaction details')
    )
    customer_data = models.JSONField(
        help_text=_('Associated customer data')
    )
    risk_factors = models.JSONField(
        help_text=_('Risk factors and scores')
    )
    expected_flags = models.JSONField(
        help_text=_('Expected rule flags')
    )
    actual_flags = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Actual flags raised')
    )
    processing_time = models.DurationField(null=True)
    
    class Meta:
        verbose_name = _('simulated transaction')
        verbose_name_plural = _('simulated transactions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['simulation', '-created_at']),
        ]

    def __str__(self):
        return f"Simulation {self.simulation.id} - Transaction {self.id}"

class TrainingMetrics(AbstractBaseModel):
    """
    Model for tracking training performance metrics
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='training_metrics'
    )
    metric_type = models.CharField(
        max_length=50,
        choices=[
            ('ACCURACY', _('Decision Accuracy')),
            ('SPEED', _('Processing Speed')),
            ('COMPLIANCE', _('Compliance Score')),
            ('EFFICIENCY', _('Task Efficiency')),
            ('LEARNING', _('Learning Progress'))
        ]
    )
    time_period = models.CharField(
        max_length=20,
        choices=[
            ('DAILY', _('Daily')),
            ('WEEKLY', _('Weekly')),
            ('MONTHLY', _('Monthly')),
            ('QUARTERLY', _('Quarterly'))
        ]
    )
    metric_value = models.FloatField()
    metric_details = models.JSONField(
        help_text=_('Detailed metric data')
    )
    
    class Meta:
        verbose_name = _('training metric')
        verbose_name_plural = _('training metrics')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'metric_type', '-created_at']),
            models.Index(fields=['time_period']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.metric_type} - {self.time_period}"
