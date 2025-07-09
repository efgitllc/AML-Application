import { api } from './api';
import type {
  SecurityEvent,
  AccessControl,
  Session,
  SecurityConfiguration,
  SecurityAlert,
  EncryptionKey,
  SecurityMetrics,
} from '../types/security';

class SecurityService {
  private readonly BASE_PATH = '/api/security';

  // Security Events
  async getSecurityEvents(filters?: Record<string, any>): Promise<SecurityEvent[]> {
    const response = await api.get<SecurityEvent[]>(`${this.BASE_PATH}/events`, { params: filters });
    return response.data;
  }

  async logSecurityEvent(event: Partial<SecurityEvent>): Promise<SecurityEvent> {
    const response = await api.post<SecurityEvent>(`${this.BASE_PATH}/events`, event);
    return response.data;
  }

  // Access Control
  async getAccessControls(resourceType: string, resourceId: string): Promise<AccessControl[]> {
    const response = await api.get<AccessControl[]>(`${this.BASE_PATH}/access-control`, {
      params: { resourceType, resourceId },
    });
    return response.data;
  }

  async updateAccessControl(accessControl: Partial<AccessControl>): Promise<AccessControl> {
    const response = await api.put<AccessControl>(
      `${this.BASE_PATH}/access-control/${accessControl.id}`,
      accessControl
    );
    return response.data;
  }

  // Session Management
  async getCurrentSessions(): Promise<Session[]> {
    const response = await api.get<Session[]>(`${this.BASE_PATH}/sessions`);
    return response.data;
  }

  async terminateSession(sessionId: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/sessions/${sessionId}`);
  }

  async terminateAllOtherSessions(): Promise<void> {
    await api.delete(`${this.BASE_PATH}/sessions/all-except-current`);
  }

  // Security Configuration
  async getSecurityConfiguration(): Promise<SecurityConfiguration> {
    const response = await api.get<SecurityConfiguration>(`${this.BASE_PATH}/configuration`);
    return response.data;
  }

  async updateSecurityConfiguration(
    config: Partial<SecurityConfiguration>
  ): Promise<SecurityConfiguration> {
    const response = await api.put<SecurityConfiguration>(`${this.BASE_PATH}/configuration`, config);
    return response.data;
  }

  // Security Alerts
  async getSecurityAlerts(filters?: Record<string, any>): Promise<SecurityAlert[]> {
    const response = await api.get<SecurityAlert[]>(`${this.BASE_PATH}/alerts`, { params: filters });
    return response.data;
  }

  async updateSecurityAlert(
    alertId: string,
    update: Partial<SecurityAlert>
  ): Promise<SecurityAlert> {
    const response = await api.put<SecurityAlert>(
      `${this.BASE_PATH}/alerts/${alertId}`,
      update
    );
    return response.data;
  }

  // Encryption Keys
  async getEncryptionKeys(): Promise<EncryptionKey[]> {
    const response = await api.get<EncryptionKey[]>(`${this.BASE_PATH}/encryption-keys`);
    return response.data;
  }

  async rotateEncryptionKey(keyId: string): Promise<EncryptionKey> {
    const response = await api.post<EncryptionKey>(
      `${this.BASE_PATH}/encryption-keys/${keyId}/rotate`
    );
    return response.data;
  }

  // Security Metrics
  async getSecurityMetrics(timeframe?: string): Promise<SecurityMetrics> {
    const response = await api.get<SecurityMetrics>(`${this.BASE_PATH}/metrics`, {
      params: { timeframe },
    });
    return response.data;
  }

  // Password Management
  async validatePassword(password: string): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const response = await api.post<{ valid: boolean; errors: string[] }>(
      `${this.BASE_PATH}/password/validate`,
      { password }
    );
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post(`${this.BASE_PATH}/password/change`, {
      oldPassword,
      newPassword,
    });
  }

  // MFA Management
  async setupMFA(method: string): Promise<{
    setupData: Record<string, any>;
    verificationRequired: boolean;
  }> {
    const response = await api.post<{
      setupData: Record<string, any>;
      verificationRequired: boolean;
    }>(`${this.BASE_PATH}/mfa/setup`, { method });
    return response.data;
  }

  async verifyMFA(method: string, code: string): Promise<boolean> {
    const response = await api.post<{ verified: boolean }>(`${this.BASE_PATH}/mfa/verify`, {
      method,
      code,
    });
    return response.data.verified;
  }

  async disableMFA(method: string, verificationCode: string): Promise<void> {
    await api.post(`${this.BASE_PATH}/mfa/disable`, {
      method,
      verificationCode,
    });
  }
}

export const securityService = new SecurityService(); 