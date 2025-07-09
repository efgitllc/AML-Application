"""
Core constants used across the AML platform
"""
from django.utils.translation import gettext_lazy as _
from django.db import models

class CustomerType(models.TextChoices):
    """Customer type choices"""
    INDIVIDUAL = 'INDIVIDUAL', _('Individual')
    CORPORATE = 'CORPORATE', _('Corporate')
    SOLE_PROPRIETOR = 'SOLE_PROPRIETOR', _('Sole Proprietor')
    PARTNERSHIP = 'PARTNERSHIP', _('Partnership')
    LLC = 'LLC', _('Limited Liability Company')
    TRUST = 'TRUST', _('Trust')
    GOVERNMENT = 'GOVERNMENT', _('Government Entity')
    NGO = 'NGO', _('Non-Governmental Organization')

class DocumentType(models.TextChoices):
    """Document type choices"""
    EMIRATES_ID = 'EMIRATES_ID', _('Emirates ID')
    PASSPORT = 'PASSPORT', _('Passport')
    VISA = 'VISA', _('Visa')
    TRADE_LICENSE = 'TRADE_LICENSE', _('Trade License')
    COMPANY_REG = 'COMPANY_REG', _('Company Registration')
    POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY', _('Power of Attorney')
    BANK_STATEMENT = 'BANK_STATEMENT', _('Bank Statement')
    UTILITY_BILL = 'UTILITY_BILL', _('Utility Bill')
    OTHER = 'OTHER', _('Other Document')

class TransactionType(models.TextChoices):
    """Transaction type choices"""
    CASH_DEPOSIT = 'CASH_DEPOSIT', _('Cash Deposit')
    CASH_WITHDRAWAL = 'CASH_WITHDRAWAL', _('Cash Withdrawal')
    WIRE_TRANSFER = 'WIRE_TRANSFER', _('Wire Transfer')
    INTERNAL_TRANSFER = 'INTERNAL_TRANSFER', _('Internal Transfer')
    CHEQUE_DEPOSIT = 'CHEQUE_DEPOSIT', _('Cheque Deposit')
    CARD_PAYMENT = 'CARD_PAYMENT', _('Card Payment')
    LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT', _('Loan Disbursement')
    LOAN_REPAYMENT = 'LOAN_REPAYMENT', _('Loan Repayment')
    FX_EXCHANGE = 'FX_EXCHANGE', _('Foreign Exchange')
    OTHER = 'OTHER', _('Other Transaction')

class RiskLevel(models.TextChoices):
    """Risk level choices"""
    LOW = 'LOW', _('Low Risk')
    MEDIUM = 'MEDIUM', _('Medium Risk')
    HIGH = 'HIGH', _('High Risk')
    CRITICAL = 'CRITICAL', _('Critical Risk')

class CaseType(models.TextChoices):
    """Case type choices"""
    KYC = 'KYC', _('KYC Review')
    TRANSACTION = 'TRANSACTION', _('Transaction Review')
    SAR = 'SAR', _('Suspicious Activity')
    INVESTIGATION = 'INVESTIGATION', _('Investigation')
    AUDIT = 'AUDIT', _('Audit Review')
    REMEDIATION = 'REMEDIATION', _('Remediation')
    OTHER = 'OTHER', _('Other Case')

class CaseStatus(models.TextChoices):
    """Case status choices"""
    OPEN = 'OPEN', _('Open')
    IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
    PENDING_REVIEW = 'PENDING_REVIEW', _('Pending Review')
    ESCALATED = 'ESCALATED', _('Escalated')
    ON_HOLD = 'ON_HOLD', _('On Hold')
    CLOSED = 'CLOSED', _('Closed')
    REJECTED = 'REJECTED', _('Rejected')

class AlertType(models.TextChoices):
    """Alert type choices"""
    TRANSACTION = 'TRANSACTION', _('Transaction Alert')
    BEHAVIOR = 'BEHAVIOR', _('Behavioral Alert')
    KYC = 'KYC', _('KYC Alert')
    WATCHLIST = 'WATCHLIST', _('Watchlist Match')
    REGULATORY = 'REGULATORY', _('Regulatory Alert')
    SYSTEM = 'SYSTEM', _('System Alert')
    SUSPICIOUS_TRANSACTION = 'SUSPICIOUS_TRANSACTION', _('Suspicious Transaction')
    HIGH_RISK_CUSTOMER = 'HIGH_RISK_CUSTOMER', _('High Risk Customer')
    SANCTIONS_MATCH = 'SANCTIONS_MATCH', _('Sanctions Match')
    PEP_MATCH = 'PEP_MATCH', _('PEP Match')
    DOCUMENT_EXPIRY = 'DOCUMENT_EXPIRY', _('Document Expiry')
    FAILED_VERIFICATION = 'FAILED_VERIFICATION', _('Failed Verification')
    OTHER = 'OTHER', _('Other Alert')

class AlertStatus(models.TextChoices):
    """Alert status choices"""
    NEW = 'NEW', _('New')
    ASSIGNED = 'ASSIGNED', _('Assigned')
    IN_REVIEW = 'IN_REVIEW', _('In Review')
    IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
    ESCALATED = 'ESCALATED', _('Escalated')
    RESOLVED = 'RESOLVED', _('Resolved')
    CLOSED = 'CLOSED', _('Closed')
    FALSE_POSITIVE = 'FALSE_POSITIVE', _('False Positive')

class CountryRisk(models.TextChoices):
    """Country risk levels"""
    VERY_LOW = 'VERY_LOW', _('Very Low Risk')
    LOW = 'LOW', _('Low Risk')
    MEDIUM = 'MEDIUM', _('Medium Risk')
    HIGH = 'HIGH', _('High Risk')
    VERY_HIGH = 'VERY_HIGH', _('Very High Risk')
    SANCTIONED = 'SANCTIONED', _('Sanctioned Country')

# Common regular expressions
PATTERNS = {
    'EMIRATES_ID': r'^\d{3}-\d{4}-\d{7}-\d{1}$',
    'EMAIL': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    'PHONE': r'^\+?971[0-9]{9}$',  # UAE phone format
    'TRADE_LICENSE': r'^[A-Z0-9]{5,20}$',
}

# Common file extensions
ALLOWED_DOCUMENT_EXTENSIONS = {
    'pdf', 'jpg', 'jpeg', 'png', 'tiff',
    'doc', 'docx', 'xls', 'xlsx', 'csv'
}

# Maximum file sizes (in bytes)
MAX_FILE_SIZES = {
    'DOCUMENT': 10 * 1024 * 1024,  # 10MB
    'PHOTO': 5 * 1024 * 1024,      # 5MB
    'ATTACHMENT': 20 * 1024 * 1024, # 20MB
}

# Currency codes
SUPPORTED_CURRENCIES = [
    ('AED', _('UAE Dirham')),
    ('USD', _('US Dollar')),
    ('EUR', _('Euro')),
    ('GBP', _('British Pound')),
    ('SAR', _('Saudi Riyal')),
]

# Time zones
UAE_TIMEZONE = 'Asia/Dubai'

# API rate limits
API_RATE_LIMITS = {
    'DEFAULT': '100/hour',
    'AUTH': '5/minute',
    'SEARCH': '60/minute',
}

# Cache timeouts (in seconds)
CACHE_TIMEOUTS = {
    'DEFAULT': 300,        # 5 minutes
    'USER': 1800,         # 30 minutes
    'STATIC': 86400,      # 24 hours
    'WATCHLIST': 3600,    # 1 hour
}

# Pagination defaults
PAGINATION = {
    'DEFAULT_PAGE_SIZE': 20,
    'MAX_PAGE_SIZE': 100,
}

# Date formats
DATE_FORMATS = {
    'DEFAULT': '%Y-%m-%d',
    'DISPLAY': '%d/%m/%Y',
    'ISO': '%Y-%m-%dT%H:%M:%SZ',
}

class UserRole(models.TextChoices):
    ADMIN = 'admin', _('Admin')
    COMPLIANCE_OFFICER = 'compliance_officer', _('Compliance Officer')
    CUSTOMER_SERVICE = 'customer_service', _('Customer Service')
    RISK_ANALYST = 'risk_analyst', _('Risk Analyst')
    AUDITOR = 'auditor', _('Auditor')

class MFAMethod(models.TextChoices):
    NONE = 'none', _('None')
    TOTP = 'totp', _('Time-based OTP')
    SMS = 'sms', _('SMS')
    EMAIL = 'email', _('Email')
    BACKUP_CODES = 'backup_codes', _('Backup Codes')

class DocumentStatus(models.TextChoices):
    PENDING = 'pending', _('Pending')
    APPROVED = 'approved', _('Approved')
    REJECTED = 'rejected', _('Rejected')
    EXPIRED = 'expired', _('Expired')

class VerificationType(models.TextChoices):
    IDENTITY = 'identity', _('Identity Verification')
    ADDRESS = 'address', _('Address Verification')
    BUSINESS = 'business', _('Business Verification')
    DOCUMENT = 'document', _('Document Verification') 