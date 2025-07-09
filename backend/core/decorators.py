"""
Core decorators used across the AML platform
"""
import time
import logging
from functools import wraps
from typing import Any, Callable
from django.core.cache import cache
from django.db import transaction
from django.http import HttpRequest, HttpResponse
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)

def audit_log(action: str) -> Callable:
    """
    Decorator to log actions to audit trail
    
    Args:
        action: The action being performed
        
    Usage:
        @audit_log('create_customer')
        def create_customer(request, ...):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any) -> Any:
            from audit_logging.models import AuditLog
            
            start_time = time.time()
            result = None
            error = None
            
            try:
                result = func(request, *args, **kwargs)
                return result
            except Exception as e:
                error = str(e)
                raise
            finally:
                # Create audit log
                AuditLog.objects.create(
                    action=action,
                    user=request.user if request.user.is_authenticated else None,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    request_data={
                        'method': request.method,
                        'path': request.path,
                        'query': request.GET.dict(),
                        'body': request.POST.dict(),
                    },
                    response_data=result.data if hasattr(result, 'data') else None,
                    status='FAILURE' if error else 'SUCCESS',
                    error_message=error,
                    execution_time=time.time() - start_time
                )
        return wrapper
    return decorator

def rate_limit(key: str, limit: int, period: int) -> Callable:
    """
    Decorator to implement rate limiting
    
    Args:
        key: Cache key prefix
        limit: Number of allowed requests
        period: Time period in seconds
        
    Usage:
        @rate_limit('search_api', 100, 3600)  # 100 requests per hour
        def search_view(request, ...):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any) -> Any:
            from django.core.exceptions import PermissionDenied
            
            # Generate cache key
            cache_key = f"ratelimit:{key}:{request.user.id if request.user.is_authenticated else request.META['REMOTE_ADDR']}"
            
            # Get current count
            count = cache.get(cache_key, 0)
            
            if count >= limit:
                raise PermissionDenied(_('Rate limit exceeded'))
            
            # Increment count
            cache.set(cache_key, count + 1, period)
            
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

def atomic_transaction() -> Callable:
    """
    Decorator to ensure atomic database transactions
    
    Usage:
        @atomic_transaction()
        def transfer_funds(from_account, to_account, amount):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            with transaction.atomic():
                return func(*args, **kwargs)
        return wrapper
    return decorator

def cache_response(timeout: int = 300) -> Callable:
    """
    Decorator to cache view responses
    
    Args:
        timeout: Cache timeout in seconds
        
    Usage:
        @cache_response(timeout=3600)  # Cache for 1 hour
        def expensive_view(request, ...):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any) -> Any:
            # Generate cache key
            cache_key = f"view_cache:{request.path}:{request.user.id if request.user.is_authenticated else 'anonymous'}"
            
            # Try to get from cache
            response = cache.get(cache_key)
            if response is not None:
                return response
            
            # Generate response
            response = func(request, *args, **kwargs)
            
            # Cache response
            cache.set(cache_key, response, timeout)
            
            return response
        return wrapper
    return decorator

def require_permission(*permissions: str) -> Callable:
    """
    Decorator to check for required permissions
    
    Args:
        permissions: Required permission strings
        
    Usage:
        @require_permission('can_approve_transactions', 'can_view_reports')
        def approve_transaction(request, ...):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any) -> Any:
            from django.core.exceptions import PermissionDenied
            
            if not request.user.is_authenticated:
                raise PermissionDenied(_('Authentication required'))
                
            if not request.user.has_perms(permissions):
                raise PermissionDenied(_('Insufficient permissions'))
                
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

def log_execution_time(logger_name: str = __name__) -> Callable:
    """
    Decorator to log function execution time
    
    Args:
        logger_name: Name of the logger to use
        
    Usage:
        @log_execution_time('my_app.views')
        def slow_operation():
            ...
    """
    logger = logging.getLogger(logger_name)
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time.time()
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            logger.info(
                'Function %s executed in %.2f seconds',
                func.__name__,
                execution_time
            )
            
            return result
        return wrapper
    return decorator 