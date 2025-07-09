from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel

class DataRepository(AbstractBaseModel):
    """
    Model for managing data repositories
    """
    name = models.CharField(max_length=100, unique=True)
    repository_type = models.CharField(
        max_length=50,
        choices=[
            ('DOCUMENT', _('Document Repository')),
            ('TRANSACTION', _('Transaction Data')),
            ('CUSTOMER', _('Customer Data')),
            ('AUDIT', _('Audit Data')),
            ('ARCHIVE', _('Archive')),
            ('OTHER', _('Other'))
        ]
    )
    description = models.TextField()
    storage_location = models.CharField(max_length=255)
    storage_type = models.CharField(
        max_length=50,
        choices=[
            ('LOCAL', _('Local Storage')),
            ('S3', _('Amazon S3')),
            ('AZURE_BLOB', _('Azure Blob Storage')),
            ('GCS', _('Google Cloud Storage')),
            ('OTHER', _('Other'))
        ]
    )
    storage_config = models.JSONField(
        help_text=_('Storage configuration details')
    )
    retention_policy = models.JSONField(
        help_text=_('Data retention policy configuration')
    )
    access_policy = models.JSONField(
        help_text=_('Access control policy')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('data repository')
        verbose_name_plural = _('data repositories')
        ordering = ['name']
        indexes = [
            models.Index(fields=['repository_type', 'is_active']),
            models.Index(fields=['storage_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.repository_type})"

class DataImport(AbstractBaseModel):
    """
    Model for tracking data import operations
    """
    import_id = models.CharField(max_length=100, unique=True)
    repository = models.ForeignKey(
        DataRepository,
        on_delete=models.CASCADE,
        related_name='imports'
    )
    import_type = models.CharField(
        max_length=50,
        choices=[
            ('BULK', _('Bulk Import')),
            ('INCREMENTAL', _('Incremental Import')),
            ('MIGRATION', _('Data Migration')),
            ('SYNC', _('Data Synchronization')),
            ('OTHER', _('Other'))
        ]
    )
    source_system = models.CharField(max_length=100)
    source_format = models.CharField(
        max_length=20,
        choices=[
            ('CSV', 'CSV'),
            ('JSON', 'JSON'),
            ('XML', 'XML'),
            ('SQL', 'SQL'),
            ('OTHER', _('Other'))
        ]
    )
    file_path = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('VALIDATED', _('Validated')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='PENDING'
    )
    total_records = models.IntegerField(default=0)
    processed_records = models.IntegerField(default=0)
    failed_records = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_log = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Details of any errors encountered')
    )
    
    class Meta:
        verbose_name = _('data import')
        verbose_name_plural = _('data imports')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['repository', 'import_type']),
            models.Index(fields=['status', 'import_id']),
        ]

    def __str__(self):
        return f"{self.import_type} - {self.import_id}"

class DataExport(AbstractBaseModel):
    """
    Model for tracking data export operations
    """
    export_id = models.CharField(max_length=100, unique=True)
    repository = models.ForeignKey(
        DataRepository,
        on_delete=models.CASCADE,
        related_name='exports'
    )
    export_type = models.CharField(
        max_length=50,
        choices=[
            ('FULL', _('Full Export')),
            ('PARTIAL', _('Partial Export')),
            ('REPORT', _('Report Export')),
            ('ARCHIVE', _('Archive Export')),
            ('OTHER', _('Other'))
        ]
    )
    target_format = models.CharField(
        max_length=20,
        choices=[
            ('CSV', 'CSV'),
            ('JSON', 'JSON'),
            ('XML', 'XML'),
            ('PDF', 'PDF'),
            ('OTHER', _('Other'))
        ]
    )
    filter_criteria = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Export filter criteria')
    )
    status = models.CharField(
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
    file_path = models.CharField(max_length=255, blank=True)
    total_records = models.IntegerField(default=0)
    exported_records = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_log = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Details of any errors encountered')
    )
    
    class Meta:
        verbose_name = _('data export')
        verbose_name_plural = _('data exports')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['repository', 'export_type']),
            models.Index(fields=['status', 'export_id']),
        ]

    def __str__(self):
        return f"{self.export_type} - {self.export_id}"

class DataArchive(AbstractBaseModel):
    """
    Model for managing data archives
    """
    archive_id = models.CharField(max_length=100, unique=True)
    repository = models.ForeignKey(
        DataRepository,
        on_delete=models.CASCADE,
        related_name='archives'
    )
    archive_type = models.CharField(
        max_length=50,
        choices=[
            ('PERIODIC', _('Periodic Archive')),
            ('RETENTION', _('Retention Archive')),
            ('COMPLIANCE', _('Compliance Archive')),
            ('MANUAL', _('Manual Archive')),
            ('OTHER', _('Other'))
        ]
    )
    data_type = models.CharField(max_length=50)
    date_range = models.JSONField(
        help_text=_('Date range of archived data')
    )
    storage_location = models.CharField(max_length=255)
    compression_type = models.CharField(
        max_length=20,
        choices=[
            ('ZIP', 'ZIP'),
            ('GZIP', 'GZIP'),
            ('TAR', 'TAR'),
            ('NONE', _('None'))
        ],
        default='ZIP'
    )
    size_bytes = models.BigIntegerField()
    record_count = models.IntegerField()
    is_encrypted = models.BooleanField(default=True)
    encryption_details = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Encryption configuration details')
    )
    retention_period = models.DurationField()
    expiry_date = models.DateTimeField()
    
    class Meta:
        verbose_name = _('data archive')
        verbose_name_plural = _('data archives')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['repository', 'archive_type']),
            models.Index(fields=['archive_id', 'expiry_date']),
        ]

    def __str__(self):
        return f"{self.archive_type} - {self.archive_id}"
