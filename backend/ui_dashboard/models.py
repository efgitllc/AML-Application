from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from core.models import AbstractBaseModel


class Dashboard(AbstractBaseModel):
    """
    Model for UI dashboards
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ui_owned_dashboards'
    )
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='ui_shared_dashboards',
        blank=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ui_dashboard_created'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ui_dashboard_updated'
    )
    layout = models.JSONField(
        help_text=_('Dashboard layout configuration')
    )
    filters = models.JSONField(
        help_text=_('Dashboard filters configuration')
    )
    is_public = models.BooleanField(default=False)
    is_template = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('UI dashboard')
        verbose_name_plural = _('UI dashboards')
        ordering = ['name']

    def __str__(self):
        return self.name

class Widget(AbstractBaseModel):
    """
    Model for dashboard widgets
    """
    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE,
        related_name='widgets'
    )
    name = models.CharField(max_length=100)
    widget_type = models.CharField(
        max_length=50,
        choices=[
            ('CHART', _('Chart')),
            ('TABLE', _('Table')),
            ('METRIC', _('Metric')),
            ('MAP', _('Geographic Map')),
            ('HEATMAP', _('Heat Map')),
            ('ALERT', _('Alert Widget')),
            ('CUSTOM', _('Custom Widget'))
        ]
    )
    data_source = models.JSONField(
        help_text=_('Widget data source configuration')
    )
    visualization = models.JSONField(
        help_text=_('Widget visualization settings')
    )
    filters = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Widget-specific filters')
    )
    refresh_interval = models.IntegerField(
        help_text=_('Widget refresh interval in seconds'),
        default=300
    )
    position = models.JSONField(
        help_text=_('Widget position in dashboard grid')
    )
    size = models.JSONField(
        help_text=_('Widget size configuration')
    )
    
    class Meta:
        verbose_name = _('widget')
        verbose_name_plural = _('widgets')
        ordering = ['dashboard', 'name']
        indexes = [
            models.Index(fields=['dashboard', 'widget_type']),
        ]

    def __str__(self):
        return f"{self.dashboard.name} - {self.name}"

class Theme(AbstractBaseModel):
    """
    Model for UI theme configuration
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    colors = models.JSONField(
        help_text=_('Theme color palette')
    )
    typography = models.JSONField(
        help_text=_('Typography configuration')
    )
    components = models.JSONField(
        help_text=_('Component style configuration')
    )
    layout = models.JSONField(
        help_text=_('Layout configuration')
    )
    is_system = models.BooleanField(
        help_text=_('Whether this is a system theme'),
        default=False
    )
    is_active = models.BooleanField(default=True)
    
    # Creator
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_themes'
    )
    
    class Meta:
        verbose_name = _('theme')
        verbose_name_plural = _('themes')
        ordering = ['name']
        indexes = [
            models.Index(fields=['is_system', 'is_active']),
        ]

    def __str__(self):
        return self.name

class UserPreference(AbstractBaseModel):
    """
    Model for user UI preferences
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ui_preferences'
    )
    theme = models.ForeignKey(
        Theme,
        on_delete=models.SET_NULL,
        null=True,
        related_name='user_preferences'
    )
    language = models.CharField(
        max_length=10,
        choices=[
            ('en', _('English')),
            ('ar', _('Arabic')),
            ('fr', _('French')),
            ('es', _('Spanish')),
            ('zh', _('Chinese'))
        ],
        default='en'
    )
    timezone = models.CharField(max_length=50)
    date_format = models.CharField(max_length=50)
    time_format = models.CharField(max_length=50)
    notifications = models.JSONField(
        help_text=_('Notification preferences')
    )
    accessibility = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Accessibility settings')
    )
    dashboard_preferences = models.JSONField(
        help_text=_('Dashboard display preferences')
    )
    
    class Meta:
        verbose_name = _('user preference')
        verbose_name_plural = _('user preferences')
        indexes = [
            models.Index(fields=['user', 'language']),
        ]

    def __str__(self):
        return f"{self.user.email} preferences"

class ChartConfiguration(AbstractBaseModel):
    """
    Model for chart-specific configurations
    """
    widget = models.OneToOneField(
        Widget,
        on_delete=models.CASCADE,
        related_name='chart_config'
    )
    chart_type = models.CharField(
        max_length=50,
        choices=[
            ('LINE', _('Line Chart')),
            ('BAR', _('Bar Chart')),
            ('PIE', _('Pie Chart')),
            ('SCATTER', _('Scatter Plot')),
            ('AREA', _('Area Chart')),
            ('RADAR', _('Radar Chart')),
            ('CUSTOM', _('Custom Chart'))
        ]
    )
    x_axis = models.JSONField(
        help_text=_('X-axis configuration')
    )
    y_axis = models.JSONField(
        help_text=_('Y-axis configuration')
    )
    series = models.JSONField(
        help_text=_('Chart series configuration')
    )
    colors = models.JSONField(
        help_text=_('Chart color scheme')
    )
    legend = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Legend configuration')
    )
    animations = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Animation settings')
    )
    
    class Meta:
        verbose_name = _('chart configuration')
        verbose_name_plural = _('chart configurations')
        indexes = [
            models.Index(fields=['widget', 'chart_type']),
        ]

    def __str__(self):
        return f"{self.widget.name} - {self.chart_type}"

class DashboardSnapshot(AbstractBaseModel):
    """
    Model for storing dashboard snapshots
    """
    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE,
        related_name='snapshots'
    )
    snapshot_id = models.CharField(max_length=100, unique=True)
    timestamp = models.DateTimeField()
    data = models.JSONField(
        help_text=_('Snapshot data')
    )
    filters_applied = models.JSONField(
        null=True,
        blank=True,
        help_text=_('Filters active during snapshot')
    )
    created_by = models.UUIDField()
    reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('dashboard snapshot')
        verbose_name_plural = _('dashboard snapshots')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['dashboard', '-timestamp']),
            models.Index(fields=['snapshot_id']),
        ]

    def __str__(self):
        return f"{self.dashboard.name} - {self.snapshot_id}"

class WidgetAlert(AbstractBaseModel):
    """
    Model for widget-based alerts
    """
    widget = models.ForeignKey(
        Widget,
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    name = models.CharField(max_length=100)
    alert_type = models.CharField(
        max_length=50,
        choices=[
            ('THRESHOLD', _('Threshold Alert')),
            ('TREND', _('Trend Alert')),
            ('ANOMALY', _('Anomaly Alert')),
            ('CUSTOM', _('Custom Alert'))
        ]
    )
    conditions = models.JSONField(
        help_text=_('Alert trigger conditions')
    )
    notification_config = models.JSONField(
        help_text=_('Notification configuration')
    )
    is_active = models.BooleanField(default=True)
    last_triggered = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('widget alert')
        verbose_name_plural = _('widget alerts')
        ordering = ['widget', 'name']
        indexes = [
            models.Index(fields=['widget', 'alert_type']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.widget.name} - {self.name}"
