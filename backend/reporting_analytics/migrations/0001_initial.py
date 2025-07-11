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
            name='AnalyticsDashboard',
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
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('layout', models.JSONField(help_text='Dashboard layout configuration')),
                ('filters', models.JSONField(help_text='Dashboard filters configuration')),
                ('is_public', models.BooleanField(default=False)),
                ('is_template', models.BooleanField(default=False)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='analytics_owned_dashboards', to=settings.AUTH_USER_MODEL)),
                ('shared_with', models.ManyToManyField(blank=True, related_name='analytics_shared_dashboards', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'analytics dashboard',
                'verbose_name_plural': 'analytics dashboards',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='AnalyticsMetric',
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
                ('name', models.CharField(max_length=100)),
                ('metric_type', models.CharField(choices=[('KPI', 'Key Performance Indicator'), ('RISK', 'Risk Metric'), ('COMPLIANCE', 'Compliance Metric'), ('OPERATIONAL', 'Operational Metric'), ('CUSTOM', 'Custom Metric')], max_length=50)),
                ('calculation_method', models.JSONField(help_text='Metric calculation configuration')),
                ('current_value', models.JSONField(help_text='Current metric value and metadata')),
                ('historical_values', models.JSONField(help_text='Historical metric values')),
                ('thresholds', models.JSONField(help_text='Alert thresholds for metric')),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'analytics metric',
                'verbose_name_plural': 'analytics metrics',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='ComplianceReport',
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
                ('report_type', models.CharField(choices=[('STR', 'Suspicious Transaction Report'), ('CTR', 'Currency Transaction Report'), ('SAR', 'Suspicious Activity Report'), ('KYC', 'KYC Compliance Report'), ('AUDIT', 'Audit Report'), ('REGULATORY', 'Regulatory Report')], help_text='Type of compliance report', max_length=50)),
                ('reporting_period', models.CharField(choices=[('DAILY', 'Daily'), ('WEEKLY', 'Weekly'), ('MONTHLY', 'Monthly'), ('QUARTERLY', 'Quarterly'), ('ANNUAL', 'Annual'), ('CUSTOM', 'Custom Period')], max_length=20)),
                ('start_date', models.DateField(help_text='Start date of reporting period')),
                ('end_date', models.DateField(help_text='End date of reporting period')),
                ('data_points', models.JSONField(help_text='Collected data points for the report')),
                ('generated_report', models.FileField(help_text='Generated report file', upload_to='compliance_reports/%Y/%m/')),
                ('submission_status', models.CharField(choices=[('DRAFT', 'Draft'), ('PENDING_REVIEW', 'Pending Review'), ('APPROVED', 'Approved'), ('SUBMITTED', 'Submitted'), ('REJECTED', 'Rejected'), ('AMENDED', 'Amended')], default='DRAFT', max_length=20)),
                ('submission_date', models.DateTimeField(blank=True, help_text='When the report was submitted', null=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('submitted_by', models.ForeignKey(help_text='User who submitted the report', on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Compliance Report',
                'verbose_name_plural': 'Compliance Reports',
            },
        ),
        migrations.CreateModel(
            name='Dashboard',
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
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('layout', models.JSONField(help_text='Dashboard layout configuration')),
                ('filters', models.JSONField(help_text='Dashboard filters configuration')),
                ('is_public', models.BooleanField(default=False)),
                ('is_template', models.BooleanField(default=False)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reporting_dashboard_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reporting_dashboard_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'reporting dashboard',
                'verbose_name_plural': 'reporting dashboards',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='DashboardWidget',
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
                ('name', models.CharField(max_length=100)),
                ('widget_type', models.CharField(choices=[('CHART', 'Chart'), ('TABLE', 'Table'), ('METRIC', 'Metric'), ('MAP', 'Geographic Map'), ('HEATMAP', 'Heat Map'), ('CUSTOM', 'Custom Widget')], max_length=50)),
                ('data_source', models.JSONField(help_text='Data source configuration')),
                ('visualization_config', models.JSONField(help_text='Widget visualization settings')),
                ('refresh_interval', models.IntegerField(default=300, help_text='Widget refresh interval in seconds')),
                ('position', models.JSONField(help_text='Widget position in dashboard grid')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='widgets', to='reporting_analytics.analyticsdashboard')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'dashboard widget',
                'verbose_name_plural': 'dashboard widgets',
                'ordering': ['dashboard', 'name'],
            },
        ),
        migrations.CreateModel(
            name='MetricValue',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=255)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('notes', models.TextField(blank=True)),
                ('hash', models.CharField(blank=True, help_text='SHA-256 hash of critical fields', max_length=64)),
                ('value', models.DecimalField(decimal_places=4, max_digits=20)),
                ('timestamp', models.DateTimeField()),
                ('period_type', models.CharField(choices=[('HOURLY', 'Hourly'), ('DAILY', 'Daily'), ('WEEKLY', 'Weekly'), ('MONTHLY', 'Monthly'), ('QUARTERLY', 'Quarterly'), ('YEARLY', 'Yearly')], max_length=20)),
                ('dimensions', models.JSONField(blank=True, help_text='Dimensional attributes for the metric', null=True)),
                ('metadata', models.JSONField(blank=True, help_text='Additional metadata about the value', null=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('metric', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='values', to='reporting_analytics.analyticsmetric')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'metric value',
                'verbose_name_plural': 'metric values',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='Report',
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
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('report_type', models.CharField(choices=[('REGULATORY', 'Regulatory Report'), ('OPERATIONAL', 'Operational Report'), ('ANALYTICAL', 'Analytical Report'), ('AUDIT', 'Audit Report'), ('MANAGEMENT', 'Management Report'), ('CUSTOM', 'Custom Report')], max_length=50)),
                ('frequency', models.CharField(choices=[('ONE_TIME', 'One Time'), ('DAILY', 'Daily'), ('WEEKLY', 'Weekly'), ('MONTHLY', 'Monthly'), ('QUARTERLY', 'Quarterly'), ('ANNUAL', 'Annual')], max_length=20)),
                ('template', models.JSONField(help_text='Report template configuration')),
                ('parameters', models.JSONField(blank=True, help_text='Report parameters and filters', null=True)),
                ('data_sources', models.JSONField(help_text='Data sources and queries')),
                ('is_scheduled', models.BooleanField(default=False)),
                ('schedule_config', models.JSONField(blank=True, help_text='Scheduling configuration', null=True)),
                ('last_run', models.DateTimeField(blank=True, null=True)),
                ('next_run', models.DateTimeField(blank=True, null=True)),
                ('owner', models.UUIDField()),
                ('shared_with', models.JSONField(blank=True, help_text='Users and roles with access', null=True)),
                ('is_public', models.BooleanField(default=False)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'report',
                'verbose_name_plural': 'reports',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='ReportExecution',
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
                ('execution_id', models.CharField(max_length=50, unique=True)),
                ('parameters_used', models.JSONField(help_text='Parameters used in this execution')),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('RUNNING', 'Running'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed'), ('CANCELLED', 'Cancelled')], default='PENDING', max_length=20)),
                ('started_at', models.DateTimeField()),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('executed_by', models.UUIDField()),
                ('result_file', models.FileField(blank=True, max_length=255, null=True, upload_to='reports/%Y/%m/')),
                ('error_details', models.JSONField(blank=True, help_text='Error details if execution failed', null=True)),
                ('execution_metrics', models.JSONField(blank=True, help_text='Performance metrics of the execution', null=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('report', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='executions', to='reporting_analytics.report')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'report execution',
                'verbose_name_plural': 'report executions',
                'ordering': ['-started_at'],
            },
        ),
        migrations.CreateModel(
            name='ReportTemplate',
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
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
                ('report_type', models.CharField(choices=[('TRANSACTION', 'Transaction Report'), ('CUSTOMER', 'Customer Report'), ('RISK', 'Risk Analysis Report'), ('COMPLIANCE', 'Compliance Report'), ('PERFORMANCE', 'Performance Report'), ('CUSTOM', 'Custom Report')], max_length=50)),
                ('data_sources', models.JSONField(help_text='Data sources and required fields')),
                ('query_definition', models.JSONField(help_text='Report query and filter definitions')),
                ('visualization_config', models.JSONField(help_text='Visualization settings and chart configurations')),
                ('parameters', models.JSONField(help_text='User-configurable report parameters')),
                ('output_formats', models.JSONField(help_text='Supported output formats and settings')),
                ('schedule', models.JSONField(blank=True, help_text='Automatic generation schedule', null=True)),
                ('is_system', models.BooleanField(default=False, help_text='Whether this is a system template')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('owner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='owned_report_templates', to=settings.AUTH_USER_MODEL)),
                ('shared_with', models.ManyToManyField(blank=True, related_name='shared_report_templates', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'report template',
                'verbose_name_plural': 'report templates',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='GeneratedReport',
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
                ('name', models.CharField(max_length=200)),
                ('parameters_used', models.JSONField(help_text='Parameters used for generation')),
                ('data_snapshot', models.JSONField(help_text='Snapshot of report data')),
                ('output_format', models.CharField(choices=[('PDF', 'PDF Document'), ('EXCEL', 'Excel Spreadsheet'), ('CSV', 'CSV File'), ('JSON', 'JSON Data'), ('HTML', 'HTML Document')], max_length=20)),
                ('file_path', models.FileField(blank=True, null=True, upload_to='reports/%Y/%m/')),
                ('generation_status', models.CharField(choices=[('QUEUED', 'Queued'), ('GENERATING', 'Generating'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed')], default='QUEUED', max_length=50)),
                ('error_details', models.JSONField(blank=True, help_text='Error details if generation failed', null=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('generated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='generated_reports', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
                ('template', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='generated_reports', to='reporting_analytics.reporttemplate')),
            ],
            options={
                'verbose_name': 'generated report',
                'verbose_name_plural': 'generated reports',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='analyticsmetric',
            index=models.Index(fields=['metric_type', 'last_updated'], name='reporting_a_metric__89b5f4_idx'),
        ),
        migrations.AddIndex(
            model_name='compliancereport',
            index=models.Index(fields=['report_type', 'reporting_period'], name='reporting_a_report__f16e89_idx'),
        ),
        migrations.AddIndex(
            model_name='compliancereport',
            index=models.Index(fields=['submission_status'], name='reporting_a_submiss_cd325e_idx'),
        ),
        migrations.AddIndex(
            model_name='compliancereport',
            index=models.Index(fields=['start_date', 'end_date'], name='reporting_a_start_d_c2e1db_idx'),
        ),
        migrations.AddIndex(
            model_name='dashboardwidget',
            index=models.Index(fields=['dashboard', 'widget_type'], name='reporting_a_dashboa_94dd17_idx'),
        ),
        migrations.AddIndex(
            model_name='metricvalue',
            index=models.Index(fields=['metric', '-timestamp'], name='reporting_a_metric__16e344_idx'),
        ),
        migrations.AddIndex(
            model_name='metricvalue',
            index=models.Index(fields=['period_type'], name='reporting_a_period__45fb68_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['report_type', 'frequency'], name='reporting_a_report__b31b6f_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['owner', 'is_public'], name='reporting_a_owner_d85296_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['next_run'], name='reporting_a_next_ru_df82b0_idx'),
        ),
        migrations.AddIndex(
            model_name='reportexecution',
            index=models.Index(fields=['report', '-started_at'], name='reporting_a_report__c9444b_idx'),
        ),
        migrations.AddIndex(
            model_name='reportexecution',
            index=models.Index(fields=['status', 'execution_id'], name='reporting_a_status_b3f362_idx'),
        ),
        migrations.AddIndex(
            model_name='reporttemplate',
            index=models.Index(fields=['report_type', 'is_system'], name='reporting_a_report__7afc1d_idx'),
        ),
        migrations.AddIndex(
            model_name='reporttemplate',
            index=models.Index(fields=['owner'], name='reporting_a_owner_i_24d902_idx'),
        ),
        migrations.AddIndex(
            model_name='generatedreport',
            index=models.Index(fields=['template', '-created_at'], name='reporting_a_templat_a7e2b5_idx'),
        ),
        migrations.AddIndex(
            model_name='generatedreport',
            index=models.Index(fields=['generation_status'], name='reporting_a_generat_7827fc_idx'),
        ),
    ]
