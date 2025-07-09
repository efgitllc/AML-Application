from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import AbstractBaseModel, StatusMixin
import uuid


class DataSource(AbstractBaseModel):
    """
    External data sources for import/export operations
    """
    name = models.CharField(max_length=100, unique=True)
    source_type = models.CharField(
        max_length=50,
        choices=[
            ('DATABASE', _('Database')),
            ('FILE_SYSTEM', _('File System')),
            ('API', _('API Endpoint')),
            ('FTP', _('FTP Server')),
            ('SFTP', _('SFTP Server')),
            ('CLOUD_STORAGE', _('Cloud Storage')),
            ('EMAIL', _('Email Attachments')),
            ('WEBHOOK', _('Webhook')),
            ('MANUAL', _('Manual Upload')),
            ('OTHER', _('Other'))
        ]
    )
    description = models.TextField()
    connection_config = models.JSONField(
        help_text=_('Connection configuration parameters')
    )
    authentication_config = models.JSONField(
        help_text=_('Authentication credentials and settings')
    )
    data_format = models.CharField(
        max_length=30,
        choices=[
            ('CSV', _('CSV')),
            ('EXCEL', _('Excel')),
            ('JSON', _('JSON')),
            ('XML', _('XML')),
            ('PDF', _('PDF')),
            ('TXT', _('Text')),
            ('DATABASE', _('Database')),
            ('API_JSON', _('API JSON')),
            ('API_XML', _('API XML')),
            ('BINARY', _('Binary'))
        ]
    )
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('REAL_TIME', _('Real-time')),
            ('HOURLY', _('Hourly')),
            ('DAILY', _('Daily')),
            ('WEEKLY', _('Weekly')),
            ('MONTHLY', _('Monthly')),
            ('ON_DEMAND', _('On Demand'))
        ],
        default='ON_DEMAND'
    )
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('data source')
        verbose_name_plural = _('data sources')
        ordering = ['name']
        indexes = [
            models.Index(fields=['source_type', 'data_format']),
            models.Index(fields=['is_active', 'frequency']),
        ]

    def __str__(self):
        return f"{self.name} ({self.source_type})"


class ImportTemplate(AbstractBaseModel):
    """
    Templates for data import operations
    """
    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER_DATA', _('Customer Data')),
            ('TRANSACTION_DATA', _('Transaction Data')),
            ('WATCHLIST_DATA', _('Watchlist Data')),
            ('DOCUMENT_DATA', _('Document Data')),
            ('CASE_DATA', _('Case Data')),
            ('USER_DATA', _('User Data')),
            ('CONFIGURATION', _('Configuration Data')),
            ('BULK_UPLOAD', _('Bulk Upload')),
            ('MIGRATION', _('Data Migration')),
            ('CUSTOM', _('Custom Template'))
        ]
    )
    description = models.TextField()
    target_model = models.CharField(
        max_length=100,
        help_text=_('Target Django model for import')
    )
    field_mapping = models.JSONField(
        help_text=_('Field mapping configuration')
    )
    validation_rules = models.JSONField(
        help_text=_('Data validation rules')
    )
    transformation_rules = models.JSONField(
        help_text=_('Data transformation rules')
    )
    duplicate_handling = models.CharField(
        max_length=30,
        choices=[
            ('SKIP', _('Skip Duplicates')),
            ('UPDATE', _('Update Existing')),
            ('CREATE_NEW', _('Create New')),
            ('ERROR', _('Raise Error')),
            ('MERGE', _('Merge Data'))
        ],
        default='SKIP'
    )
    batch_size = models.IntegerField(
        default=1000,
        validators=[MinValueValidator(1), MaxValueValidator(10000)]
    )
    is_active = models.BooleanField(default=True)
    version = models.CharField(max_length=20, default='1.0')
    
    class Meta:
        verbose_name = _('import template')
        verbose_name_plural = _('import templates')
        ordering = ['name', '-version']
        unique_together = ['name', 'version']
        indexes = [
            models.Index(fields=['template_type', 'is_active']),
            models.Index(fields=['target_model']),
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"


class ImportJob(AbstractBaseModel, StatusMixin):
    """
    Data import job instances
    """
    job_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=150)
    template = models.ForeignKey(
        ImportTemplate,
        on_delete=models.PROTECT,
        related_name='jobs'
    )
    data_source = models.ForeignKey(
        DataSource,
        on_delete=models.PROTECT,
        related_name='import_jobs'
    )
    
    # Job Configuration
    source_file_path = models.CharField(
        max_length=500,
        blank=True,
        help_text=_('Path to source file/data')
    )
    source_query = models.TextField(
        blank=True,
        help_text=_('Query for database sources')
    )
    parameters = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Additional job parameters')
    )
    
    # Scheduling
    scheduled_for = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When to run the job')
    )
    is_recurring = models.BooleanField(default=False)
    recurrence_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Recurrence configuration')
    )
    
    # Execution
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('QUEUED', _('Queued')),
            ('RUNNING', _('Running')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled')),
            ('PARTIAL', _('Partially Completed'))
        ],
        default='PENDING'
    )
    
    # Results
    total_records = models.IntegerField(default=0)
    processed_records = models.IntegerField(default=0)
    successful_records = models.IntegerField(default=0)
    failed_records = models.IntegerField(default=0)
    skipped_records = models.IntegerField(default=0)
    
    # User Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_import_jobs'
    )
    
    # Error Handling
    error_log = models.TextField(blank=True)
    error_file_path = models.CharField(
        max_length=500,
        blank=True,
        help_text=_('Path to error log file')
    )
    
    class Meta:
        verbose_name = _('import job')
        verbose_name_plural = _('import jobs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['template', 'status']),
            models.Index(fields=['data_source', 'started_at']),
            models.Index(fields=['scheduled_for']),
            models.Index(fields=['is_recurring']),
        ]

    def __str__(self):
        return f"{self.name} - {self.status}"


class ExportTemplate(AbstractBaseModel):
    """
    Templates for data export operations
    """
    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(
        max_length=50,
        choices=[
            ('CUSTOMER_EXPORT', _('Customer Export')),
            ('TRANSACTION_EXPORT', _('Transaction Export')),
            ('CASE_EXPORT', _('Case Export')),
            ('REPORT_EXPORT', _('Report Export')),
            ('AUDIT_EXPORT', _('Audit Export')),
            ('COMPLIANCE_EXPORT', _('Compliance Export')),
            ('BACKUP_EXPORT', _('Backup Export')),
            ('REGULATORY_FILING', _('Regulatory Filing')),
            ('CUSTOM_EXPORT', _('Custom Export'))
        ]
    )
    description = models.TextField()
    source_model = models.CharField(
        max_length=100,
        help_text=_('Source Django model for export')
    )
    query_config = models.JSONField(
        help_text=_('Query configuration for data selection')
    )
    field_selection = models.JSONField(
        help_text=_('Fields to include in export')
    )
    output_format = models.CharField(
        max_length=30,
        choices=[
            ('CSV', _('CSV')),
            ('EXCEL', _('Excel')),
            ('JSON', _('JSON')),
            ('XML', _('XML')),
            ('PDF', _('PDF')),
            ('TXT', _('Text')),
            ('ZIP', _('ZIP Archive')),
            ('ENCRYPTED', _('Encrypted File'))
        ]
    )
    transformation_rules = models.JSONField(
        help_text=_('Data transformation rules for export')
    )
    encryption_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Encryption configuration for sensitive data')
    )
    is_active = models.BooleanField(default=True)
    version = models.CharField(max_length=20, default='1.0')
    
    class Meta:
        verbose_name = _('export template')
        verbose_name_plural = _('export templates')
        ordering = ['name', '-version']
        unique_together = ['name', 'version']
        indexes = [
            models.Index(fields=['template_type', 'is_active']),
            models.Index(fields=['source_model']),
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"


class ExportJob(AbstractBaseModel, StatusMixin):
    """
    Data export job instances
    """
    job_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=150)
    template = models.ForeignKey(
        ExportTemplate,
        on_delete=models.PROTECT,
        related_name='jobs'
    )
    
    # Job Configuration
    filters = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Additional filters for data selection')
    )
    parameters = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Additional job parameters')
    )
    
    # Output Configuration
    output_destination = models.CharField(
        max_length=500,
        help_text=_('Output file path or destination')
    )
    delivery_method = models.CharField(
        max_length=30,
        choices=[
            ('DOWNLOAD', _('Download Link')),
            ('EMAIL', _('Email Attachment')),
            ('FTP', _('FTP Upload')),
            ('SFTP', _('SFTP Upload')),
            ('API', _('API Delivery')),
            ('CLOUD_STORAGE', _('Cloud Storage')),
            ('LOCAL_STORAGE', _('Local Storage'))
        ],
        default='DOWNLOAD'
    )
    delivery_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Delivery method configuration')
    )
    
    # Scheduling
    scheduled_for = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When to run the job')
    )
    is_recurring = models.BooleanField(default=False)
    recurrence_config = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Recurrence configuration')
    )
    
    # Execution
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('QUEUED', _('Queued')),
            ('RUNNING', _('Running')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='PENDING'
    )
    
    # Results
    total_records = models.IntegerField(default=0)
    exported_records = models.IntegerField(default=0)
    file_size = models.BigIntegerField(
        default=0,
        help_text=_('Output file size in bytes')
    )
    download_count = models.IntegerField(default=0)
    
    # Security
    access_token = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Access token for secure downloads')
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When download link expires')
    )
    
    # User Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_export_jobs'
    )
    
    # Error Handling
    error_log = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('export job')
        verbose_name_plural = _('export jobs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['template', 'status']),
            models.Index(fields=['created_by', 'started_at']),
            models.Index(fields=['scheduled_for']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.name} - {self.status}"


class DataMigration(AbstractBaseModel):
    """
    Data migration and transformation jobs
    """
    migration_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=150)
    migration_type = models.CharField(
        max_length=50,
        choices=[
            ('SYSTEM_UPGRADE', _('System Upgrade')),
            ('DATA_MIGRATION', _('Data Migration')),
            ('SCHEMA_CHANGE', _('Schema Change')),
            ('PLATFORM_MIGRATION', _('Platform Migration')),
            ('DATA_CLEANUP', _('Data Cleanup')),
            ('CONSOLIDATION', _('Data Consolidation')),
            ('ARCHIVE', _('Data Archive')),
            ('RESTORE', _('Data Restore'))
        ]
    )
    description = models.TextField()
    
    # Source and Target
    source_config = models.JSONField(
        help_text=_('Source system/database configuration')
    )
    target_config = models.JSONField(
        help_text=_('Target system/database configuration')
    )
    
    # Migration Configuration
    migration_plan = models.JSONField(
        help_text=_('Detailed migration plan and steps')
    )
    mapping_rules = models.JSONField(
        help_text=_('Data mapping and transformation rules')
    )
    validation_rules = models.JSONField(
        help_text=_('Data validation rules')
    )
    rollback_plan = models.JSONField(
        help_text=_('Rollback plan and procedures')
    )
    
    # Execution
    planned_start = models.DateTimeField()
    planned_end = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PLANNED', _('Planned')),
            ('APPROVED', _('Approved')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('ROLLED_BACK', _('Rolled Back')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='PLANNED'
    )
    
    # Team
    migration_lead = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='led_migrations'
    )
    team_members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='participated_migrations'
    )
    
    # Results and Metrics
    total_records = models.BigIntegerField(default=0)
    migrated_records = models.BigIntegerField(default=0)
    failed_records = models.BigIntegerField(default=0)
    data_integrity_checks = models.JSONField(
        help_text=_('Data integrity check results')
    )
    performance_metrics = models.JSONField(
        help_text=_('Migration performance metrics')
    )
    
    # Documentation
    execution_log = models.TextField(blank=True)
    post_migration_report = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('data migration')
        verbose_name_plural = _('data migrations')
        ordering = ['-planned_start']
        indexes = [
            models.Index(fields=['migration_type', 'status']),
            models.Index(fields=['migration_lead']),
            models.Index(fields=['planned_start', 'planned_end']),
        ]

    def __str__(self):
        return f"{self.name} ({self.migration_type})"


class DataSyncJob(AbstractBaseModel):
    """
    Ongoing data synchronization jobs
    """
    sync_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=150)
    sync_type = models.CharField(
        max_length=30,
        choices=[
            ('ONE_WAY', _('One-way Sync')),
            ('TWO_WAY', _('Two-way Sync')),
            ('MERGE', _('Merge Sync')),
            ('REPLICATE', _('Replication'))
        ]
    )
    
    # Source and Target
    source_system = models.ForeignKey(
        DataSource,
        on_delete=models.PROTECT,
        related_name='sync_jobs_as_source'
    )
    target_system = models.ForeignKey(
        DataSource,
        on_delete=models.PROTECT,
        related_name='sync_jobs_as_target'
    )
    
    # Sync Configuration
    sync_config = models.JSONField(
        help_text=_('Synchronization configuration')
    )
    conflict_resolution = models.CharField(
        max_length=30,
        choices=[
            ('SOURCE_WINS', _('Source Wins')),
            ('TARGET_WINS', _('Target Wins')),
            ('MANUAL', _('Manual Resolution')),
            ('MERGE', _('Automatic Merge'))
        ],
        default='SOURCE_WINS'
    )
    
    # Scheduling
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('REAL_TIME', _('Real-time')),
            ('HOURLY', _('Hourly')),
            ('DAILY', _('Daily')),
            ('WEEKLY', _('Weekly')),
            ('MONTHLY', _('Monthly'))
        ]
    )
    schedule_config = models.JSONField(
        help_text=_('Detailed schedule configuration')
    )
    
    # Status and Metrics
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    next_sync = models.DateTimeField(null=True, blank=True)
    sync_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = _('data sync job')
        verbose_name_plural = _('data sync jobs')
        ordering = ['name']
        indexes = [
            models.Index(fields=['sync_type', 'is_active']),
            models.Index(fields=['frequency', 'next_sync']),
            models.Index(fields=['source_system', 'target_system']),
        ]

    def __str__(self):
        return f"{self.name} ({self.sync_type})"


class DataQualityRule(AbstractBaseModel):
    """
    Data quality rules for import/export validation
    """
    name = models.CharField(max_length=100, unique=True)
    rule_type = models.CharField(
        max_length=30,
        choices=[
            ('COMPLETENESS', _('Completeness Check')),
            ('ACCURACY', _('Accuracy Check')),
            ('CONSISTENCY', _('Consistency Check')),
            ('VALIDITY', _('Validity Check')),
            ('UNIQUENESS', _('Uniqueness Check')),
            ('INTEGRITY', _('Referential Integrity')),
            ('FORMAT', _('Format Check')),
            ('RANGE', _('Range Check'))
        ]
    )
    description = models.TextField()
    target_fields = models.JSONField(
        help_text=_('Fields to apply this rule to')
    )
    rule_config = models.JSONField(
        help_text=_('Rule configuration and parameters')
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('INFO', _('Information')),
            ('WARNING', _('Warning')),
            ('ERROR', _('Error')),
            ('CRITICAL', _('Critical'))
        ],
        default='ERROR'
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('data quality rule')
        verbose_name_plural = _('data quality rules')
        ordering = ['name']
        indexes = [
            models.Index(fields=['rule_type', 'severity']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.rule_type})"


class DataQualityCheck(AbstractBaseModel):
    """
    Data quality check results
    """
    check_id = models.UUIDField(default=uuid.uuid4, unique=True)
    rule = models.ForeignKey(
        DataQualityRule,
        on_delete=models.CASCADE,
        related_name='checks'
    )
    job_type = models.CharField(
        max_length=20,
        choices=[
            ('IMPORT', _('Import Job')),
            ('EXPORT', _('Export Job')),
            ('MIGRATION', _('Migration Job')),
            ('SYNC', _('Sync Job'))
        ]
    )
    job_id = models.UUIDField(
        help_text=_('Reference to the associated job')
    )
    check_date = models.DateTimeField(default=timezone.now)
    records_checked = models.IntegerField()
    issues_found = models.IntegerField()
    passed = models.BooleanField()
    check_details = models.JSONField(
        help_text=_('Detailed check results')
    )
    sample_issues = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Sample of issues found')
    )
    
    class Meta:
        verbose_name = _('data quality check')
        verbose_name_plural = _('data quality checks')
        ordering = ['-check_date']
        indexes = [
            models.Index(fields=['rule', 'job_type']),
            models.Index(fields=['job_id', 'check_date']),
            models.Index(fields=['passed']),
        ]

    def __str__(self):
        return f"{self.rule.name} - {self.check_date}" 