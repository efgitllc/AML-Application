export interface AuditEvent {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT';
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILURE';
  errorDetails?: string;
}

export interface AuditTrail {
  id: string;
  entityType: string;
  entityId: string;
  events: AuditEvent[];
  firstEventTimestamp: string;
  lastEventTimestamp: string;
  totalEvents: number;
}

export interface AuditFilter {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface AuditStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByEntity: Record<string, number>;
  eventsByUser: Record<string, number>;
  eventsByStatus: {
    success: number;
    failure: number;
  };
  averageEventsPerDay: number;
  topUsers: {
    userId: string;
    eventCount: number;
  }[];
  topEntities: {
    entityType: string;
    eventCount: number;
  }[];
}

export interface AuditExport {
  id: string;
  filters: AuditFilter;
  format: 'CSV' | 'PDF' | 'JSON';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  url?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface AuditRetentionPolicy {
  id: string;
  entityType: string;
  retentionPeriod: number; // in days
  archiveAfter: number; // in days
  deleteAfter: number; // in days
  archiveLocation: string;
  lastExecuted?: string;
  nextExecution: string;
  status: 'ACTIVE' | 'INACTIVE';
} 