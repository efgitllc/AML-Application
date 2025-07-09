import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/audit.service';
import type {
  AuditEvent,
  AuditTrail,
  AuditFilter,
  AuditStats,
  AuditExport,
  AuditRetentionPolicy,
} from '../types/audit';

interface UseAuditReturn {
  // Events
  events: AuditEvent[];
  loadEvents: (filters?: AuditFilter) => Promise<void>;
  getEvent: (id: string) => Promise<AuditEvent>;

  // Trails
  trails: AuditTrail[];
  loadTrails: (filters?: AuditFilter) => Promise<void>;
  getTrail: (id: string) => Promise<AuditTrail>;
  getEntityTrail: (entityType: string, entityId: string) => Promise<AuditTrail>;

  // Stats
  stats: AuditStats | null;
  loadStats: (timeframe?: string) => Promise<void>;

  // Exports
  exports: AuditExport[];
  createExport: (filters: AuditFilter, format: 'CSV' | 'PDF' | 'JSON') => Promise<void>;
  deleteExport: (id: string) => Promise<void>;

  // Retention Policies
  retentionPolicies: AuditRetentionPolicy[];
  loadRetentionPolicies: () => Promise<void>;
  createRetentionPolicy: (policy: Partial<AuditRetentionPolicy>) => Promise<void>;
  updateRetentionPolicy: (id: string, policy: Partial<AuditRetentionPolicy>) => Promise<void>;
  deleteRetentionPolicy: (id: string) => Promise<void>;

  // Search
  searchEvents: (query: string) => Promise<void>;

  // Reports
  generateReport: (filters: AuditFilter, format: 'PDF' | 'EXCEL') => Promise<string>;

  // Archive
  archiveEvents: (filters: AuditFilter) => Promise<{ jobId: string; status: string }>;
  getArchiveStatus: (jobId: string) => Promise<{
    jobId: string;
    status: string;
    progress: number;
    error?: string;
  }>;
  restoreFromArchive: (
    archiveId: string,
    filters?: AuditFilter
  ) => Promise<{ jobId: string; status: string }>;

  loading: boolean;
  error: string | null;
}

export const useAudit = (): UseAuditReturn => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [trails, setTrails] = useState<AuditTrail[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [exports, setExports] = useState<AuditExport[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<AuditRetentionPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async (filters?: AuditFilter) => {
    try {
      setLoading(true);
      const result = await auditService.getEvents(filters);
      setEvents(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit events');
    } finally {
      setLoading(false);
    }
  };

  const getEvent = async (id: string) => {
    try {
      setLoading(true);
      const result = await auditService.getEvent(id);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get audit event');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadTrails = async (filters?: AuditFilter) => {
    try {
      setLoading(true);
      const result = await auditService.getTrails(filters);
      setTrails(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit trails');
    } finally {
      setLoading(false);
    }
  };

  const getTrail = async (id: string) => {
    try {
      setLoading(true);
      const result = await auditService.getTrail(id);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get audit trail');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEntityTrail = async (entityType: string, entityId: string) => {
    try {
      setLoading(true);
      const result = await auditService.getEntityTrail(entityType, entityId);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get entity audit trail');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (timeframe?: string) => {
    try {
      setLoading(true);
      const result = await auditService.getStats(timeframe);
      setStats(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit stats');
    } finally {
      setLoading(false);
    }
  };

  const createExport = async (filters: AuditFilter, format: 'CSV' | 'PDF' | 'JSON') => {
    try {
      setLoading(true);
      const result = await auditService.createExport(filters, format);
      setExports((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create export');
    } finally {
      setLoading(false);
    }
  };

  const deleteExport = async (id: string) => {
    try {
      setLoading(true);
      await auditService.deleteExport(id);
      setExports((prev) => prev.filter((e) => e.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete export');
    } finally {
      setLoading(false);
    }
  };

  const loadRetentionPolicies = async () => {
    try {
      setLoading(true);
      const result = await auditService.getRetentionPolicies();
      setRetentionPolicies(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load retention policies');
    } finally {
      setLoading(false);
    }
  };

  const createRetentionPolicy = async (policy: Partial<AuditRetentionPolicy>) => {
    try {
      setLoading(true);
      const result = await auditService.createRetentionPolicy(policy);
      setRetentionPolicies((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create retention policy');
    } finally {
      setLoading(false);
    }
  };

  const updateRetentionPolicy = async (
    id: string,
    policy: Partial<AuditRetentionPolicy>
  ) => {
    try {
      setLoading(true);
      const result = await auditService.updateRetentionPolicy(id, policy);
      setRetentionPolicies((prev) =>
        prev.map((p) => (p.id === id ? result : p))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update retention policy');
    } finally {
      setLoading(false);
    }
  };

  const deleteRetentionPolicy = async (id: string) => {
    try {
      setLoading(true);
      await auditService.deleteRetentionPolicy(id);
      setRetentionPolicies((prev) => prev.filter((p) => p.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete retention policy');
    } finally {
      setLoading(false);
    }
  };

  const searchEvents = async (query: string) => {
    try {
      setLoading(true);
      const result = await auditService.searchAuditEvents(query);
      setEvents(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search audit events');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (filters: AuditFilter, format: 'PDF' | 'EXCEL') => {
    try {
      setLoading(true);
      const result = await auditService.generateReport(filters, format);
      setError(null);
      return result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const archiveEvents = async (filters: AuditFilter) => {
    try {
      setLoading(true);
      const result = await auditService.archiveEvents(filters);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive events');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getArchiveStatus = async (jobId: string) => {
    try {
      setLoading(true);
      const result = await auditService.getArchiveStatus(jobId);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get archive status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restoreFromArchive = async (archiveId: string, filters?: AuditFilter) => {
    try {
      setLoading(true);
      const result = await auditService.restoreFromArchive(archiveId, filters);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore from archive');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadStats();
    loadRetentionPolicies();
  }, []);

  return {
    events,
    loadEvents,
    getEvent,
    trails,
    loadTrails,
    getTrail,
    getEntityTrail,
    stats,
    loadStats,
    exports,
    createExport,
    deleteExport,
    retentionPolicies,
    loadRetentionPolicies,
    createRetentionPolicy,
    updateRetentionPolicy,
    deleteRetentionPolicy,
    searchEvents,
    generateReport,
    archiveEvents,
    getArchiveStatus,
    restoreFromArchive,
    loading,
    error,
  };
}; 