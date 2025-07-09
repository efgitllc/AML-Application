"""
UAE PASS Authentication Views
"""
import logging
import secrets
from datetime import datetime, timedelta
from urllib.parse import urlencode

import pytz
import requests
from django.conf import settings
from django.contrib.auth import login
from django.core.cache import cache
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from rest_framework import status, serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils import validate_emirates_id
from django.contrib.auth import get_user_model
from ..models import UAEPassProfile, UAEPassToken

User = get_user_model()

logger = logging.getLogger(__name__)

class UAEPassAuthSerializer(serializers.Serializer):
    """Serializer for UAE Pass authentication response"""
    auth_url = serializers.URLField(help_text="UAE Pass authorization URL")

class UAEPassLoginView(APIView):
    """
    Initiates UAE PASS OAuth2 login flow
    """
    permission_classes = []
    serializer_class = UAEPassAuthSerializer
    
    def get(self, request):
        try:
            # Generate state parameter for CSRF protection
            state = secrets.token_urlsafe(32)
            
            # Store state in cache with timeout
            cache.set(
                f"{settings.UAE_PASS_AUTH['STATE_KEY_PREFIX']}{state}",
                True,
                timeout=int(settings.UAE_PASS_CONFIG['STATE_TIMEOUT'].total_seconds())
            )
            
            # Build authorization URL
            params = {
                'client_id': settings.UAE_PASS_CONFIG['CLIENT_ID'],
                'response_type': settings.UAE_PASS_CONFIG['RESPONSE_TYPE'],
                'scope': settings.UAE_PASS_CONFIG['SCOPE'],
                'state': state,
                'redirect_uri': settings.UAE_PASS_CONFIG['REDIRECT_URI'],
                'acr_values': settings.UAE_PASS_CONFIG['ACR_VALUES'],
            }
            
            auth_url = f"{settings.UAE_PASS_CONFIG['AUTHORIZATION_ENDPOINT']}?{urlencode(params)}"
            
            return Response({'auth_url': auth_url}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"UAE PASS login initiation failed: {str(e)}")
            return Response(
                {'error': _('Failed to initiate UAE PASS login')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UAEPassCallbackView(APIView):
    """
    Handles UAE PASS OAuth2 callback and user creation/login
    """
    permission_classes = []
    serializer_class = None  # This is a callback endpoint, no input serializer needed
    
    def get(self, request):
        try:
            # Get authorization code and state from query params
            code = request.GET.get('code')
            state = request.GET.get('state')
            
            if not code or not state:
                raise AuthenticationFailed(_('Invalid callback parameters'))
            
            # Verify state parameter
            state_key = f"{settings.UAE_PASS_AUTH['STATE_KEY_PREFIX']}{state}"
            if not cache.get(state_key):
                raise AuthenticationFailed(_('Invalid or expired state parameter'))
            
            # Delete used state
            cache.delete(state_key)
            
            # Exchange code for access token
            token_response = self._get_access_token(code)
            
            # Get user info using access token
            user_info = self._get_user_info(token_response['access_token'])
            
            # Validate Emirates ID
            emirates_id = user_info.get('idn')
            if not emirates_id or not validate_emirates_id(emirates_id):
                raise AuthenticationFailed(_('Invalid Emirates ID from UAE PASS'))
            
            # Get or create user
            user = self._get_or_create_user(user_info, token_response)
            
            # Login user
            login(request, user)
            
            # Set session expiry based on token expiry
            request.session.set_expiry(settings.UAE_PASS_AUTH['TOKEN_EXPIRY'].total_seconds())
            
            # Redirect to frontend
            frontend_url = settings.FRONTEND_URL + '/login/success/'
            return HttpResponseRedirect(frontend_url)
            
        except AuthenticationFailed as e:
            logger.warning(f"UAE PASS authentication failed: {str(e)}")
            return HttpResponseRedirect(settings.FRONTEND_URL + f'/login/error/?error={str(e)}')
            
        except Exception as e:
            logger.error(f"UAE PASS callback processing failed: {str(e)}")
            return HttpResponseRedirect(settings.FRONTEND_URL + '/login/error/?error=server_error')
    
    def _get_access_token(self, code):
        """
        Exchange authorization code for access token
        """
        try:
            response = requests.post(
                settings.UAE_PASS_CONFIG['TOKEN_ENDPOINT'],
                data={
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': settings.UAE_PASS_CONFIG['REDIRECT_URI'],
                    'client_id': settings.UAE_PASS_CONFIG['CLIENT_ID'],
                    'client_secret': settings.UAE_PASS_CONFIG['CLIENT_SECRET'],
                },
                headers={'Accept': 'application/json'},
                timeout=10
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"UAE PASS token exchange failed: {str(e)}")
            raise AuthenticationFailed(_('Failed to exchange authorization code'))
    
    def _get_user_info(self, access_token):
        """
        Get user info from UAE PASS using access token
        """
        try:
            response = requests.get(
                settings.UAE_PASS_CONFIG['USERINFO_ENDPOINT'],
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Accept': 'application/json'
                },
                timeout=10
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"UAE PASS user info fetch failed: {str(e)}")
            raise AuthenticationFailed(_('Failed to fetch user information'))
    
    def _get_or_create_user(self, user_info, token_response):
        """
        Get existing user or create new user from UAE PASS info
        """
        emirates_id = user_info['idn']
        email = user_info.get('email', '')
        
        try:
            # Try to get existing user
            user = User.objects.get(emirates_id=emirates_id)
            
            # Update user information
            user.email = email
            user.first_name = user_info.get('firstnameEN', '')
            user.last_name = user_info.get('lastnameEN', '')
            user.is_verified_uae_pass = True
            user.save()
            
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create_user(
                emirates_id=emirates_id,
                email=email,
                first_name=user_info.get('firstnameEN', ''),
                last_name=user_info.get('lastnameEN', ''),
                is_verified_uae_pass=True,
                is_active=True
            )
        
        # Update UAE PASS profile
        UAEPassProfile.objects.update_or_create(
            user=user,
            defaults={
                'uae_pass_id': user_info['sub'],
                'full_name_en': f"{user_info.get('firstnameEN', '')} {user_info.get('lastnameEN', '')}",
                'full_name_ar': f"{user_info.get('firstnameAR', '')} {user_info.get('lastnameAR', '')}",
                'gender': user_info.get('gender', ''),
                'nationality': user_info.get('nationality', ''),
                'date_of_birth': datetime.strptime(user_info.get('dob', ''), '%Y-%m-%d').date(),
                'profile_data': user_info
            }
        )
        
        # Update UAE PASS token
        expires_in = token_response.get('expires_in', 3600)
        UAEPassToken.objects.update_or_create(
            user=user,
            defaults={
                'access_token': token_response['access_token'],
                'refresh_token': token_response.get('refresh_token', ''),
                'token_type': token_response.get('token_type', 'Bearer'),
                'expires_at': datetime.now(pytz.UTC) + timedelta(seconds=expires_in),
                'scope': token_response.get('scope', ''),
                'is_active': True
            }
        )
        
        return user 