import { useState, useEffect, useCallback } from 'react';
import { biometricService } from '../services/biometric.service';
import type { BiometricStatus } from '../services/biometric.service';

interface UseBiometricReturn {
  enrollmentStatus: BiometricStatus;
  loading: boolean;
  error: string | null;
  success: boolean;
  enrollBiometric: (type: 'face' | 'fingerprint' | 'voice', data: string | Blob) => Promise<void>;
  verifyBiometric: (type: 'face' | 'fingerprint' | 'voice', data: string | Blob) => Promise<boolean>;
  deleteBiometric: (type: 'face' | 'fingerprint' | 'voice') => Promise<void>;
  resetState: () => void;
}

export const useBiometric = (): UseBiometricReturn => {
  const [enrollmentStatus, setEnrollmentStatus] = useState<BiometricStatus>({
    face: false,
    fingerprint: false,
    voice: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchEnrollmentStatus = useCallback(async () => {
    try {
      const status = await biometricService.getBiometricStatus();
      setEnrollmentStatus(status);
    } catch (err) {
      console.error('Failed to fetch biometric status:', err);
      setError('Failed to fetch biometric enrollment status');
    }
  }, []);

  useEffect(() => {
    fetchEnrollmentStatus();
  }, [fetchEnrollmentStatus]);

  const enrollBiometric = async (type: 'face' | 'fingerprint' | 'voice', data: string | Blob) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await biometricService.enrollBiometric({ type, data });
      await fetchEnrollmentStatus();
      setSuccess(true);
    } catch (err) {
      console.error(`Failed to enroll ${type}:`, err);
      setError(`Failed to enroll ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const verifyBiometric = async (type: 'face' | 'fingerprint' | 'voice', data: string | Blob) => {
    setLoading(true);
    setError(null);

    try {
      const verified = await biometricService.verifyBiometric({ type, data });
      return verified;
    } catch (err) {
      console.error(`Failed to verify ${type}:`, err);
      setError(`Failed to verify ${type}. Please try again.`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBiometric = async (type: 'face' | 'fingerprint' | 'voice') => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await biometricService.deleteBiometric(type);
      await fetchEnrollmentStatus();
      setSuccess(true);
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
      setError(`Failed to delete ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    enrollmentStatus,
    loading,
    error,
    success,
    enrollBiometric,
    verifyBiometric,
    deleteBiometric,
    resetState,
  };
}; 