import type { SettingsData } from '../types/settings';

export const mockSettingsData: SettingsData = {
  notifications: [
    {
      id: '1',
      type: 'email',
      enabled: true,
      events: ['high_risk_alert', 'compliance_breach', 'system_update']
    },
    {
      id: '2',
      type: 'sms',
      enabled: false,
      events: ['critical_alert', 'system_downtime']
    },
    {
      id: '3',
      type: 'in_app',
      enabled: true,
      events: ['all_alerts', 'task_assignments', 'report_ready']
    },
    {
      id: '4',
      type: 'webhook',
      enabled: true,
      events: ['api_integration_failure', 'batch_process_complete']
    }
  ],
  security: [
    {
      id: '1',
      name: 'Two-Factor Authentication',
      value: true,
      description: 'Require 2FA for all user logins',
      category: 'authentication'
    },
    {
      id: '2',
      name: 'Session Timeout',
      value: 30,
      description: 'Automatically log out users after inactivity (minutes)',
      category: 'access_control'
    },
    {
      id: '3',
      name: 'Password Policy',
      value: 'strong',
      description: 'Minimum password requirements for all users',
      category: 'authentication'
    },
    {
      id: '4',
      name: 'Data Encryption',
      value: true,
      description: 'Enable end-to-end encryption for sensitive data',
      category: 'data_protection'
    }
  ],
  compliance: [
    {
      id: '1',
      name: 'KYC Verification Level',
      value: 'enhanced',
      description: 'Required customer verification level',
      lastUpdated: '2024-03-15T10:00:00Z',
      updatedBy: 'System Admin',
      regulatoryReference: 'FATF Recommendation 10'
    },
    {
      id: '2',
      name: 'Transaction Monitoring Threshold',
      value: 10000,
      description: 'Amount threshold for enhanced monitoring (USD)',
      lastUpdated: '2024-03-14T15:30:00Z',
      updatedBy: 'Compliance Officer',
      regulatoryReference: 'BSA/AML Requirements'
    }
  ],
  system: [
    {
      id: '1',
      name: 'System Environment',
      value: 'production',
      description: 'Current system environment',
      category: 'general',
      isEditable: false
    },
    {
      id: '2',
      name: 'API Rate Limit',
      value: 1000,
      description: 'Maximum API calls per minute',
      category: 'performance',
      isEditable: true
    },
    {
      id: '3',
      name: 'Log Retention Period',
      value: 90,
      description: 'Number of days to retain system logs',
      category: 'monitoring',
      isEditable: true
    }
  ],
  api: [
    {
      id: '1',
      name: 'Sanctions Screening API',
      endpoint: 'https://api.sanctions.example.com/v1',
      apiKey: '****************************',
      status: 'active',
      lastChecked: '2024-03-15T12:00:00Z',
      healthStatus: 'healthy'
    },
    {
      id: '2',
      name: 'Document Verification API',
      endpoint: 'https://api.docverify.example.com/v2',
      apiKey: '****************************',
      status: 'active',
      lastChecked: '2024-03-15T12:00:00Z',
      healthStatus: 'warning'
    }
  ],
  theme: {
    mode: 'system',
    primaryColor: '#1976d2',
    density: 'comfortable',
    borderRadius: 8
  },
  preferences: {
    language: 'en-US',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    defaultDashboard: 'analytics'
  }
}; 