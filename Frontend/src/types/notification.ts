export interface Notification {
  id: string;
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category:
    | 'SECURITY'
    | 'COMPLIANCE'
    | 'TRANSACTION'
    | 'SYSTEM'
    | 'USER'
    | 'REGULATORY';
  metadata?: Record<string, any>;
  actions?: {
    label: string;
    action: string;
    data?: Record<string, any>;
  }[];
  expiresAt?: string;
  recipientId: string;
  sender?: {
    id: string;
    type: 'SYSTEM' | 'USER' | 'AUTOMATED';
    name: string;
  };
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  channels: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    push: boolean;
  };
  categories: {
    [key: string]: {
      enabled: boolean;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    };
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  batchNotifications: boolean;
  batchInterval: number; // in minutes
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  subject: string;
  content: string;
  variables: string[];
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  active: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationChannel {
  id: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  config: Record<string, any>;
  enabled: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastChecked: string;
  errorMessage?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byCategory: Record<string, number>;
  deliveryStats: {
    successful: number;
    failed: number;
    pending: number;
  };
} 