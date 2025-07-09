"""
Core validators used across the AML platform
"""
import re
from typing import Any, Dict, List, Optional, Union
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .constants import PATTERNS, ALLOWED_DOCUMENT_EXTENSIONS, MAX_FILE_SIZES

def validate_emirates_id(value: str) -> None:
    """
    Validates UAE Emirates ID format
    Format: XXX-XXXX-XXXXXXX-X
    """
    if not re.match(PATTERNS['EMIRATES_ID'], value):
        raise ValidationError(_('Invalid Emirates ID format. Use XXX-XXXX-XXXXXXX-X format.'))

def validate_uae_phone(value: str) -> None:
    """
    Validates UAE phone number format
    Format: +971XXXXXXXXX
    """
    if not re.match(PATTERNS['PHONE'], value):
        raise ValidationError(_('Invalid UAE phone number format.'))

def validate_trade_license(value: str) -> None:
    """
    Validates UAE Trade License number format
    """
    if not re.match(PATTERNS['TRADE_LICENSE'], value):
        raise ValidationError(_('Invalid Trade License format.'))

def validate_file_extension(value: Any) -> None:
    """
    Validates file extension against allowed extensions
    """
    ext = value.name.split('.')[-1].lower()
    if ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise ValidationError(
            _('Unsupported file extension. Allowed extensions: %(extensions)s'),
            params={'extensions': ', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}
        )

def validate_file_size(value: Union[int, Any], file_type: str = 'DOCUMENT') -> None:
    """
    Validates file size against maximum allowed size.
    Handles both file objects (with size attribute) and direct integer values.
    
    Args:
        value: Either a file object with size attribute or an integer representing size in bytes
        file_type: Type of file to validate against (uses corresponding max size from MAX_FILE_SIZES)
    """
    # Get the size in bytes
    size_in_bytes = value.size if hasattr(value, 'size') else value
    
    # Get max allowed size
    max_size = MAX_FILE_SIZES.get(file_type, MAX_FILE_SIZES['DOCUMENT'])
    
    if size_in_bytes > max_size:
        max_mb = max_size / (1024 * 1024)
        raise ValidationError(
            _('File too large. Maximum size allowed is %(max_mb)s MB'),
            params={'max_mb': max_mb}
        )

def validate_percentage(value: float) -> None:
    """
    Validates that a value is a valid percentage (0-100)
    """
    if not 0 <= value <= 100:
        raise ValidationError(_('Value must be between 0 and 100'))

def validate_positive(value: float) -> None:
    """
    Validates that a value is positive
    """
    if value < 0:
        raise ValidationError(_('Value must be positive'))

def validate_future_date(value: Any) -> None:
    """
    Validates that a date is in the future
    """
    from django.utils import timezone
    if value <= timezone.now().date():
        raise ValidationError(_('Date must be in the future'))

def validate_past_date(value: Any) -> None:
    """
    Validates that a date is in the past
    """
    from django.utils import timezone
    if value >= timezone.now().date():
        raise ValidationError(_('Date must be in the past'))

def validate_json_structure(value: Dict[str, Any], required_fields: List[str]) -> None:
    """
    Validates JSON structure has required fields
    """
    missing_fields = [field for field in required_fields if field not in value]
    if missing_fields:
        raise ValidationError(
            _('Missing required fields: %(fields)s'),
            params={'fields': ', '.join(missing_fields)}
        )

def validate_iban(value: str) -> None:
    """
    Validates IBAN format
    """
    # Remove spaces and convert to uppercase
    iban = value.replace(' ', '').upper()
    
    # Basic format check
    if not re.match(r'^[A-Z]{2}\d{2}[A-Z0-9]{4,}$', iban):
        raise ValidationError(_('Invalid IBAN format'))
    
    # Move first 4 characters to end and convert letters to numbers
    iban = iban[4:] + iban[:4]
    iban_numeric = ''
    for char in iban:
        if char.isalpha():
            iban_numeric += str(ord(char) - 55)
        else:
            iban_numeric += char
    
    # Check if it's divisible by 97
    if int(iban_numeric) % 97 != 1:
        raise ValidationError(_('Invalid IBAN checksum'))

def validate_currency_code(value: str) -> None:
    """
    Validates currency code format
    """
    if not re.match(r'^[A-Z]{3}$', value):
        raise ValidationError(_('Invalid currency code format. Must be 3 uppercase letters.'))

def validate_ip_address(value: str) -> None:
    """
    Validates IP address format
    """
    # IPv4
    ipv4_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    # IPv6
    ipv6_pattern = r'^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$'
    
    if not (re.match(ipv4_pattern, value) or re.match(ipv6_pattern, value)):
        raise ValidationError(_('Invalid IP address format'))
        
    # For IPv4, validate each octet
    if re.match(ipv4_pattern, value):
        octets = value.split('.')
        if any(not (0 <= int(octet) <= 255) for octet in octets):
            raise ValidationError(_('Invalid IPv4 address. Octets must be between 0 and 255')) 