import { api } from './api';
import type {
  AuditEvent,
  AuditTrail,
  AuditFilter,
  AuditStats,
  AuditExport,
  AuditRetentionPolicy,
} from '../types/audit';

class AuditService {
  private readonly BASE_PATH = '/api/audit';

  // Audit Events
  async getEvents(filters?: AuditFilter): Promise<AuditEvent[]> {
    const response = await api.get<AuditEvent[]>(`${this.BASE_PATH}/events`, {
      params: filters,
    });
    return response.data;
  }

  async getEvent(id: string): Promise<AuditEvent> {
    const response = await api.get<AuditEvent>(`${this.BASE_PATH}/events/${id}`);
    return response.data;
  }

  // Audit Trails
  async getTrails(filters?: AuditFilter): Promise<AuditTrail[]> {
    const response = await api.get<AuditTrail[]>(`${this.BASE_PATH}/trails`, {
      params: filters,
    });
    return response.data;
  }

  async getTrail(id: string): Promise<AuditTrail> {
    const response = await api.get<AuditTrail>(`${this.BASE_PATH}/trails/${id}`);
    return response.data;
  }

  async getEntityTrail(entityType: string, entityId: string): Promise<AuditTrail> {
    const response = await api.get<AuditTrail>(
      `${this.BASE_PATH}/trails/entity/${entityType}/${entityId}`
    );
    return response.data;
  }

  // Stats
  async getStats(timeframe?: string): Promise<AuditStats> {
    const response = await api.get<AuditStats>(`${this.BASE_PATH}/stats`, {
      params: { timeframe },
    });
    return response.data;
  }

  // Exports
  async createExport(filters: AuditFilter, format: 'CSV' | 'PDF' | 'JSON'): Promise<AuditExport> {
    const response = await api.post<AuditExport>(`${this.BASE_PATH}/exports`, {
      filters,
      format,
    });
    return response.data;
  }

  async getExport(id: string): Promise<AuditExport> {
    const response = await api.get<AuditExport>(`${this.BASE_PATH}/exports/${id}`);
    return response.data;
  }

  async listExports(): Promise<AuditExport[]> {
    const response = await api.get<AuditExport[]>(`${this.BASE_PATH}/exports`);
    return response.data;
  }

  async deleteExport(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/exports/${id}`);
  }

  // Retention Policies
  async getRetentionPolicies(): Promise<AuditRetentionPolicy[]> {
    const response = await api.get<AuditRetentionPolicy[]>(
      `${this.BASE_PATH}/retention-policies`
    );
    return response.data;
  }

  async createRetentionPolicy(
    policy: Partial<AuditRetentionPolicy>
  ): Promise<AuditRetentionPolicy> {
    const response = await api.post<AuditRetentionPolicy>(
      `${this.BASE_PATH}/retention-policies`,
      policy
    );
    return response.data;
  }

  async updateRetentionPolicy(
    id: string,
    policy: Partial<AuditRetentionPolicy>
  ): Promise<AuditRetentionPolicy> {
    const response = await api.put<AuditRetentionPolicy>(
      `${this.BASE_PATH}/retention-policies/${id}`,
      policy
    );
    return response.data;
  }

  async deleteRetentionPolicy(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/retention-policies/${id}`);
  }

  // Search
  async searchAuditEvents(query: string): Promise<AuditEvent[]> {
    const response = await api.get<AuditEvent[]>(`${this.BASE_PATH}/search`, {
      params: { q: query },
    });
    return response.data;
  }

  // Reports
  async generateReport(
    filters: AuditFilter,
    format: 'PDF' | 'EXCEL'
  ): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>(`${this.BASE_PATH}/reports`, {
      filters,
      format,
    });
    return response.data;
  }

  // Archive Management
  async archiveEvents(filters: AuditFilter): Promise<{
    jobId: string;
    status: string;
  }> {
    const response = await api.post<{ jobId: string; status: string }>(
      `${this.BASE_PATH}/archive`,
      filters
    );
    return response.data;
  }

  async getArchiveStatus(jobId: string): Promise<{
    jobId: string;
    status: string;
    progress: number;
    error?: string;
  }> {
    const response = await api.get<{
      jobId: string;
      status: string;
      progress: number;
      error?: string;
    }>(`${this.BASE_PATH}/archive/${jobId}`);
    return response.data;
  }

  async restoreFromArchive(
    archiveId: string,
    filters?: AuditFilter
  ): Promise<{
    jobId: string;
    status: string;
  }> {
    const response = await api.post<{ jobId: string; status: string }>(
      `${this.BASE_PATH}/archive/${archiveId}/restore`,
      { filters }
    );
    return response.data;
  }
}

export const auditService = new AuditService(); 