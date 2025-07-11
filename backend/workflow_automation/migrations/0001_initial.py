# Generated by Django 5.2.4 on 2025-07-07 10:40

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkflowDefinition',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notes', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict, help_text='Additional metadata')),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
                ('workflow_type', models.CharField(choices=[('CUSTOMER_ONBOARDING', 'Customer Onboarding'), ('CASE_MANAGEMENT', 'Case Management'), ('ALERT_HANDLING', 'Alert Handling'), ('DOCUMENT_REVIEW', 'Document Review'), ('RISK_REVIEW', 'Risk Review'), ('CUSTOM', 'Custom Workflow')], max_length=50)),
                ('steps', models.JSONField(help_text='Workflow step definitions')),
                ('transitions', models.JSONField(help_text='Step transition rules')),
                ('roles', models.JSONField(help_text='Role permissions for steps')),
                ('sla_config', models.JSONField(help_text='SLA configuration for steps')),
                ('form_definitions', models.JSONField(blank=True, help_text='Form definitions for steps', null=True)),
                ('version', models.CharField(max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'workflow definition',
                'verbose_name_plural': 'workflow definitions',
                'ordering': ['name', '-version'],
            },
        ),
        migrations.CreateModel(
            name='WorkflowInstance',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('notes', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict, help_text='Additional metadata')),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('reference_type', models.CharField(choices=[('CUSTOMER', 'Customer'), ('CASE', 'Case'), ('ALERT', 'Alert'), ('DOCUMENT', 'Document'), ('TRANSACTION', 'Transaction')], max_length=50)),
                ('reference_id', models.UUIDField()),
                ('current_step', models.CharField(max_length=100)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('COMPLETED', 'Completed'), ('SUSPENDED', 'Suspended'), ('TERMINATED', 'Terminated'), ('FAILED', 'Failed')], default='ACTIVE', max_length=20)),
                ('priority', models.CharField(choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High'), ('URGENT', 'Urgent')], default='MEDIUM', max_length=20)),
                ('due_date', models.DateTimeField(blank=True, null=True)),
                ('data', models.JSONField(help_text='Workflow instance data')),
                ('assigned_to', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_workflows', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
                ('workflow', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='instances', to='workflow_automation.workflowdefinition')),
            ],
            options={
                'verbose_name': 'workflow instance',
                'verbose_name_plural': 'workflow instances',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='WorkflowRule',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notes', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict, help_text='Additional metadata')),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('name', models.CharField(help_text='Name of the workflow rule', max_length=100)),
                ('description', models.TextField(help_text='Detailed description of the workflow rule')),
                ('conditions', models.JSONField(help_text='Conditions that trigger this workflow')),
                ('actions', models.JSONField(help_text='Actions to be executed when conditions are met')),
                ('priority', models.IntegerField(help_text='Priority order for rule execution')),
                ('is_active', models.BooleanField(default=True, help_text='Whether this rule is currently active')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Workflow Rule',
                'verbose_name_plural': 'Workflow Rules',
                'ordering': ['priority'],
            },
        ),
        migrations.CreateModel(
            name='WorkflowExecution',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('notes', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict, help_text='Additional metadata')),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('trigger_event', models.CharField(help_text='Event that triggered the workflow', max_length=100)),
                ('entity_type', models.CharField(help_text='Type of entity this workflow is operating on', max_length=50)),
                ('entity_id', models.UUIDField(help_text='ID of the entity this workflow is operating on')),
                ('execution_status', models.CharField(choices=[('PENDING', 'Pending'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed'), ('CANCELLED', 'Cancelled')], default='PENDING', max_length=20)),
                ('execution_result', models.JSONField(help_text='Results of the workflow execution')),
                ('start_time', models.DateTimeField(help_text='When the workflow execution started')),
                ('end_time', models.DateTimeField(blank=True, help_text='When the workflow execution completed', null=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
                ('rule', models.ForeignKey(help_text='The workflow rule being executed', on_delete=django.db.models.deletion.PROTECT, to='workflow_automation.workflowrule')),
            ],
            options={
                'verbose_name': 'Workflow Execution',
                'verbose_name_plural': 'Workflow Executions',
            },
        ),
        migrations.CreateModel(
            name='WorkflowStep',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('metadata', models.JSONField(default=dict, help_text='Additional metadata')),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('step_name', models.CharField(max_length=100)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed'), ('SKIPPED', 'Skipped'), ('FAILED', 'Failed')], default='PENDING', max_length=20)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('input_data', models.JSONField(help_text='Step input data')),
                ('output_data', models.JSONField(blank=True, help_text='Step output data', null=True)),
                ('notes', models.TextField(blank=True)),
                ('assigned_to', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_steps', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='steps', to='workflow_automation.workflowinstance')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'workflow step',
                'verbose_name_plural': 'workflow steps',
                'ordering': ['instance', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='WorkflowTrigger',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notes', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict, help_text='Additional metadata')),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
                ('trigger_type', models.CharField(choices=[('EVENT', 'Event Based'), ('SCHEDULE', 'Schedule Based'), ('CONDITION', 'Condition Based'), ('MANUAL', 'Manual Trigger'), ('API', 'API Trigger')], max_length=50)),
                ('conditions', models.JSONField(help_text='Trigger conditions')),
                ('schedule', models.JSONField(blank=True, help_text='Schedule configuration', null=True)),
                ('input_mapping', models.JSONField(help_text='Input data mapping')),
                ('is_active', models.BooleanField(default=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
                ('workflow', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='triggers', to='workflow_automation.workflowdefinition')),
            ],
            options={
                'verbose_name': 'workflow trigger',
                'verbose_name_plural': 'workflow triggers',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='WorkflowAction',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notes', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict, help_text='Additional metadata')),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
                ('action_type', models.CharField(choices=[('API_CALL', 'API Call'), ('EMAIL', 'Send Email'), ('NOTIFICATION', 'Send Notification'), ('UPDATE_RECORD', 'Update Record'), ('CREATE_RECORD', 'Create Record'), ('CUSTOM', 'Custom Action')], max_length=50)),
                ('configuration', models.JSONField(help_text='Action configuration')),
                ('parameters', models.JSONField(help_text='Action parameters')),
                ('timeout', models.IntegerField(default=300, help_text='Action timeout in seconds')),
                ('retry_config', models.JSONField(blank=True, help_text='Retry configuration', null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'workflow action',
                'verbose_name_plural': 'workflow actions',
                'ordering': ['name'],
                'indexes': [models.Index(fields=['action_type', 'is_active'], name='workflow_au_action__bcd6f5_idx')],
            },
        ),
        migrations.AddIndex(
            model_name='workflowdefinition',
            index=models.Index(fields=['workflow_type', 'is_active'], name='workflow_au_workflo_5fd9fb_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowdefinition',
            index=models.Index(fields=['name', 'version'], name='workflow_au_name_f11c13_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='workflowdefinition',
            unique_together={('name', 'version')},
        ),
        migrations.AddIndex(
            model_name='workflowinstance',
            index=models.Index(fields=['workflow', 'status'], name='workflow_au_workflo_51b001_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowinstance',
            index=models.Index(fields=['reference_type', 'reference_id'], name='workflow_au_referen_4eaab6_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowinstance',
            index=models.Index(fields=['current_step', 'priority'], name='workflow_au_current_ea2d86_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowrule',
            index=models.Index(fields=['is_active', 'priority'], name='workflow_au_is_acti_3f2df0_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowexecution',
            index=models.Index(fields=['rule', 'execution_status'], name='workflow_au_rule_id_bcbb67_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowexecution',
            index=models.Index(fields=['entity_type', 'entity_id'], name='workflow_au_entity__b63825_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowexecution',
            index=models.Index(fields=['start_time'], name='workflow_au_start_t_1f7bbd_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowstep',
            index=models.Index(fields=['instance', 'step_name'], name='workflow_au_instanc_c07ade_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowstep',
            index=models.Index(fields=['status', 'assigned_to'], name='workflow_au_status_cc9121_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowtrigger',
            index=models.Index(fields=['trigger_type', 'is_active'], name='workflow_au_trigger_038be4_idx'),
        ),
        migrations.AddIndex(
            model_name='workflowtrigger',
            index=models.Index(fields=['workflow'], name='workflow_au_workflo_3b88c6_idx'),
        ),
    ]
