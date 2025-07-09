export interface NotificationSetting {
  id: string;
  type: 'email' | 'sms' | 'in_app' | 'webhook';
  enabled: boolean;
  events: string[];
}

export interface SecuritySetting {
  id: string;
  name: string;
  value: boolean | string | number;
  description: string;
  category: 'authentication' | 'access_control' | 'data_protection';
}

export interface ComplianceSetting {
  id: string;
  name: string;
  value: string | number | boolean;
  description: string;
  lastUpdated: string;
  updatedBy: string;
  regulatoryReference?: string;
}

export interface SystemConfiguration {
  id: string;
  name: string;
  value: string | number | boolean;
  description: string;
  category: 'general' | 'performance' | 'integration' | 'monitoring';
  isEditable: boolean;
}

export interface APIConfiguration {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  status: 'active' | 'inactive';
  lastChecked: string;
  healthStatus: 'healthy' | 'warning' | 'error';
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  density: 'comfortable' | 'compact' | 'standard';
  borderRadius: number;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  defaultDashboard: string;
}

export interface SettingsData {
  notifications: NotificationSetting[];
  security: SecuritySetting[];
  compliance: ComplianceSetting[];
  system: SystemConfiguration[];
  api: APIConfiguration[];
  theme: ThemeSettings;
  preferences: UserPreferences;
} 