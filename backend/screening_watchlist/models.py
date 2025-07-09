
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import RegexValidator
from core.models import AbstractBaseModel, CountryRiskCategory, UserActionMixin, RiskLevelMixin, StatusMixin
from core.constants import RiskLevel
from customer_management.models import Customer
from transaction_monitoring.models import Transaction

class WatchlistSource(AbstractBaseModel):
    """
    Model for managing different watchlist sources
    """
    name = models.CharField(max_length=100, unique=True)
    source_type = models.CharField(
        max_length=50,
        choices=[
            ('SANCTIONS', _('Sanctions List')),
            ('PEP', _('Politically Exposed Persons')),
            ('LAW_ENFORCEMENT', _('Law Enforcement')),
            ('ADVERSE_MEDIA', _('Adverse Media')),
            ('REGULATORY', _('Regulatory')),
            ('INTERNAL', _('Internal List'))
        ]
    )
    provider = models.CharField(max_length=100)
    description = models.TextField()
    update_frequency = models.CharField(
        max_length=20,
        choices=[
            ('REAL_TIME', _('Real-time')),
            ('DAILY', _('Daily')),
            ('WEEKLY', _('Weekly')),
            ('MONTHLY', _('Monthly')),
            ('QUARTERLY', _('Quarterly'))
        ]
    )
    last_updated = models.DateTimeField(null=True)
    next_update = models.DateTimeField(null=True)
    api_endpoint = models.URLField(blank=True)
    api_credentials = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('watchlist source')
        verbose_name_plural = _('watchlist sources')
        ordering = ['name']
        indexes = [
            models.Index(fields=['source_type', 'is_active']),
            models.Index(fields=['last_updated']),
        ]

    def __str__(self):
        return f"{self.name} ({self.source_type})"

class WatchlistEntry(AbstractBaseModel, RiskLevelMixin):
    """
    Model for watchlist entries with multilingual support
    """
    name = models.CharField(max_length=200)
    alias = models.CharField(max_length=200, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices)
    description = models.TextField(blank=True)
    source = models.CharField(max_length=100)
    source_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    last_checked = models.DateTimeField(null=True, blank=True)
    
    # Detailed Information
    details = models.JSONField(
        help_text=_('Detailed information in multiple languages')
    )
    identifiers = models.JSONField(
        help_text=_('Identification numbers, codes, etc.')
    )
    addresses = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Associated addresses')
    )
    relationships = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Related entities/individuals')
    )
    
    # Metadata
    last_updated = models.DateTimeField(auto_now=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('watchlist entry')
        verbose_name_plural = _('watchlist entries')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['risk_level', 'is_active'])
        ]

    def __str__(self):
        return f"{self.name} ({self.nationality})"

class SanctionedCountry(AbstractBaseModel, RiskLevelMixin):
    """
    Model for managing sanctioned and high-risk countries
    """
    country_name = models.CharField(max_length=100)
    country_code = models.CharField(max_length=3)  # ISO 3166-1 alpha-3
    sanctions_programs = models.JSONField(
        help_text=_('Active sanctions programs affecting this country')
    )
    restrictions = models.JSONField(
        help_text=_('Specific restrictions or prohibitions')
    )
    effective_date = models.DateField()
    last_updated = models.DateTimeField()
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('sanctioned country')
        verbose_name_plural = _('sanctioned countries')
        ordering = ['country_name']
        indexes = [
            models.Index(fields=['country_code']),
            models.Index(fields=['risk_level']),
        ]

    def __str__(self):
        return f"{self.country_name} ({self.risk_level})"

class ScreeningConfiguration(AbstractBaseModel):
    """
    Model for configuring screening parameters
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    screening_type = models.CharField(
        max_length=50,
        choices=[
            ('NAME', _('Name Screening')),
            ('TRANSACTION', _('Transaction Screening')),
            ('DOCUMENT', _('Document Screening')),
            ('ADDRESS', _('Address Screening'))
        ]
    )
    sources = models.JSONField(
        help_text=_('Watchlist sources to check')
    )
    matching_rules = models.JSONField(
        help_text=_('Name matching and scoring rules')
    )
    threshold_settings = models.JSONField(
        help_text=_('Match threshold settings')
    )
    language_settings = models.JSONField(
        help_text=_('Language-specific configurations')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('screening configuration')
        verbose_name_plural = _('screening configurations')
        ordering = ['name']
        indexes = [
            models.Index(fields=['screening_type', 'is_active'])
        ]

    def __str__(self):
        return self.name

class ScreeningHistory(AbstractBaseModel):
    """
    Model for tracking screening history and results
    """
    entity_id = models.UUIDField(
        help_text=_('ID of the screened entity (customer, transaction, etc.)')
    )
    entity_type = models.CharField(
        max_length=50,
        help_text=_('Type of entity screened')
    )
    configuration = models.ForeignKey(
        ScreeningConfiguration,
        on_delete=models.PROTECT,
        related_name='screening_history'
    )
    screening_date = models.DateTimeField()
    completion_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('IN_PROGRESS', _('In Progress')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed'))
        ],
        default='PENDING'
    )
    matches_found = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Details of matches found')
    )
    error_details = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Details of any errors encountered')
    )
    processing_time = models.DurationField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('screening history')
        verbose_name_plural = _('screening history')
        ordering = ['-screening_date']
        indexes = [
            models.Index(fields=['entity_id', 'entity_type']),
            models.Index(fields=['status', 'screening_date']),
        ]

    def __str__(self):
        return f"{self.entity_type} - {self.entity_id} ({self.status})"

class WatchlistMatch(AbstractBaseModel):
    """
    Model for tracking matches between entities and watchlist entries
    """
    entry = models.ForeignKey(
        'WatchlistEntry',
        on_delete=models.CASCADE,
        related_name='watchlist_matches'
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='screening_watchlist_matches',
        null=True,
        blank=True
    )
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='screening_watchlist_matches',
        null=True,
        blank=True
    )
    match_type = models.CharField(
        max_length=50,
        choices=[
            ('EXACT', _('Exact Match')),
            ('PARTIAL', _('Partial Match')),
            ('PHONETIC', _('Phonetic Match')),
            ('FUZZY', _('Fuzzy Match')),
            ('MANUAL', _('Manual Match'))
        ]
    )
    match_score = models.FloatField(
        help_text=_('Match confidence score (0-100)')
    )
    match_details = models.JSONField(
        help_text=_('Detailed matching information')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending Review')),
            ('CONFIRMED', _('Confirmed Match')),
            ('FALSE_POSITIVE', _('False Positive')),
            ('UNDER_INVESTIGATION', _('Under Investigation')),
            ('CLOSED', _('Closed'))
        ],
        default='PENDING'
    )
    reviewed_by = models.UUIDField(null=True, blank=True)
    review_date = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='screening_watchlist_match_created'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='screening_watchlist_match_updated'
    )
    
    class Meta:
        verbose_name = _('watchlist match')
        verbose_name_plural = _('watchlist matches')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['match_type', 'status']),
            models.Index(fields=['match_score']),
        ]

    def __str__(self):
        return f"{self.entry} - {self.customer or self.transaction} ({self.match_type})"

class WatchlistProvider(AbstractBaseModel):
    """
    Model for external watchlist data providers
    """
    name = models.CharField(max_length=100, unique=True)
    provider_type = models.CharField(
        max_length=50,
        choices=[
            ('SANCTIONS', _('Sanctions Lists')),
            ('PEP', _('Politically Exposed Persons')),
            ('ADVERSE_MEDIA', _('Adverse Media')),
            ('LAW_ENFORCEMENT', _('Law Enforcement')),
            ('REGULATORY', _('Regulatory Lists')),
            ('CUSTOM', _('Custom Lists'))
        ]
    )
    description = models.TextField()
    api_credentials = models.JSONField(
        help_text=_('API authentication credentials')
    )
    update_frequency = models.CharField(
        max_length=20,
        choices=[
            ('REALTIME', _('Real-time')),
            ('DAILY', _('Daily')),
            ('WEEKLY', _('Weekly')),
            ('MONTHLY', _('Monthly'))
        ]
    )
    last_updated = models.DateTimeField(null=True, blank=True)
    next_update = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('watchlist provider')
        verbose_name_plural = _('watchlist providers')
        ordering = ['name']
        indexes = [
            models.Index(fields=['provider_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.provider_type})"

class ScreeningMatch(AbstractBaseModel):
    """
    Model for screening matches
    """
    match_id = models.CharField(max_length=100, unique=True)
    watchlist_entry = models.ForeignKey(
        'WatchlistEntry',
        on_delete=models.PROTECT,
        related_name='screening_matches'
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='screening_matches'
    )
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='screening_matches'
    )
    match_type = models.CharField(
        max_length=50,
        choices=[
            ('NAME', _('Name Match')),
            ('ALIAS', _('Alias Match')),
            ('ADDRESS', _('Address Match')),
            ('ID', _('ID Match')),
            ('RELATIONSHIP', _('Relationship Match'))
        ]
    )
    match_strength = models.FloatField(
        help_text=_('Match confidence score (0-1)')
    )
    matched_fields = models.JSONField(
        help_text=_('Details of matched fields')
    )
    screening_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('NEW', _('New')),
            ('REVIEWING', _('Under Review')),
            ('CONFIRMED', _('Confirmed Match')),
            ('FALSE_POSITIVE', _('False Positive')),
            ('RESOLVED', _('Resolved'))
        ],
        default='NEW'
    )
    resolution_notes = models.TextField(blank=True)
    resolved_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('screening match')
        verbose_name_plural = _('screening matches')
        ordering = ['-screening_date']
        indexes = [
            models.Index(fields=['match_type', 'status']),
            models.Index(fields=['match_strength']),
        ]

    def __str__(self):
        return f"{self.match_id} - {self.watchlist_entry} ({self.match_type})"

class ScreeningBatch(AbstractBaseModel):
    """
    Model for batch screening operations
    """
    name = models.CharField(max_length=100)
    batch_type = models.CharField(
        max_length=50,
        choices=[
            ('INITIAL', _('Initial Screening')),
            ('PERIODIC', _('Periodic Review')),
            ('TRIGGERED', _('Triggered Review')),
            ('BACKFILL', _('Historical Backfill'))
        ]
    )
    providers = models.ManyToManyField(
        WatchlistProvider,
        related_name='screening_batches'
    )
    filters = models.JSONField(
        help_text=_('Screening criteria and filters')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', _('Pending')),
            ('RUNNING', _('Running')),
            ('COMPLETED', _('Completed')),
            ('FAILED', _('Failed')),
            ('CANCELLED', _('Cancelled'))
        ],
        default='PENDING'
    )
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    total_records = models.IntegerField(default=0)
    processed_records = models.IntegerField(default=0)
    matched_records = models.IntegerField(default=0)
    error_details = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Error information if failed')
    )
    
    # User tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_batches'
    )
    
    class Meta:
        verbose_name = _('screening batch')
        verbose_name_plural = _('screening batches')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['batch_type', 'status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.batch_type})"

class NameMatchingRule(AbstractBaseModel):
    """
    Model for name matching rules and algorithms
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    language = models.CharField(
        max_length=10,
        choices=[
            ('en', _('English')),
            ('ar', _('Arabic')),
            ('zh', _('Chinese')),
            ('ru', _('Russian')),
            ('fa', _('Farsi')),
            ('ur', _('Urdu'))
        ]
    )
    script = models.CharField(
        max_length=20,
        choices=[
            ('LATIN', _('Latin')),
            ('ARABIC', _('Arabic')),
            ('CHINESE', _('Chinese')),
            ('CYRILLIC', _('Cyrillic')),
            ('DEVANAGARI', _('Devanagari'))
        ]
    )
    matching_algorithm = models.CharField(
        max_length=50,
        choices=[
            ('EXACT', _('Exact Match')),
            ('FUZZY', _('Fuzzy Match')),
            ('PHONETIC', _('Phonetic Match')),
            ('TRANSLITERATION', _('Transliteration Match')),
            ('ML', _('Machine Learning'))
        ]
    )
    algorithm_config = models.JSONField(
        help_text=_('Algorithm-specific configuration')
    )
    threshold = models.FloatField(
        help_text=_('Minimum match threshold (0-1)')
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('name matching rule')
        verbose_name_plural = _('name matching rules')
        unique_together = ['language', 'script', 'matching_algorithm']
        indexes = [
            models.Index(fields=['language', 'script']),
            models.Index(fields=['matching_algorithm', 'is_active'])
        ]
