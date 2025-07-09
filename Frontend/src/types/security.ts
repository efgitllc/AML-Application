export interface SecurityEvent {
  id: string;
  eventType: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'MFA_SETUP' | 'ACCESS_DENIED' | 'PERMISSION_CHANGE';
  userId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILURE';
  details: Record<string, any>;
}

export interface AccessControl {
  id: string;
  resourceType: string;
  resourceId: string;
  permissions: string[];
  roles: string[];
  conditions?: Record<string, any>;
}

export interface Session {
  id: string;
  userId: string;
  startTime: string;
  lastActivity: string;
  expiresAt: string;
  deviceInfo: {
    deviceId: string;
    deviceType: string;
    browser: string;
    os: string;
  };
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
}

export interface SecurityConfiguration {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    preventReuse: number;
  };
  mfaPolicy: {
    required: boolean;
    methods: ('SMS' | 'EMAIL' | 'AUTHENTICATOR' | 'BIOMETRIC')[];
    graceLoginCount: number;
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    idleTimeout: number;
    requireMFAOnNewDevice: boolean;
  };
  ipPolicy: {
    allowedIPs: string[];
    blockedIPs: string[];
    geoRestrictions: string[];
  };
}

export interface SecurityAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  description: string;
  timestamp: string;
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  affectedUsers: string[];
  affectedResources: string[];
  remediation?: string;
}

export interface EncryptionKey {
  id: string;
  type: 'SYMMETRIC' | 'ASYMMETRIC';
  algorithm: string;
  status: 'ACTIVE' | 'ROTATED' | 'REVOKED';
  createdAt: string;
  expiresAt: string;
  lastRotated?: string;
}

export interface SecurityMetrics {
  failedLoginAttempts: number;
  activeSessions: number;
  mfaEnrollmentRate: number;
  passwordResetRate: number;
  securityIncidents: number;
  averageIncidentResolutionTime: number;
  vulnerabilities: {
    high: number;
    medium: number;
    low: number;
  };
} 