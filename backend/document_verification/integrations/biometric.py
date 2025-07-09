from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import face_recognition
from deepface import DeepFace
import cv2
import numpy as np
from PIL import Image
import io
import logging
from typing import Dict, Tuple, Optional

logger = logging.getLogger(__name__)

class BiometricVerification:
    """
    Biometric verification integration for facial recognition and liveness detection
    """
    def __init__(self):
        self.face_detection_model = 'hog'  # or 'cnn' for GPU
        self.face_distance_threshold = getattr(settings, 'FACE_RECOGNITION_TOLERANCE', 0.6)
        self.liveness_confidence_threshold = getattr(settings, 'LIVENESS_DETECTION_THRESHOLD', 0.85)

    def verify_face_match(self, reference_image: bytes, capture_image: bytes) -> Dict:
        """Verify face match between reference and capture images"""
        try:
            # Load and process images
            ref_face = self._process_image(reference_image)
            cap_face = self._process_image(capture_image)

            if not ref_face or not cap_face:
                raise ValidationError(_("No face detected in one or both images"))

            # Calculate face distance
            face_distance = face_recognition.face_distance([ref_face], cap_face)[0]
            match_confidence = 1 - face_distance

            # Verify match
            is_match = face_distance <= self.face_distance_threshold

            return {
                'is_match': is_match,
                'confidence': float(match_confidence),
                'face_distance': float(face_distance)
            }
        except Exception as e:
            logger.error(f"Face verification failed: {str(e)}")
            raise ValidationError(_("Face verification failed"))

    def perform_liveness_detection(self, image_bytes: bytes) -> Dict:
        """Perform liveness detection on captured image"""
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Perform liveness detection using DeepFace
            analysis = DeepFace.analyze(
                img,
                actions=['emotion', 'age', 'gender', 'race'],
                enforce_detection=True
            )

            # Additional liveness checks
            blink_detected = self._check_blink_detection(img)
            motion_detected = self._check_motion_patterns(img)
            texture_analysis = self._perform_texture_analysis(img)

            # Combine all liveness indicators
            liveness_score = self._calculate_liveness_score(
                analysis,
                blink_detected,
                motion_detected,
                texture_analysis
            )

            return {
                'is_live': liveness_score >= self.liveness_confidence_threshold,
                'liveness_score': liveness_score,
                'analysis': {
                    'emotion': analysis[0]['emotion'],
                    'age': analysis[0]['age'],
                    'gender': analysis[0]['gender'],
                    'blink_detected': blink_detected,
                    'motion_detected': motion_detected
                }
            }
        except Exception as e:
            logger.error(f"Liveness detection failed: {str(e)}")
            raise ValidationError(_("Liveness detection failed"))

    def verify_nfc_chip(self, nfc_data: bytes, reference_image: bytes) -> Dict:
        """Verify NFC chip data and match with reference image"""
        try:
            # Extract facial image from NFC data
            nfc_face_image = self._extract_nfc_face_image(nfc_data)
            
            if not nfc_face_image:
                raise ValidationError(_("Failed to extract face image from NFC chip"))

            # Compare NFC image with reference image
            match_result = self.verify_face_match(nfc_face_image, reference_image)

            return {
                'chip_verified': True,
                'face_match': match_result,
                'chip_data_valid': True
            }
        except Exception as e:
            logger.error(f"NFC verification failed: {str(e)}")
            raise ValidationError(_("NFC chip verification failed"))

    def _process_image(self, image_bytes: bytes) -> np.ndarray:
        """Process image and return face encoding"""
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert BGR to RGB
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Detect face locations
        face_locations = face_recognition.face_locations(
            rgb_img,
            model=self.face_detection_model
        )
        
        if not face_locations:
            return None
        
        # Get face encoding
        face_encodings = face_recognition.face_encodings(rgb_img, face_locations)
        return face_encodings[0] if face_encodings else None

    def _check_blink_detection(self, image: np.ndarray) -> bool:
        """Detect eye blink in image"""
        # Implement eye aspect ratio (EAR) calculation
        # This is a placeholder - implement actual blink detection
        return True

    def _check_motion_patterns(self, image: np.ndarray) -> bool:
        """Check for natural motion patterns"""
        # Implement motion pattern analysis
        # This is a placeholder - implement actual motion detection
        return True

    def _perform_texture_analysis(self, image: np.ndarray) -> float:
        """Analyze image texture for anti-spoofing"""
        # Implement texture analysis for detecting printouts or screens
        # This is a placeholder - implement actual texture analysis
        return 0.95

    def _calculate_liveness_score(
        self,
        analysis: Dict,
        blink_detected: bool,
        motion_detected: bool,
        texture_score: float
    ) -> float:
        """Calculate overall liveness score"""
        # Weighted combination of all liveness indicators
        weights = {
            'emotion': 0.2,
            'blink': 0.3,
            'motion': 0.3,
            'texture': 0.2
        }

        emotion_confidence = max(analysis[0]['emotion'].values())
        
        score = (
            weights['emotion'] * emotion_confidence +
            weights['blink'] * float(blink_detected) +
            weights['motion'] * float(motion_detected) +
            weights['texture'] * texture_score
        )

        return min(max(score, 0.0), 1.0)

    def _extract_nfc_face_image(self, nfc_data: bytes) -> Optional[bytes]:
        """Extract facial image from NFC chip data"""
        # Implement NFC chip data parsing and image extraction
        # This is a placeholder - implement actual NFC data processing
        return nfc_data 