from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel


class WorkflowDefinition(AbstractBaseModel):
    """
    Model for workflow process definitions
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    workflow_type = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER_ONBOARDING', _('Customer Onboarding')),
            ('CASE_MANAGEMENT', _('Case Management')),
            ('ALERT_HANDLING', _('Alert Handling')),
            ('DOCUMENT_REVIEW', _('Document Review')),
            ('RISK_REVIEW', _('Risk Review')),
            ('CUSTOM', _('Custom Workflow'))
        ]
    )
    steps = models.JSONField(
        help_text=_('Workflow step definitions')
    )
    transitions = models.JSONField(
        help_text=_('Step transition rules')
    )
    roles = models.JSONField(
        help_text=_('Role permissions for steps')
    )
    sla_config = models.JSONField(
        help_text=_('SLA configuration for steps')
    )
    form_definitions = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Form definitions for steps')
    )
    version = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('workflow definition')
        verbose_name_plural = _('workflow definitions')
        unique_together = ['name', 'version']
        ordering = ['name', '-version']
        indexes = [
            models.Index(fields=['workflow_type', 'is_active']),
            models.Index(fields=['name', 'version']),
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"

class WorkflowInstance(AbstractBaseModel):
    """
    Model for workflow process instances
    """
    workflow = models.ForeignKey(
        WorkflowDefinition,
        on_delete=models.PROTECT,
        related_name='instances'
    )
    reference_type = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER', _('Customer')),
            ('CASE', _('Case')),
            ('ALERT', _('Alert')),
            ('DOCUMENT', _('Document')),
            ('TRANSACTION', _('Transaction'))
        ]
    )
    reference_id = models.UUIDField()
    current_step = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', _('Active')),
            ('COMPLETED', _('Completed')),
            ('SUSPENDED', _('Suspended')),
            ('TERMINATED', _('Terminated')),
            ('FAILED', _('Failed'))
        ],
        default='ACTIVE'
    )
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
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_workflows'
    )
    due_date = models.DateTimeField(null=True, blank=True)
    data = models.JSONField(
        help_text=_('Workflow instance data')
    )
    
    class Meta:
        verbose_name = _('workflow instance')
        verbose_name_plural = _('workflow instances')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['workflow', 'status']),
            models.Index(fields=['reference_type', 'reference_id']),
            models.Index(fields=['current_step', 'priority']),
        ]

    def __str__(self):
        return f"{self.workflow.name} - {self.reference_type} ({self.status})"

class WorkflowStep(AbstractBaseModel):
    """
    Model for workflow step executions
    """
    instance = models.ForeignKey(
        WorkflowInstance,
        on_delete=models.CASCADE,
        related_name='steps'
    )
    step_name = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('SKIPPED', _('Skipped')),
            ('FAILED', _('Failed'))
        ],
        default='PENDING'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_steps'
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    input_data = models.JSONField(
        help_text=_('Step input data')
    )
    output_data = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Step output data')
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('workflow step')
        verbose_name_plural = _('workflow steps')
        ordering = ['instance', '-created_at']
        indexes = [
            models.Index(fields=['instance', 'step_name']),
            models.Index(fields=['status', 'assigned_to']),
        ]

    def __str__(self):
        return f"{self.instance.workflow.name} - {self.step_name}"

class WorkflowAction(AbstractBaseModel):
    """
    Model for workflow action definitions
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    action_type = models.CharField(
        max_length=50,
        choices=[
            ('API_CALL', _('API Call')),
            ('EMAIL', _('Send Email')),
            ('NOTIFICATION', _('Send Notification')),
            ('UPDATE_RECORD', _('Update Record')),
            ('CREATE_RECORD', _('Create Record')),
            ('CUSTOM', _('Custom Action'))
        ]
    )
    configuration = models.JSONField(
        help_text=_('Action configuration')
    )
    parameters = models.JSONField(
        help_text=_('Action parameters')
    )
    timeout = models.IntegerField(
        help_text=_('Action timeout in seconds'),
        default=300
    )
    retry_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Retry configuration')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('workflow action')
        verbose_name_plural = _('workflow actions')
        ordering = ['name']
        indexes = [
            models.Index(fields=['action_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.action_type})"

class WorkflowTrigger(AbstractBaseModel):
    """
    Model for workflow trigger definitions
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    trigger_type = models.CharField(
        max_length=50,
        choices=[
            ('EVENT', _('Event Based')),
            ('SCHEDULE', _('Schedule Based')),
            ('CONDITION', _('Condition Based')),
            ('MANUAL', _('Manual Trigger')),
            ('API', _('API Trigger'))
        ]
    )
    workflow = models.ForeignKey(
        WorkflowDefinition,
        on_delete=models.CASCADE,
        related_name='triggers'
    )
    conditions = models.JSONField(
        help_text=_('Trigger conditions')
    )
    schedule = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Schedule configuration')
    )
    input_mapping = models.JSONField(
        help_text=_('Input data mapping')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('workflow trigger')
        verbose_name_plural = _('workflow triggers')
        ordering = ['name']
        indexes = [
            models.Index(fields=['trigger_type', 'is_active']),
            models.Index(fields=['workflow']),
        ]

    def __str__(self):
        return f"{self.name} ({self.trigger_type})"

class WorkflowRule(AbstractBaseModel):
    """Rule-based workflow automation"""
    name = models.CharField(
        max_length=100,
        help_text=_('Name of the workflow rule')
    )
    description = models.TextField(
        help_text=_('Detailed description of the workflow rule')
    )
    conditions = models.JSONField(
        help_text=_('Conditions that trigger this workflow')
    )
    actions = models.JSONField(
        help_text=_('Actions to be executed when conditions are met')
    )
    priority = models.IntegerField(
        help_text=_('Priority order for rule execution')
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_('Whether this rule is currently active')
    )
    
    class Meta:
        ordering = ['priority']
        indexes = [models.Index(fields=['is_active', 'priority'])]
        verbose_name = _('Workflow Rule')
        verbose_name_plural = _('Workflow Rules')

    def __str__(self):
        return f"{self.name} (Priority: {self.priority})"

class WorkflowExecution(AbstractBaseModel):
    """Workflow execution tracking"""
    rule = models.ForeignKey(
        WorkflowRule,
        on_delete=models.PROTECT,
        help_text=_('The workflow rule being executed')
    )
    trigger_event = models.CharField(
        max_length=100,
        help_text=_('Event that triggered the workflow')
    )
    entity_type = models.CharField(
        max_length=50,
        help_text=_('Type of entity this workflow is operating on')
    )
    entity_id = models.UUIDField(
        help_text=_('ID of the entity this workflow is operating on')
    )
    execution_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='PENDING'
    )
    execution_result = models.JSONField(
        help_text=_('Results of the workflow execution')
    )
    start_time = models.DateTimeField(
        help_text=_('When the workflow execution started')
    )
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When the workflow execution completed')
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['rule', 'execution_status']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['start_time'])
        ]
        verbose_name = _('Workflow Execution')
        verbose_name_plural = _('Workflow Executions')

    def __str__(self):
        return f"Execution of {self.rule.name} on {self.entity_type} {self.entity_id}"
