from typing import List, Dict, Any
from django.db.models import Q
from django.utils import timezone
from ..models import Customer
from core.utils import calculate_string_similarity
import logging

logger = logging.getLogger(__name__)

class DuplicateDetectionService:
    """Service for detecting potential duplicate customers"""

    def __init__(self):
        self.similarity_threshold = 0.85  # Configurable threshold

    def find_potential_duplicates(self, customer: Customer) -> List[Dict[str, Any]]:
        """
        Find potential duplicate customers based on various criteria
        """
        try:
            potential_duplicates = []

            # Check exact matches
            exact_matches = self._find_exact_matches(customer)
            potential_duplicates.extend(self._format_matches(exact_matches, 'EXACT'))

            # Check similar names
            name_matches = self._find_similar_names(customer)
            potential_duplicates.extend(self._format_matches(name_matches, 'NAME'))

            # Check similar identifications
            id_matches = self._find_similar_identifications(customer)
            potential_duplicates.extend(self._format_matches(id_matches, 'IDENTIFICATION'))

            # Check contact info matches
            contact_matches = self._find_contact_matches(customer)
            potential_duplicates.extend(self._format_matches(contact_matches, 'CONTACT'))

            return potential_duplicates

        except Exception as e:
            logger.error(f"Error in duplicate detection: {str(e)}")
            return []

    def _find_exact_matches(self, customer: Customer) -> List[Customer]:
        """Find exact matches based on identification or email"""
        return Customer.objects.filter(
            ~Q(id=customer.id) &
            (
                Q(identification_number=customer.identification_number) |
                Q(email=customer.email)
            )
        )

    def _find_similar_names(self, customer: Customer) -> List[Customer]:
        """Find customers with similar names"""
        # Get potential matches from DB
        potential_matches = Customer.objects.filter(
            ~Q(id=customer.id) &
            Q(customer_type=customer.customer_type)
        )

        # Filter based on name similarity
        similar_matches = []
        for match in potential_matches:
            similarity = calculate_string_similarity(
                customer.name.lower(),
                match.name.lower()
            )
            if similarity >= self.similarity_threshold:
                similar_matches.append(match)

        return similar_matches

    def _find_similar_identifications(self, customer: Customer) -> List[Customer]:
        """Find customers with similar identification numbers"""
        return Customer.objects.filter(
            ~Q(id=customer.id) &
            Q(identification_type=customer.identification_type) &
            Q(identification_number__icontains=customer.identification_number[:5])
        )

    def _find_contact_matches(self, customer: Customer) -> List[Customer]:
        """Find customers with matching contact information"""
        return Customer.objects.filter(
            ~Q(id=customer.id) &
            (
                Q(phone=customer.phone) |
                Q(email=customer.email)
            )
        )

    def _format_matches(self, matches: List[Customer], match_type: str) -> List[Dict[str, Any]]:
        """Format matches with match type and confidence score"""
        formatted_matches = []
        for match in matches:
            formatted_matches.append({
                'customer_id': match.customer_id,
                'name': match.name,
                'match_type': match_type,
                'confidence_score': self._calculate_confidence_score(match_type),
                'matched_fields': self._get_matched_fields(match),
                'detection_date': timezone.now().isoformat()
            })
        return formatted_matches

    def _calculate_confidence_score(self, match_type: str) -> float:
        """Calculate confidence score based on match type"""
        scores = {
            'EXACT': 1.0,
            'NAME': 0.85,
            'IDENTIFICATION': 0.90,
            'CONTACT': 0.75
        }
        return scores.get(match_type, 0.5)

    def _get_matched_fields(self, customer: Customer) -> Dict[str, Any]:
        """Get relevant fields for duplicate detection"""
        return {
            'identification': {
                'type': customer.identification_type,
                'number': customer.identification_number
            },
            'contact': {
                'email': customer.email,
                'phone': customer.phone
            },
            'address': customer.address,
            'nationality': customer.nationality
        } 