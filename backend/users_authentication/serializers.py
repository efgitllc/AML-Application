from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _
from .models import (
    UAEPassProfile, UAEPassToken, UserSession,
    UserActivity, UserPermission, MFADevice,
    MFAVerification
)

User = get_user_model()

class UAEPassProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UAEPassProfile
        fields = [
            'id', 'uae_pass_id', 'full_name_en', 'full_name_ar',
            'gender', 'nationality', 'date_of_birth', 'profile_data'
        ]
        read_only_fields = ['id', 'uae_pass_id']

class MFADeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MFADevice
        fields = [
            'id', 'device_type', 'identifier', 'is_primary',
            'is_confirmed', 'last_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'secret_key', 'last_used']

class UserSerializer(serializers.ModelSerializer):
    uae_pass_profile = UAEPassProfileSerializer(read_only=True)
    mfa_devices = MFADeviceSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone_number', 'emirates_id',
            'is_verified_uae_pass', 'preferred_language',
            'mfa_enabled', 'mfa_method', 'last_login',
            'last_login_ip', 'last_login_device',
            'uae_pass_profile', 'mfa_devices', 'date_joined',
            'is_active'
        ]
        read_only_fields = [
            'id', 'is_verified_uae_pass', 'last_login',
            'last_login_ip', 'last_login_device', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_emirates_id(self, value):
        if value:
            from core.models import validate_emirates_id
            return validate_emirates_id(value)
        return value

    def validate_phone_number(self, value):
        if value and not value.startswith('+971'):
            raise serializers.ValidationError(
                _('Phone number must be a valid UAE number starting with +971')
            )
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Pass request context properly for axes compatibility
            request = self.context.get('request')
            user = authenticate(request=request, username=email, password=password)
            if not user:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
            if not user.is_active:
                msg = _('User account is disabled.')
                raise serializers.ValidationError(msg, code='authorization')
            if user.is_locked():
                msg = _('Account is locked. Please try again later.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Must include "email" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

class MFAVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    user_id = serializers.UUIDField()
    device_type = serializers.CharField(required=False)

    def validate(self, attrs):
        user_id = attrs.get('user_id')
        code = attrs.get('code')
        device_type = attrs.get('device_type', 'totp')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError(_('Invalid user ID.'))

        if not user.mfa_enabled:
            raise serializers.ValidationError(_('MFA is not enabled for this user.'))

        # Handle backup codes
        if len(code) == 8:  # Backup codes are 8 characters
            if user.verify_backup_code(code):
                attrs['user'] = user
                return attrs
            raise serializers.ValidationError(_('Invalid backup code.'))

        # Handle TOTP
        if device_type == 'totp':
            import pyotp
            totp = pyotp.TOTP(user.mfa_secret)
            if not totp.verify(code):
                raise serializers.ValidationError(_('Invalid TOTP code.'))

        # Handle SMS/Email codes
        # Add implementation for SMS and Email verification here

        attrs['user'] = user
        return attrs

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'password', 'confirm_password',
            'phone_number', 'emirates_id', 'preferred_language'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': _('Passwords do not match.')
            })
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        # Set username to email to avoid unique constraint issues
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(_('No user found with this email address.'))
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': _('Passwords do not match.')
            })
        return data

class MFASetupSerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=['totp', 'sms', 'email'])
    code = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)

    def validate(self, attrs):
        user = self.context['request'].user
        method = attrs.get('method')

        if method == 'totp' and not attrs.get('code'):
            # Generate new TOTP secret if not verifying
            import pyotp
            secret = pyotp.random_base32()
            attrs['secret'] = secret
            attrs['qr_code'] = pyotp.totp.TOTP(secret).provisioning_uri(
                user.email, issuer_name="AML Platform"
            )
        elif method in ['sms', 'email'] and not user.phone_number:
            raise serializers.ValidationError(_('Phone number is required for SMS/Email MFA.'))

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        method = validated_data['method']
        
        if method == 'totp':
            if 'code' in validated_data:
                # Verify TOTP setup
                import pyotp
                totp = pyotp.TOTP(user.mfa_secret)
                if not totp.verify(validated_data['code']):
                    raise serializers.ValidationError(_('Invalid verification code.'))
            else:
                # Initial TOTP setup
                user.mfa_secret = validated_data['secret']
                
        user.mfa_enabled = True
        user.mfa_method = method
        user.save()
        
        if not user.mfa_backup_codes:
            user.generate_mfa_backup_codes()
            
        return user

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = [
            'id', 'session_id', 'ip_address', 'user_agent',
            'device_info', 'location_info', 'is_active',
            'last_activity', 'mfa_verified', 'risk_score',
            'created_at'
        ]
        read_only_fields = fields

class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = [
            'id', 'activity_type', 'ip_address', 'user_agent',
            'endpoint', 'request_method', 'request_body',
            'response_status', 'error_message', 'created_at'
        ]
        read_only_fields = fields

class UserPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPermission
        fields = [
            'id', 'permission_name', 'module_name',
            'can_create', 'can_read', 'can_update',
            'can_delete', 'restrictions', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 