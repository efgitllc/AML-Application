"""
URL configuration for AML Platform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

api_urlpatterns = [
    # Authentication - now enabled
    path('auth/', include('users_authentication.urls')),
    
    # Core functionality
    path('customers/', include('customer_management.urls')),
    path('transactions/', include('transaction_monitoring.urls')),
    path('documents/', include('document_verification.urls')),
    path('screening/', include('screening_watchlist.urls')),
    path('cases/', include('case_management.urls')),
    path('risk/', include('risk_scoring.urls')),
    path('alerts/', include('alert_notification.urls')),
    
    # Analytics and reporting
    path('reports/', include('reporting_analytics.urls')),
    path('integration/', include('integration_api.urls')),
    path('workflow/', include('workflow_automation.urls')),
    path('data/', include('data_management.urls')),
    path('training/', include('training_simulation.urls')),
    path('dashboard/', include('ui_dashboard.urls')),
]

# Main URL patterns
urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('', RedirectView.as_view(url='/swagger/', permanent=False), name='index'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Additional documentation endpoints
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='api-docs'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    
    # API endpoints
    path('api/', include(api_urlpatterns)),
]

# Serve media and static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Enable debug toolbar in development
    try:
        import debug_toolbar
        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]
    except ImportError:
        pass
