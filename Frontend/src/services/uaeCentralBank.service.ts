import axios from 'axios';
import type {
  UAECBReport,
  UAECBMetrics,
  UAECBRequirement,
  UAECBSubmissionResult,
  GoAMLIntegrationStatus,
} from '../types/uaeCentralBank';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.aml-system.ae/v1';

export const uaeCentralBankService = {
  // Reports
  getReports: async (filters?: {
    type?: string;
    status?: string;
    period?: { start: string; end: string };
  }): Promise<UAECBReport[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/uaecb/reports/`, { params: filters });
    return response.data;
  },

  getReportById: async (reportId: string): Promise<UAECBReport> => {
    const response = await axios.get(`${API_BASE_URL}/api/uaecb/reports/${reportId}/`);
    return response.data;
  },

  createReport: async (report: Omit<UAECBReport, 'id'>): Promise<UAECBReport> => {
    const response = await axios.post(`${API_BASE_URL}/api/uaecb/reports/`, report);
    return response.data;
  },

  updateReport: async (reportId: string, updates: Partial<UAECBReport>): Promise<UAECBReport> => {
    const response = await axios.patch(`${API_BASE_URL}/api/uaecb/reports/${reportId}/`, updates);
    return response.data;
  },

  submitReport: async (reportId: string): Promise<UAECBSubmissionResult> => {
    const response = await axios.post(`${API_BASE_URL}/api/uaecb/reports/${reportId}/submit/`);
    return response.data;
  },

  validateReport: async (reportId: string): Promise<UAECBSubmissionResult> => {
    const response = await axios.post(`${API_BASE_URL}/api/uaecb/reports/${reportId}/validate/`);
    return response.data;
  },

  // Metrics
  getMetrics: async (period: { start: string; end: string }): Promise<UAECBMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/api/uaecb/metrics/`, { params: period });
    return response.data;
  },

  // Requirements
  getRequirements: async (filters?: {
    category?: string;
    status?: string;
  }): Promise<UAECBRequirement[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/uaecb/requirements/`, { params: filters });
    return response.data;
  },

  // goAML Integration
  getGoAMLStatus: async (): Promise<GoAMLIntegrationStatus> => {
    const response = await axios.get(`${API_BASE_URL}/api/uaecb/goaml/status/`);
    return response.data;
  },

  syncWithGoAML: async (): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/uaecb/goaml/sync/`);
  },

  // File Upload
  uploadAttachment: async (reportId: string, file: File): Promise<{ id: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/uaecb/reports/${reportId}/attachments/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Comments
  addComment: async (
    reportId: string,
    comment: { content: string; type: 'internal' | 'regulatory' }
  ): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/uaecb/reports/${reportId}/comments/`, comment);
  },

  // Export
  exportReport: async (reportId: string, format: 'xml' | 'pdf' | 'excel'): Promise<Blob> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/uaecb/reports/${reportId}/export/`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Batch Operations
  submitBatchReports: async (reportIds: string[]): Promise<UAECBSubmissionResult[]> => {
    const response = await axios.post(`${API_BASE_URL}/api/uaecb/reports/batch-submit/`, {
      reportIds,
    });
    return response.data;
  },

  validateBatchReports: async (reportIds: string[]): Promise<UAECBSubmissionResult[]> => {
    const response = await axios.post(`${API_BASE_URL}/api/uaecb/reports/batch-validate/`, {
      reportIds,
    });
    return response.data;
  },
}; 