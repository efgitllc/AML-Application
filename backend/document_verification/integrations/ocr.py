from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import platform
import sys
import subprocess
import logging
from typing import Dict, List, Tuple, Optional

# Core dependencies check
try:
    import pytesseract
    from PIL import Image
    import cv2
    import numpy as np
    from pdf2image import convert_from_path
    HAS_CORE_OCR = True
except ImportError as e:
    HAS_CORE_OCR = False
    CORE_OCR_ERROR = str(e)

# Optional advanced dependencies check
try:
    import face_recognition
    import dlib
    HAS_FACE_RECOGNITION = True
except ImportError as e:
    HAS_FACE_RECOGNITION = False
    FACE_RECOGNITION_ERROR = str(e)

import tempfile
import os

logger = logging.getLogger(__name__)

def check_cmake_installation():
    """
    Check if CMake is installed and provide installation instructions if not.
    """
    try:
        result = subprocess.run(['cmake', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return True, result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
        pass
    
    return False, get_cmake_install_instructions()

def get_cmake_install_instructions():
    """
    Generate platform-specific CMake installation instructions.
    """
    system = platform.system().lower()
    
    instructions = {
        'windows': """
CMake Installation Required for Advanced OCR Features

Windows Installation:
1. Download CMake from: https://cmake.org/download/
2. Choose "Windows x64 Installer" (.msi file)
3. During installation, check "Add CMake to system PATH"
4. Restart your command prompt/PowerShell
5. Verify installation: cmake --version

Alternative via Chocolatey:
choco install cmake

Alternative via Winget:
winget install Kitware.CMake
        """,
        'darwin': """
CMake Installation Required for Advanced OCR Features

macOS Installation:
1. Via Homebrew (recommended):
   brew install cmake

2. Via MacPorts:
   sudo port install cmake

3. Direct download:
   Download from https://cmake.org/download/
   Choose "macOS 10.13 or later" (.dmg file)

4. Verify installation: cmake --version
        """,
        'linux': """
CMake Installation Required for Advanced OCR Features

Linux Installation:

Ubuntu/Debian:
sudo apt update
sudo apt install cmake build-essential

CentOS/RHEL/Fedora:
sudo yum install cmake gcc gcc-c++ make
# or for newer versions:
sudo dnf install cmake gcc gcc-c++ make

Arch Linux:
sudo pacman -S cmake base-devel

From source:
wget https://github.com/Kitware/CMake/releases/download/v3.28.1/cmake-3.28.1.tar.gz
tar -xzf cmake-3.28.1.tar.gz
cd cmake-3.28.1
./bootstrap && make && sudo make install

Verify installation: cmake --version
        """
    }
    
    return instructions.get(system, instructions['linux'])

class DocumentOCR:
    """
    Document OCR and verification integration with advanced facial recognition
    
    Features:
    - Basic OCR: pytesseract, opencv-python, pdf2image
    - Advanced Face Recognition: face-recognition, dlib (requires CMake)
    """
    
    def __init__(self):
        self.tesseract_cmd = getattr(settings, 'TESSERACT_CMD_PATH', '/usr/bin/tesseract')
        
        # Check core OCR dependencies
        if not HAS_CORE_OCR:
            logger.error(f"Core OCR dependencies missing: {CORE_OCR_ERROR}")
            raise ImportError(f"Missing core OCR packages: {CORE_OCR_ERROR}")
        
        pytesseract.pytesseract.tesseract_cmd = self.tesseract_cmd
        self.supported_formats = ['pdf', 'jpg', 'jpeg', 'png']
        
        # Check CMake and face recognition capabilities
        self.cmake_available, self.cmake_info = check_cmake_installation()
        self.has_face_recognition = HAS_FACE_RECOGNITION
        
        if not self.cmake_available:
            logger.warning("CMake not installed. Advanced facial recognition features disabled.")
            logger.info(f"CMake installation instructions:\n{self.cmake_info}")
        
        if not self.has_face_recognition:
            logger.warning(f"Face recognition not available: {FACE_RECOGNITION_ERROR}")
            if not self.cmake_available:
                logger.info("Install CMake first, then run: pip install face-recognition dlib")

    def get_system_status(self):
        """
        Get comprehensive system status for OCR capabilities.
        """
        status = {
            'core_ocr_available': HAS_CORE_OCR,
            'face_recognition_available': self.has_face_recognition,
            'cmake_available': self.cmake_available,
            'tesseract_path': self.tesseract_cmd,
            'platform': platform.system(),
            'python_version': sys.version,
        }
        
        if not self.cmake_available:
            status['cmake_install_instructions'] = self.cmake_info
        
        if not self.has_face_recognition:
            status['face_recognition_error'] = FACE_RECOGNITION_ERROR
            
        return status

    def process_document(self, file_path: str, document_type: str, enable_face_detection: bool = False) -> Dict:
        """Process document and extract information"""
        try:
            # Convert document to image if PDF
            images = self._get_document_images(file_path)
            
            results = []
            for img in images:
                # Preprocess image
                processed_img = self._preprocess_image(img)
                
                # Extract text based on document type
                if document_type == 'EMIRATES_ID':
                    result = self._process_emirates_id(processed_img, enable_face_detection)
                elif document_type == 'TRADE_LICENSE':
                    result = self._process_trade_license(processed_img)
                else:
                    result = self._process_generic_document(processed_img)
                
                results.append(result)
            
            return self._combine_results(results)
        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}")
            raise ValidationError(_("Failed to process document"))

    def _get_document_images(self, file_path: str) -> List[Image.Image]:
        """Convert document to list of images"""
        ext = file_path.split('.')[-1].lower()
        if ext not in self.supported_formats:
            raise ValidationError(_("Unsupported document format"))

        if ext == 'pdf':
            return convert_from_path(file_path)
        else:
            return [Image.open(file_path)]

    def _preprocess_image(self, image: Image.Image) -> np.ndarray:
        """Preprocess image for better OCR results"""
        # Convert PIL Image to OpenCV format
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        
        # Noise removal
        denoised = cv2.fastNlMeansDenoising(thresh)
        
        return denoised

    def _process_emirates_id(self, image: np.ndarray, enable_face_detection: bool = False) -> Dict:
        """Process Emirates ID and extract information"""
        # Define regions of interest for Emirates ID
        regions = {
            'id_number': ((100, 50), (300, 80)),  # Example coordinates
            'name': ((100, 100), (300, 130)),
            'nationality': ((100, 150), (300, 180)),
            'date_of_birth': ((100, 200), (300, 230))
        }
        
        extracted_data = {}
        for field, coords in regions.items():
            roi = image[coords[0][1]:coords[1][1], coords[0][0]:coords[1][0]]
            text = pytesseract.image_to_string(roi, lang='eng+ara')
            extracted_data[field] = text.strip()
        
        # Validate Emirates ID format
        if 'id_number' in extracted_data:
            id_number = extracted_data['id_number']
            if not self._validate_emirates_id_format(id_number):
                logger.warning(f"Invalid Emirates ID format detected: {id_number}")
        
        # Advanced face detection if available and requested
        if enable_face_detection and self.has_face_recognition:
            try:
                face_data = self._extract_face_data(image)
                extracted_data.update(face_data)
            except Exception as e:
                logger.warning(f"Face detection failed: {str(e)}")
                extracted_data['face_detection_error'] = str(e)
        elif enable_face_detection and not self.has_face_recognition:
            extracted_data['face_detection_available'] = False
            extracted_data['face_detection_message'] = "Face recognition requires CMake installation"
        
        return extracted_data

    def _extract_face_data(self, image: np.ndarray) -> Dict:
        """Extract face data from image using face_recognition library"""
        if not self.has_face_recognition:
            return {'face_detection_available': False}
        
        try:
            # Convert BGR to RGB for face_recognition
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Find face locations
            face_locations = face_recognition.face_locations(rgb_image)
            
            if face_locations:
                # Get face encodings
                face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
                
                return {
                    'faces_detected': len(face_locations),
                    'face_locations': face_locations,
                    'face_encodings_available': len(face_encodings) > 0,
                    'face_detection_available': True
                }
            else:
                return {
                    'faces_detected': 0,
                    'face_detection_available': True
                }
        except Exception as e:
            logger.error(f"Face extraction failed: {str(e)}")
            return {
                'face_detection_error': str(e),
                'face_detection_available': True
            }

    def _process_trade_license(self, image: np.ndarray) -> Dict:
        """Process Trade License and extract information"""
        # Define regions of interest for Trade License
        regions = {
            'license_number': ((100, 50), (300, 80)),  # Example coordinates
            'company_name': ((100, 100), (300, 130)),
            'issue_date': ((100, 150), (300, 180)),
            'expiry_date': ((100, 200), (300, 230))
        }
        
        extracted_data = {}
        for field, coords in regions.items():
            roi = image[coords[0][1]:coords[1][1], coords[0][0]:coords[1][0]]
            text = pytesseract.image_to_string(roi, lang='eng+ara')
            extracted_data[field] = text.strip()
        
        # Validate Trade License format
        if 'license_number' in extracted_data:
            license_number = extracted_data['license_number']
            if not self._validate_trade_license_format(license_number):
                logger.warning(f"Invalid Trade License format detected: {license_number}")
        
        return extracted_data

    def _process_generic_document(self, image: np.ndarray) -> Dict:
        """Process generic document and extract text"""
        text = pytesseract.image_to_string(image, lang='eng+ara')
        return {'full_text': text.strip()}

    def _combine_results(self, results: List[Dict]) -> Dict:
        """Combine results from multiple pages"""
        if len(results) == 1:
            return results[0]
        
        combined = {}
        for result in results:
            for key, value in result.items():
                if key not in combined:
                    combined[key] = value
                else:
                    combined[key] += f" {value}"
        
        return combined

    def _validate_emirates_id_format(self, id_number: str) -> bool:
        """Validate Emirates ID format"""
        import re
        pattern = r'^\d{3}-\d{4}-\d{7}-\d{1}$'
        return bool(re.match(pattern, id_number))

    def _validate_trade_license_format(self, license_number: str) -> bool:
        """Validate Trade License format"""
        import re
        pattern = r'^[A-Z0-9]{5,20}$'
        return bool(re.match(pattern, license_number)) 