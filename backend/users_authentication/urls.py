from django.urls import path
from .views import (
    LoginView, LogoutView, RegisterView, PasswordResetView, 
    PasswordResetConfirmView, MFASetupView, MFAVerifyView
)
from .views.uae_pass import UAEPassLoginView, UAEPassCallbackView

app_name = 'users_authentication'

urlpatterns = [
    # Standard Authentication
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    
    # Password Reset
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # MFA
    path('mfa/setup/', MFASetupView.as_view(), name='mfa_setup'),
    path('mfa/verify/', MFAVerifyView.as_view(), name='mfa_verify'),
    
    # UAE Pass Authentication
    path('uae-pass/login/', UAEPassLoginView.as_view(), name='uae_pass_login'),
    path('uae-pass/callback/', UAEPassCallbackView.as_view(), name='uae_pass_callback'),
] 