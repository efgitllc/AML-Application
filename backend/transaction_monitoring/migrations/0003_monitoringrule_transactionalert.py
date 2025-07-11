# Generated by Django 5.2.4 on 2025-07-07 10:40

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transaction_monitoring', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MonitoringRule',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notes', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict, help_text='Additional metadata')),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed'), ('REJECTED', 'Rejected'), ('CANCELLED', 'Cancelled'), ('ON_HOLD', 'On Hold'), ('EXPIRED', 'Expired'), ('BLOCKED', 'Blocked')], db_index=True, default='PENDING', max_length=50)),
                ('status_changed_at', models.DateTimeField(auto_now=True, db_index=True)),
                ('status_reason', models.TextField(blank=True)),
                ('status_history', models.JSONField(default=list, help_text='History of status changes')),
                ('name', models.CharField(help_text='Name of the monitoring rule', max_length=100)),
                ('description', models.TextField(help_text='Description of what this rule monitors')),
                ('rule_type', models.CharField(choices=[('AMOUNT_THRESHOLD', 'Amount Threshold'), ('FREQUENCY', 'Transaction Frequency'), ('VELOCITY', 'Transaction Velocity'), ('PATTERN', 'Pattern Recognition'), ('GEOGRAPHY', 'Geographic Risk'), ('TIME_BASED', 'Time-based Analysis'), ('CUSTOMER_BEHAVIOR', 'Customer Behavior')], help_text='Type of monitoring rule', max_length=50)),
                ('threshold_amount', models.DecimalField(blank=True, decimal_places=2, help_text='Amount threshold for the rule', max_digits=15, null=True)),
                ('threshold_count', models.IntegerField(blank=True, help_text='Count threshold for frequency-based rules', null=True)),
                ('time_window_hours', models.IntegerField(default=24, help_text='Time window in hours for the rule evaluation')),
                ('risk_score_weight', models.DecimalField(decimal_places=2, default=1.0, help_text='Weight of this rule in overall risk scoring', max_digits=5)),
                ('is_active', models.BooleanField(default=True, help_text='Whether this rule is currently active')),
                ('auto_escalate', models.BooleanField(default=False, help_text='Whether alerts from this rule should auto-escalate')),
                ('rule_conditions', models.JSONField(default=dict, help_text='JSON field for complex rule conditions')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Monitoring Rule',
                'verbose_name_plural': 'Monitoring Rules',
                'db_table': 'monitoring_rules',
                'ordering': ['name'],
                'indexes': [models.Index(fields=['rule_type'], name='monitoring__rule_ty_d28259_idx'), models.Index(fields=['is_active'], name='monitoring__is_acti_301382_idx'), models.Index(fields=['created_at'], name='monitoring__created_616940_idx')],
            },
        ),
        migrations.CreateModel(
            name='TransactionAlert',
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
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed'), ('REJECTED', 'Rejected'), ('CANCELLED', 'Cancelled'), ('ON_HOLD', 'On Hold'), ('EXPIRED', 'Expired'), ('BLOCKED', 'Blocked')], db_index=True, default='PENDING', max_length=50)),
                ('status_changed_at', models.DateTimeField(auto_now=True, db_index=True)),
                ('status_reason', models.TextField(blank=True)),
                ('status_history', models.JSONField(default=list, help_text='History of status changes')),
                ('alert_type', models.CharField(choices=[('AMOUNT_THRESHOLD', 'Amount Threshold Exceeded'), ('FREQUENCY', 'High Frequency'), ('PATTERN', 'Suspicious Pattern'), ('VELOCITY', 'Velocity Check Failed'), ('WATCHLIST', 'Watchlist Match'), ('GEOGRAPHY', 'Geographic Risk'), ('BEHAVIOR', 'Behavioral Anomaly')], help_text='Type of alert generated', max_length=50)),
                ('severity', models.CharField(choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High'), ('CRITICAL', 'Critical')], default='MEDIUM', max_length=20)),
                ('alert_message', models.TextField(help_text='Detailed message about the alert')),
                ('threshold_value', models.DecimalField(blank=True, decimal_places=2, help_text='Threshold value that triggered the alert', max_digits=15, null=True)),
                ('actual_value', models.DecimalField(blank=True, decimal_places=2, help_text='Actual value that exceeded the threshold', max_digits=15, null=True)),
                ('is_escalated', models.BooleanField(default=False, help_text='Whether this alert has been escalated')),
                ('escalated_at', models.DateTimeField(blank=True, help_text='When the alert was escalated', null=True)),
                ('resolved_at', models.DateTimeField(blank=True, help_text='When the alert was resolved', null=True)),
                ('resolution_notes', models.TextField(blank=True, help_text='Notes about how the alert was resolved')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('transaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to='transaction_monitoring.transaction')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Transaction Alert',
                'verbose_name_plural': 'Transaction Alerts',
                'db_table': 'transaction_alerts',
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['alert_type'], name='transaction_alert_t_69c694_idx'), models.Index(fields=['severity'], name='transaction_severit_7e1139_idx'), models.Index(fields=['is_escalated'], name='transaction_is_esca_c3791c_idx'), models.Index(fields=['created_at'], name='transaction_created_197331_idx')],
            },
        ),
    ]
