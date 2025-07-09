from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import requests
try:
    from lxml import etree as ET
    from lxml import objectify
    HAS_LXML = True
except ImportError:
    import xml.etree.ElementTree as ET
    HAS_LXML = False
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class GoAMLClient:
    """
    goAML integration client for regulatory reporting
    """
    def __init__(self):
        self.base_url = settings.GOAML_BASE_URL
        self.org_id = settings.GOAML_ORG_ID
        self.username = settings.GOAML_USERNAME
        self.password = settings.GOAML_PASSWORD
        self.session = None

    def authenticate(self):
        """Authenticate with goAML system"""
        try:
            response = requests.post(
                f"{self.base_url}/authentication",
                json={
                    'orgId': self.org_id,
                    'username': self.username,
                    'password': self.password
                }
            )
            response.raise_for_status()
            self.session = response.json().get('session_token')
            return self.session
        except requests.exceptions.RequestException as e:
            logger.error(f"goAML authentication failed: {str(e)}")
            raise ValidationError(_("Failed to authenticate with goAML"))

    def generate_str_xml(self, report_data):
        """Generate XML for Suspicious Transaction Report"""
        root = ET.Element("goAMLReport")
        root.set("xmlns", "http://www.unodc.org/goaml/XMLSchema/v1.0")
        
        # Report Header
        header = ET.SubElement(root, "ReportHeader")
        ET.SubElement(header, "Version").text = "1.0"
        ET.SubElement(header, "ReportCode").text = report_data['report_code']
        ET.SubElement(header, "SubmissionDate").text = datetime.now().isoformat()
        ET.SubElement(header, "Currency").text = "AED"
        
        # Transaction Details
        transaction = ET.SubElement(root, "Transaction")
        ET.SubElement(transaction, "TransactionNumber").text = report_data['transaction_ref']
        ET.SubElement(transaction, "TransactionDate").text = report_data['transaction_date']
        ET.SubElement(transaction, "TransactionAmount").text = str(report_data['amount'])
        
        # Add parties, locations, and other required fields
        self._add_transaction_parties(transaction, report_data)
        self._add_indicators(transaction, report_data)
        
        return ET.tostring(root, encoding='UTF-8', xml_declaration=True)

    def submit_report(self, xml_content, report_type='STR'):
        """Submit report to goAML"""
        if not self.session:
            self.authenticate()

        try:
            response = requests.post(
                f"{self.base_url}/reports/submit",
                headers={
                    'Authorization': f'Bearer {self.session}',
                    'Content-Type': 'application/xml'
                },
                data=xml_content
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"goAML report submission failed: {str(e)}")
            raise ValidationError(_("Failed to submit report to goAML"))

    def validate_xml(self, xml_content):
        """Validate XML against goAML schema"""
        if not self.session:
            self.authenticate()

        try:
            response = requests.post(
                f"{self.base_url}/reports/validate",
                headers={
                    'Authorization': f'Bearer {self.session}',
                    'Content-Type': 'application/xml'
                },
                data=xml_content
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"goAML XML validation failed: {str(e)}")
            raise ValidationError(_("Failed to validate XML with goAML"))

    def check_report_status(self, report_id):
        """Check status of submitted report"""
        if not self.session:
            self.authenticate()

        try:
            response = requests.get(
                f"{self.base_url}/reports/{report_id}/status",
                headers={'Authorization': f'Bearer {self.session}'}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"goAML report status check failed: {str(e)}")
            raise ValidationError(_("Failed to check report status"))

    def _add_transaction_parties(self, transaction_elem, report_data):
        """Add transaction parties to XML"""
        # From Party
        from_party = ET.SubElement(transaction_elem, "From")
        self._add_party_details(from_party, report_data['originator'])
        
        # To Party
        to_party = ET.SubElement(transaction_elem, "To")
        self._add_party_details(to_party, report_data['beneficiary'])

    def _add_party_details(self, party_elem, party_data):
        """Add party details to XML"""
        if party_data['type'] == 'INDIVIDUAL':
            person = ET.SubElement(party_elem, "Person")
            ET.SubElement(person, "FirstName").text = party_data['first_name']
            ET.SubElement(person, "LastName").text = party_data['last_name']
            ET.SubElement(person, "IdNumber").text = party_data.get('emirates_id', '')
        else:
            entity = ET.SubElement(party_elem, "Entity")
            ET.SubElement(entity, "Name").text = party_data['company_name']
            ET.SubElement(entity, "IncorporationNumber").text = party_data['trade_license_number']

    def _add_indicators(self, transaction_elem, report_data):
        """Add suspicious indicators to XML"""
        indicators = ET.SubElement(transaction_elem, "Indicators")
        for indicator in report_data.get('indicators', []):
            ET.SubElement(indicators, "Indicator").text = indicator 