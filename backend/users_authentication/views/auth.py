"""
Authentication Views for Users
"""
import logging
from datetime import timedelta
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from ..serializers import (
    LoginSerializer,
    UserRegistrationSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    UserSerializer
)
from ..models import User

logger = logging.getLogger(__name__)

class LoginView(APIView):
    """
    User login endpoint with support for MFA
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request=request,
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if not user:
            return Response(
                {'error': _('Invalid email or password.')},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        if not user.is_active:
            return Response(
                {'error': _('This account has been deactivated.')},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        # Check if MFA is enabled
        if user.mfa_enabled:
            # Generate temporary token for MFA verification
            verification_token = RefreshToken.for_user(user)
            cache.set(
                f"mfa_verification_{user.id}",
                str(verification_token.access_token),
                timeout=300  # 5 minutes
            )
            
            return Response({
                'requires_mfa': True,
                'user_id': user.id,
                'mfa_methods': [user.mfa_method],
                'verification_token': str(verification_token.access_token)
            }, status=status.HTTP_200_OK)
            
        # Regular login without MFA
        login(request, user)
        
        # Update login tracking
        user.reset_failed_attempts()
        user.last_login_at = timezone.now()
        user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.last_login_device = request.META.get('HTTP_USER_AGENT', '')[:255]
        user.save(update_fields=['failed_login_attempts', 'last_login_at', 'last_login_ip', 'last_login_device'])
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """
    User logout endpoint
    """
    permission_classes = [IsAuthenticated]
    serializer_class = None  # No input data required
    
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except AttributeError:
                    # Fallback if blacklist is not available
                    pass
            
            logout(request)
            return Response(
                {'message': _('Successfully logged out')},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response(
                {'error': _('Logout failed')},
                status=status.HTTP_400_BAD_REQUEST
            )

class RegisterView(APIView):
    """
    User registration endpoint
    """
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class PasswordResetView(APIView):
    """
    Password reset request endpoint
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": _("Password reset email has been sent.")})

class PasswordResetConfirmView(APIView):
    """
    Password reset confirmation endpoint
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": _("Password has been reset successfully.")})