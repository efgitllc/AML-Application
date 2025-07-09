from celery import shared_task
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from .models import (
    Transaction,
    TransactionAlert,
    MonitoringRule,
    WatchlistMatch,
    MonitoringMetrics
)
from screening_watchlist.models import WatchlistEntry
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

@shared_task
def monitor_transaction(transaction_id: str) -> None:
    """
    Monitor a transaction in real-time for suspicious activity
    """
    try:
        with transaction.atomic():
            # Get transaction
            txn = Transaction.objects.select_related(
                'originator',
                'beneficiary'
            ).get(id=transaction_id)

            # Skip if already processed
            if txn.screening_status != 'PENDING':
                return

            # Update status
            txn.screening_status = 'IN_PROGRESS'
            txn.save()

            # Apply monitoring rules
            apply_monitoring_rules.delay(transaction_id)

            # Perform watchlist screening
            screen_against_watchlists.delay(transaction_id)

            # Check transaction patterns
            analyze_transaction_patterns.delay(transaction_id)

    except Transaction.DoesNotExist:
        logger.error(f"Transaction {transaction_id} not found")
    except Exception as e:
        logger.error(f"Transaction monitoring failed: {str(e)}")

@shared_task
def apply_monitoring_rules(transaction_id: str) -> None:
    """
    Apply monitoring rules to transaction
    """
    try:
        with transaction.atomic():
            txn = Transaction.objects.get(id=transaction_id)
            rules = MonitoringRule.objects.filter(
                is_active=True,
                transaction_types__contains=[txn.transaction_type]
            ).order_by('priority')

            for rule in rules:
                # Check cooldown period
                if not _check_rule_cooldown(txn, rule):
                    continue

                # Evaluate rule conditions
                if _evaluate_rule_conditions(txn, rule):
                    # Create alert
                    TransactionAlert.objects.create(
                        transaction=txn,
                        alert_type=rule.rule_type,
                        severity=rule.risk_level,
                        detection_rules={'rule_id': str(rule.id)},
                        alert_details={
                            'rule_name': rule.name,
                            'threshold': rule.thresholds,
                            'conditions': rule.conditions
                        }
                    )

    except Transaction.DoesNotExist:
        logger.error(f"Transaction {transaction_id} not found")
    except Exception as e:
        logger.error(f"Rule application failed: {str(e)}")

@shared_task
def screen_against_watchlists(transaction_id: str) -> None:
    """
    Screen transaction parties against watchlists
    """
    try:
        with transaction.atomic():
            txn = Transaction.objects.select_related(
                'originator',
                'beneficiary'
            ).get(id=transaction_id)

            # Get active watchlist entries
            watchlist_entries = WatchlistEntry.objects.filter(is_active=True)

            # Screen originator
            _screen_party_against_watchlist(txn, txn.originator, watchlist_entries)

            # Screen beneficiary
            if txn.beneficiary:
                _screen_party_against_watchlist(txn, txn.beneficiary, watchlist_entries)

    except Transaction.DoesNotExist:
        logger.error(f"Transaction {transaction_id} not found")
    except Exception as e:
        logger.error(f"Watchlist screening failed: {str(e)}")

@shared_task
def analyze_transaction_patterns(transaction_id: str) -> None:
    """
    Analyze transaction patterns for suspicious behavior
    """
    try:
        with transaction.atomic():
            txn = Transaction.objects.select_related('originator').get(id=transaction_id)

            # Get customer's recent transactions
            lookback_period = timezone.now() - timedelta(days=30)
            recent_transactions = Transaction.objects.filter(
                originator=txn.originator,
                created_at__gte=lookback_period
            ).exclude(id=txn.id)

            # Analyze patterns
            patterns = _analyze_patterns(txn, recent_transactions)

            # Create alerts for suspicious patterns
            for pattern in patterns:
                if pattern['is_suspicious']:
                    TransactionAlert.objects.create(
                        transaction=txn,
                        alert_type='UNUSUAL_PATTERN',
                        severity=pattern['risk_level'],
                        detection_rules={'pattern_type': pattern['type']},
                        alert_details=pattern['details']
                    )

    except Transaction.DoesNotExist:
        logger.error(f"Transaction {transaction_id} not found")
    except Exception as e:
        logger.error(f"Pattern analysis failed: {str(e)}")

def _check_rule_cooldown(txn: Transaction, rule: MonitoringRule) -> bool:
    """Check if rule cooldown period has passed"""
    if not rule.cooldown_period:
        return True

    last_alert = TransactionAlert.objects.filter(
        transaction__originator=txn.originator,
        detection_rules__rule_id=str(rule.id),
        created_at__gte=timezone.now() - rule.cooldown_period
    ).first()

    return not last_alert

def _evaluate_rule_conditions(txn: Transaction, rule: MonitoringRule) -> bool:
    """Evaluate rule conditions against transaction"""
    try:
        conditions = rule.conditions
        thresholds = rule.thresholds

        # Check amount threshold
        if 'amount_threshold' in thresholds:
            if txn.amount > thresholds['amount_threshold']:
                return True

        # Check high-risk countries
        if 'high_risk_countries' in conditions:
            if (txn.originating_country in conditions['high_risk_countries'] or
                txn.destination_country in conditions['high_risk_countries']):
                return True

        # Check transaction frequency
        if 'frequency_threshold' in thresholds:
            recent_count = Transaction.objects.filter(
                originator=txn.originator,
                created_at__gte=timezone.now() - rule.lookback_period
            ).count()
            if recent_count > thresholds['frequency_threshold']:
                return True

        return False
    except Exception as e:
        logger.error(f"Rule evaluation failed: {str(e)}")
        return False

def _screen_party_against_watchlist(
    txn: Transaction,
    party: 'Customer',
    watchlist_entries: 'QuerySet[WatchlistEntry]'
) -> None:
    """Screen a party against watchlist entries"""
    for entry in watchlist_entries:
        # Check primary name
        if party.customer_type == 'INDIVIDUAL':
            party_name = f"{party.first_name} {party.last_name}"
        else:
            party_name = party.company_name

        # Calculate match strength
        match_strength = _calculate_name_match_strength(party_name, entry.name_primary)

        if match_strength > 0.8:  # High confidence match
            WatchlistMatch.objects.create(
                transaction=txn,
                watchlist_type=entry.source.source_type,
                match_status='POTENTIAL',
                match_details={
                    'watchlist_entry_id': str(entry.id),
                    'matched_name': entry.name_primary,
                    'party_name': party_name
                },
                match_strength=match_strength
            )

def _calculate_name_match_strength(name1: str, name2: str) -> float:
    """Calculate string similarity for name matching"""
    # Implement fuzzy string matching
    # This is a placeholder - implement actual name matching logic
    from difflib import SequenceMatcher
    return SequenceMatcher(None, name1.lower(), name2.lower()).ratio()

def _analyze_patterns(
    txn: Transaction,
    recent_transactions: 'QuerySet[Transaction]'
) -> list:
    """Analyze transaction patterns"""
    patterns = []

    # Check for structuring (multiple smaller transactions)
    if _check_structuring_pattern(txn, recent_transactions):
        patterns.append({
            'type': 'STRUCTURING',
            'is_suspicious': True,
            'risk_level': 'HIGH',
            'details': {
                'pattern': 'Multiple smaller transactions',
                'period': '30 days',
                'total_amount': sum(t.amount for t in recent_transactions) + txn.amount
            }
        })

    # Check for rapid movement of funds
    if _check_rapid_movement_pattern(txn, recent_transactions):
        patterns.append({
            'type': 'RAPID_MOVEMENT',
            'is_suspicious': True,
            'risk_level': 'HIGH',
            'details': {
                'pattern': 'Rapid movement of funds',
                'period': '24 hours',
                'transaction_count': recent_transactions.count() + 1
            }
        })

    return patterns

def _check_structuring_pattern(
    txn: Transaction,
    recent_transactions: 'QuerySet[Transaction]'
) -> bool:
    """Check for transaction structuring pattern"""
    threshold = settings.AML_STRUCTURING_THRESHOLD
    if txn.amount < threshold:
        total_amount = sum(t.amount for t in recent_transactions) + txn.amount
        return total_amount > threshold
    return False

def _check_rapid_movement_pattern(
    txn: Transaction,
    recent_transactions: 'QuerySet[Transaction]'
) -> bool:
    """Check for rapid movement of funds pattern"""
    last_24h = timezone.now() - timedelta(hours=24)
    rapid_transactions = recent_transactions.filter(created_at__gte=last_24h)
    return rapid_transactions.count() >= settings.AML_RAPID_MOVEMENT_THRESHOLD 