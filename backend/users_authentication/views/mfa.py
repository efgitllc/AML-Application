from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import pyotp
import qrcode
import io
import base64
from ..models import MFADevice, MFAVerification, UserActivity
from ..serializers import MFADeviceSerializer, MFAVerifySerializer, MFASetupSerializer

class MFASetupView(APIView):
    """
    Setup MFA for authenticated user
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MFASetupSerializer
    
    def post(self, request):
        serializer = MFASetupSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            method = serializer.validated_data['method']
            
            if method == 'totp':
                # Generate TOTP secret
                secret = serializer.validated_data.get('secret')
                if not secret:
                    secret = pyotp.random_base32()
                
                # Generate QR code
                totp = pyotp.TOTP(secret)
                provisioning_uri = totp.provisioning_uri(
                    user.email,
                    issuer_name="AML Platform"
                )
                
                qr = qrcode.QRCode(version=1, box_size=10, border=5)
                qr.add_data(provisioning_uri)
                qr.make(fit=True)
                
                img = qr.make_image(fill_color="black", back_color="white")
                buffer = io.BytesIO()
                img.save(buffer, format='PNG')
                img_str = base64.b64encode(buffer.getvalue()).decode()
                
                # If code provided, verify and enable MFA
                if 'code' in serializer.validated_data:
                    code = serializer.validated_data['code']
                    if totp.verify(code):
                        user.mfa_enabled = True
                        user.mfa_method = 'TOTP'
                        user.mfa_secret = secret
                        user.save()
                        
                        # Create MFA device record
                        MFADevice.objects.create(
                            user=user,
                            device_type='AUTHENTICATOR',
                            identifier=user.email,
                            secret_key=secret,
                            is_primary=True,
                            is_confirmed=True
                        )
                        
                        return Response({
                            'success': True,
                            'message': _('MFA enabled successfully'),
                            'backup_codes': user.generate_mfa_backup_codes()
                        })
                    else:
                        return Response({
                            'error': _('Invalid verification code')
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({
                    'secret': secret,
                    'qr_code': f"data:image/png;base64,{img_str}",
                    'manual_entry_key': secret
                })
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MFAVerifyView(APIView):
    """
    Verify MFA code for user
    """
    permission_classes = []  # Allow unauthenticated for login flow
    serializer_class = MFAVerifySerializer
    
    def post(self, request):
        serializer = MFAVerifySerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens after successful MFA
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            # Log successful MFA verification
            UserActivity.objects.create(
                user=user,
                activity_type='MFA_VERIFIED',
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                request_method=request.method,
                response_status=200
            )
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'role': user.role
                }
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 