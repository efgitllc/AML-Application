import { useState, useEffect, useCallback } from 'react';
import { securityService } from '../services/security.service';
import type {
  SecurityEvent,
  AccessControl,
  Session,
  SecurityConfiguration,
  SecurityAlert,
  EncryptionKey,
  SecurityMetrics,
} from '../types/security';

interface UseSecurityReturn {
  // Events
  events: SecurityEvent[];
  loadEvents: (filters?: Record<string, any>) => Promise<void>;
  logEvent: (event: Partial<SecurityEvent>) => Promise<void>;

  // Access Control
  accessControls: AccessControl[];
  loadAccessControls: (resourceType: string, resourceId: string) => Promise<void>;
  updateAccessControl: (control: Partial<AccessControl>) => Promise<void>;

  // Sessions
  sessions: Session[];
  loadSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllOtherSessions: () => Promise<void>;

  // Configuration
  configuration: SecurityConfiguration | null;
  loadConfiguration: () => Promise<void>;
  updateConfiguration: (config: Partial<SecurityConfiguration>) => Promise<void>;

  // Alerts
  alerts: SecurityAlert[];
  loadAlerts: (filters?: Record<string, any>) => Promise<void>;
  updateAlert: (alertId: string, update: Partial<SecurityAlert>) => Promise<void>;

  // Encryption
  encryptionKeys: EncryptionKey[];
  loadEncryptionKeys: () => Promise<void>;
  rotateKey: (keyId: string) => Promise<void>;

  // Metrics
  metrics: SecurityMetrics | null;
  loadMetrics: (timeframe?: string) => Promise<void>;

  // MFA
  setupMFA: (method: string) => Promise<{ setupData: Record<string, any>; verificationRequired: boolean }>;
  verifyMFA: (method: string, code: string) => Promise<boolean>;
  disableMFA: (method: string, verificationCode: string) => Promise<void>;

  loading: boolean;
  error: string | null;
}

export const useSecurity = (): UseSecurityReturn => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [configuration, setConfiguration] = useState<SecurityConfiguration | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async (filters?: Record<string, any>) => {
    try {
      setLoading(true);
      const result = await securityService.getSecurityEvents(filters);
      setEvents(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security events');
    } finally {
      setLoading(false);
    }
  };

  const logEvent = async (event: Partial<SecurityEvent>) => {
    try {
      setLoading(true);
      const result = await securityService.logSecurityEvent(event);
      setEvents((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log security event');
    } finally {
      setLoading(false);
    }
  };

  const loadAccessControls = async (resourceType: string, resourceId: string) => {
    try {
      setLoading(true);
      const result = await securityService.getAccessControls(resourceType, resourceId);
      setAccessControls(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load access controls');
    } finally {
      setLoading(false);
    }
  };

  const updateAccessControl = async (control: Partial<AccessControl>) => {
    try {
      setLoading(true);
      const result = await securityService.updateAccessControl(control);
      setAccessControls((prev) =>
        prev.map((ac) => (ac.id === result.id ? result : ac))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update access control');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const result = await securityService.getCurrentSessions();
      setSessions(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      setLoading(true);
      await securityService.terminateSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate session');
    } finally {
      setLoading(false);
    }
  };

  const terminateAllOtherSessions = async () => {
    try {
      setLoading(true);
      await securityService.terminateAllOtherSessions();
      await loadSessions(); // Reload sessions after termination
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate other sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const result = await securityService.getSecurityConfiguration();
      setConfiguration(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (config: Partial<SecurityConfiguration>) => {
    try {
      setLoading(true);
      const result = await securityService.updateSecurityConfiguration(config);
      setConfiguration(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update security configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async (filters?: Record<string, any>) => {
    try {
      setLoading(true);
      const result = await securityService.getSecurityAlerts(filters);
      setAlerts(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security alerts');
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (alertId: string, update: Partial<SecurityAlert>) => {
    try {
      setLoading(true);
      const result = await securityService.updateSecurityAlert(alertId, update);
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === result.id ? result : alert))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update security alert');
    } finally {
      setLoading(false);
    }
  };

  const loadEncryptionKeys = async () => {
    try {
      setLoading(true);
      const result = await securityService.getEncryptionKeys();
      setEncryptionKeys(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load encryption keys');
    } finally {
      setLoading(false);
    }
  };

  const rotateKey = async (keyId: string) => {
    try {
      setLoading(true);
      const result = await securityService.rotateEncryptionKey(keyId);
      setEncryptionKeys((prev) =>
        prev.map((key) => (key.id === result.id ? result : key))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rotate encryption key');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async (timeframe?: string) => {
    try {
      setLoading(true);
      const result = await securityService.getSecurityMetrics(timeframe);
      setMetrics(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security metrics');
    } finally {
      setLoading(false);
    }
  };

  const setupMFA = async (method: string) => {
    try {
      setLoading(true);
      const result = await securityService.setupMFA(method);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup MFA');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async (method: string, code: string) => {
    try {
      setLoading(true);
      const result = await securityService.verifyMFA(method, code);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify MFA');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async (method: string, verificationCode: string) => {
    try {
      setLoading(true);
      await securityService.disableMFA(method, verificationCode);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
    loadMetrics();
  }, []);

  return {
    events,
    loadEvents,
    logEvent,
    accessControls,
    loadAccessControls,
    updateAccessControl,
    sessions,
    loadSessions,
    terminateSession,
    terminateAllOtherSessions,
    configuration,
    loadConfiguration,
    updateConfiguration,
    alerts,
    loadAlerts,
    updateAlert,
    encryptionKeys,
    loadEncryptionKeys,
    rotateKey,
    metrics,
    loadMetrics,
    setupMFA,
    verifyMFA,
    disableMFA,
    loading,
    error,
  };
}; 