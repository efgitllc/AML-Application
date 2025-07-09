"""
Core utility functions used across the AML platform
"""
import re
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, date
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_emirates_id(value: str) -> None:
    """
    Validates UAE Emirates ID format
    Format: XXX-XXXX-XXXXXXX-X
    """
    pattern = r'^\d{3}-\d{4}-\d{7}-\d{1}$'
    if not re.match(pattern, value):
        raise ValidationError(_('Invalid Emirates ID format. Use XXX-XXXX-XXXXXXX-X format.'))

def validate_trade_license(value: str) -> None:
    """
    Validates UAE Trade License number format
    """
    pattern = r'^[A-Z0-9]{5,20}$'
    if not re.match(pattern, value):
        raise ValidationError(_('Invalid Trade License format.'))

def calculate_risk_score(factors: Dict[str, float]) -> int:
    """
    Calculates risk score based on provided risk factors
    
    Args:
        factors: Dictionary of risk factors and their weights
        
    Returns:
        Integer risk score between 0 and 100
    """
    total_score = 0
    total_weight = 0
    
    for factor, weight in factors.items():
        if not isinstance(weight, (int, float)):
            continue
        total_score += weight
        total_weight += 1
    
    if total_weight == 0:
        return 0
        
    normalized_score = (total_score / total_weight) * 100
    return min(max(int(normalized_score), 0), 100)

def get_date_range(range_type: str) -> tuple[datetime, datetime]:
    """
    Gets date range based on type
    
    Args:
        range_type: One of 'today', 'week', 'month', 'quarter', 'year'
        
    Returns:
        Tuple of start_date, end_date
    """
    today = timezone.now()
    
    if range_type == 'today':
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif range_type == 'week':
        start_date = today - timezone.timedelta(days=today.weekday())
        end_date = start_date + timezone.timedelta(days=6)
    elif range_type == 'month':
        start_date = today.replace(day=1)
        if today.month == 12:
            end_date = today.replace(year=today.year + 1, month=1, day=1) - timezone.timedelta(days=1)
        else:
            end_date = today.replace(month=today.month + 1, day=1) - timezone.timedelta(days=1)
    elif range_type == 'quarter':
        quarter = (today.month - 1) // 3
        start_date = today.replace(month=quarter * 3 + 1, day=1)
        if quarter == 3:
            end_date = today.replace(year=today.year + 1, month=1, day=1) - timezone.timedelta(days=1)
        else:
            end_date = today.replace(month=(quarter + 1) * 3 + 1, day=1) - timezone.timedelta(days=1)
    elif range_type == 'year':
        start_date = today.replace(month=1, day=1)
        end_date = today.replace(month=12, day=31)
    else:
        raise ValueError(f"Invalid range_type: {range_type}")
    
    return start_date, end_date

def format_currency(amount: float, currency: str = 'AED') -> str:
    """
    Formats currency amount with proper separators
    
    Args:
        amount: The amount to format
        currency: Currency code (default: AED)
        
    Returns:
        Formatted currency string
    """
    return f"{currency} {amount:,.2f}"

def mask_sensitive_data(data: str, mask_char: str = '*') -> str:
    """
    Masks sensitive data for display/logging
    
    Args:
        data: String to mask
        mask_char: Character to use for masking
        
    Returns:
        Masked string
    """
    if not data:
        return data
        
    if len(data) <= 4:
        return mask_char * len(data)
        
    return f"{data[:2]}{mask_char * (len(data)-4)}{data[-2:]}"

def parse_date(date_str: str) -> Optional[date]:
    """
    Safely parses date string in multiple formats
    
    Args:
        date_str: Date string to parse
        
    Returns:
        Parsed date or None if invalid
    """
    formats = [
        '%Y-%m-%d',
        '%d/%m/%Y',
        '%d-%m-%Y',
        '%Y/%m/%d',
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    
    return None

def clean_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Removes None values and empty strings from dictionary
    
    Args:
        data: Dictionary to clean
        
    Returns:
        Cleaned dictionary
    """
    return {k: v for k, v in data.items() if v is not None and v != ''} 