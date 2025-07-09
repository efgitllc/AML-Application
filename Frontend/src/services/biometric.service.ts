import { api } from './api';

export interface BiometricEnrollmentData {
  type: 'face' | 'fingerprint' | 'voice';
  data: string | Blob;
}

export interface BiometricVerificationData {
  type: 'face' | 'fingerprint' | 'voice';
  data: string | Blob;
}

export interface BiometricStatus {
  face: boolean;
  fingerprint: boolean;
  voice: boolean;
}

class BiometricService {
  private readonly baseUrl = '/api/biometric';

  async enrollBiometric(data: BiometricEnrollmentData): Promise<void> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('data', data.data);

    await api.post(`${this.baseUrl}/enroll`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async verifyBiometric(data: BiometricVerificationData): Promise<boolean> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('data', data.data);

    const response = await api.post<{ verified: boolean }>(
      `${this.baseUrl}/verify`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.verified;
  }

  async getBiometricStatus(): Promise<BiometricStatus> {
    const response = await api.get<BiometricStatus>(`${this.baseUrl}/status`);
    return response.data;
  }

  async deleteBiometric(type: 'face' | 'fingerprint' | 'voice'): Promise<void> {
    await api.delete(`${this.baseUrl}/${type}`);
  }
}

export const biometricService = new BiometricService();