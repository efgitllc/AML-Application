from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    UAEPassProfile, UAEPassToken, UserSession,
    UserActivity, UserPermission, MFADevice,
    MFAVerification
)

User = get_user_model()

# Unregister the default User admin if it exists
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_active', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name')
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )

@admin.register(UAEPassProfile)
class UAEPassProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'uae_pass_id', 'full_name_en', 'nationality')
    search_fields = ('user__email', 'uae_pass_id', 'full_name_en', 'full_name_ar')
    list_filter = ('nationality', 'gender')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UAEPassToken)
class UAEPassTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_active', 'expires_at')
    list_filter = ('is_active',)
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'session_id', 'ip_address', 'is_active', 'last_activity')
    list_filter = ('is_active', 'mfa_verified')
    search_fields = ('user__email', 'ip_address', 'session_id')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'ip_address', 'endpoint', 'response_status', 'created_at')
    list_filter = ('activity_type', 'request_method', 'response_status')
    search_fields = ('user__email', 'ip_address', 'endpoint')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UserPermission)
class UserPermissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'permission_name', 'module_name', 'can_create', 'can_read', 'can_update', 'can_delete')
    list_filter = ('module_name', 'can_create', 'can_read', 'can_update', 'can_delete')
    search_fields = ('user__email', 'permission_name', 'module_name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(MFADevice)
class MFADeviceAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_type', 'identifier', 'is_primary', 'is_confirmed', 'last_used')
    list_filter = ('device_type', 'is_primary', 'is_confirmed')
    search_fields = ('user__email', 'identifier')
    readonly_fields = ('created_at', 'updated_at', 'secret_key')

@admin.register(MFAVerification)
class MFAVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'device', 'verification_type', 'attempts', 'verified_at', 'created_at')
    list_filter = ('verification_type', 'verified_at')
    search_fields = ('user__email', 'device__identifier')
    readonly_fields = ('created_at', 'updated_at', 'code_generated')
