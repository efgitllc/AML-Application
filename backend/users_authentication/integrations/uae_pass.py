from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import requests
import jwt
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class UAEPassClient:
    """
    UAE PASS integration client for digital identity verification
    """
    def __init__(self):
        self.client_id = settings.UAE_PASS_CLIENT_ID
        self.client_secret = settings.UAE_PASS_CLIENT_SECRET
        self.base_url = settings.UAE_PASS_BASE_URL
        self.redirect_uri = settings.UAE_PASS_REDIRECT_URI
        self.scope = settings.UAE_PASS_SCOPE

    def generate_auth_url(self):
        """Generate UAE PASS authentication URL"""
        params = {
            'client_id': self.client_id,
            'response_type': 'code',
            'scope': self.scope,
            'redirect_uri': self.redirect_uri,
            'state': self._generate_state_token(),
            'ui_locales': 'en'
        }
        return f"{self.base_url}/authorize", params

    def exchange_code_for_token(self, auth_code):
        """Exchange authorization code for access token"""
        try:
            response = requests.post(
                f"{self.base_url}/token",
                data={
                    'grant_type': 'authorization_code',
                    'code': auth_code,
                    'redirect_uri': self.redirect_uri,
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"UAE PASS token exchange failed: {str(e)}")
            raise ValidationError(_("Failed to authenticate with UAE PASS"))

    def get_user_info(self, access_token):
        """Fetch user information from UAE PASS"""
        try:
            response = requests.get(
                f"{self.base_url}/userinfo",
                headers={'Authorization': f'Bearer {access_token}'}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"UAE PASS user info fetch failed: {str(e)}")
            raise ValidationError(_("Failed to fetch user information from UAE PASS"))

    def verify_emirates_id(self, emirates_id, access_token):
        """Verify Emirates ID through UAE PASS"""
        try:
            response = requests.post(
                f"{self.base_url}/verify/emirates-id",
                headers={'Authorization': f'Bearer {access_token}'},
                json={'emirates_id': emirates_id}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Emirates ID verification failed: {str(e)}")
            raise ValidationError(_("Failed to verify Emirates ID"))

    def refresh_access_token(self, refresh_token):
        """Refresh UAE PASS access token"""
        try:
            response = requests.post(
                f"{self.base_url}/token",
                data={
                    'grant_type': 'refresh_token',
                    'refresh_token': refresh_token,
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"UAE PASS token refresh failed: {str(e)}")
            raise ValidationError(_("Failed to refresh UAE PASS token"))

    def _generate_state_token(self):
        """Generate state token for CSRF protection"""
        return jwt.encode(
            {
                'exp': datetime.utcnow() + timedelta(minutes=10),
                'iat': datetime.utcnow(),
                'sub': 'uae_pass_state'
            },
            settings.SECRET_KEY,
            algorithm='HS256'
        )

    def verify_state_token(self, state):
        """Verify state token from callback"""
        try:
            jwt.decode(state, settings.SECRET_KEY, algorithms=['HS256'])
            return True
        except jwt.InvalidTokenError:
            return False 