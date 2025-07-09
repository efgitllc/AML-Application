from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import (
    UAEPassProfile, UAEPassToken, UserSession,
    UserActivity, UserPermission, MFADevice,
    MFAVerification
)
import pyotp
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

class UserModelTests(TestCase):
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'emirates_id': '784-1234-1234567-1',
            'phone_number': '+971501234567'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_create_user(self):
        self.assertEqual(self.user.email, self.user_data['email'])
        self.assertTrue(self.user.check_password(self.user_data['password']))
        self.assertEqual(self.user.emirates_id, self.user_data['emirates_id'])
        self.assertEqual(self.user.phone_number, self.user_data['phone_number'])

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='admin123'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.client = Client()
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'emirates_id': '784-1234-1234567-1',
            'phone_number': '+971501234567'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.login_url = reverse('users_authentication:login')
        self.register_url = reverse('users_authentication:register')
        self.logout_url = reverse('users_authentication:logout')

    def test_user_registration(self):
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'confirm_password': 'newpass123',
            'emirates_id': '784-1234-1234567-2',
            'phone_number': '+971502345678'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=data['email']).exists())

    def test_user_login(self):
        data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('session_id', response.data)

    def test_user_logout(self):
        self.client.login(
            username=self.user_data['email'],
            password=self.user_data['password']
        )
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class MFATests(APITestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.setup_url = reverse('users_authentication:mfa_setup')
        self.verify_url = reverse('users_authentication:mfa_verify')

    def test_mfa_setup_authenticator(self):
        response = self.client.get(f'{self.setup_url}?device_type=AUTHENTICATOR')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('secret', response.data)
        self.assertIn('qr_code', response.data)

    def test_mfa_verify_authenticator(self):
        # Setup MFA device
        secret = pyotp.random_base32()
        device = MFADevice.objects.create(
            user=self.user,
            device_type='AUTHENTICATOR',
            identifier='test-device',
            secret_key=secret
        )

        # Generate valid TOTP code
        totp = pyotp.TOTP(secret)
        code = totp.now()

        response = self.client.post(self.verify_url, {
            'device_id': device.id,
            'code': code
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class UAEPassTests(APITestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            emirates_id='784-1234-1234567-1'
        )
        self.uae_pass_login_url = reverse('users_authentication:uae_pass_login')
        self.uae_pass_callback_url = reverse('users_authentication:uae_pass_callback')

    def test_uae_pass_login_redirect(self):
        response = self.client.get(self.uae_pass_login_url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

    def test_uae_pass_profile_creation(self):
        profile = UAEPassProfile.objects.create(
            user=self.user,
            uae_pass_id='test-id',
            full_name_en='Test User',
            full_name_ar='مستخدم اختبار',
            gender='M',
            nationality='UAE',
            date_of_birth='1990-01-01',
            profile_data={}
        )
        self.assertEqual(profile.user, self.user)
        self.assertEqual(profile.uae_pass_id, 'test-id')

class UserSessionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_session_creation(self):
        session = UserSession.objects.create(
            user=self.user,
            ip_address='127.0.0.1',
            user_agent='test-agent',
            device_info={},
            location_info={}
        )
        self.assertTrue(session.is_active)
        self.assertIsNotNone(session.session_id)

    def test_session_expiry(self):
        session = UserSession.objects.create(
            user=self.user,
            ip_address='127.0.0.1',
            user_agent='test-agent',
            device_info={},
            location_info={}
        )
        session.last_activity = timezone.now() - timedelta(hours=24)
        session.save()
        self.assertTrue(session.is_active)  # Session still active until explicitly ended
