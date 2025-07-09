import axios from 'axios';
import type {
  DFSAReport,
  DFSAMetrics,
  DFSAComplianceStatus,
  DFSANotification,
  DFSARequirement,
  DFSASubmissionHistory,
} from '../types/dfsa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.aml-system.ae/v1';

export const dfsaService = {
  // Reports
  getDFSAReports: async (filters?: { type?: string; status?: string; period?: string }): Promise<DFSAReport[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/dfsa/reports/`, { params: filters });
    return response.data;
  },

  getDFSAReportById: async (reportId: string): Promise<DFSAReport> => {
    const response = await axios.get(`${API_BASE_URL}/api/dfsa/reports/${reportId}/`);
    return response.data;
  },

  createDFSAReport: async (report: Omit<DFSAReport, 'id'>): Promise<DFSAReport> => {
    const response = await axios.post(`${API_BASE_URL}/api/dfsa/reports/`, report);
    return response.data;
  },

  updateDFSAReport: async (reportId: string, updates: Partial<DFSAReport>): Promise<DFSAReport> => {
    const response = await axios.patch(`${API_BASE_URL}/api/dfsa/reports/${reportId}/`, updates);
    return response.data;
  },

  submitDFSAReport: async (reportId: string): Promise<DFSAReport> => {
    const response = await axios.post(`${API_BASE_URL}/api/dfsa/reports/${reportId}/submit/`);
    return response.data;
  },

  // Metrics
  getDFSAMetrics: async (period: { start: string; end: string }): Promise<DFSAMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/api/dfsa/metrics/`, { params: period });
    return response.data;
  },

  // Compliance Status
  getDFSAComplianceStatus: async (): Promise<DFSAComplianceStatus> => {
    const response = await axios.get(`${API_BASE_URL}/api/dfsa/compliance-status/`);
    return response.data;
  },

  updateFindingStatus: async (findingId: string, status: string): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/api/dfsa/findings/${findingId}/`, { status });
  },

  // Notifications
  getDFSANotifications: async (filters?: { read?: boolean; type?: string }): Promise<DFSANotification[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/dfsa/notifications/`, { params: filters });
    return response.data;
  },

  markNotificationRead: async (notificationId: string): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/api/dfsa/notifications/${notificationId}/read/`);
  },

  // Requirements
  getDFSARequirements: async (filters?: { category?: string; status?: string }): Promise<DFSARequirement[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/dfsa/requirements/`, { params: filters });
    return response.data;
  },

  getDFSARequirementById: async (requirementId: string): Promise<DFSARequirement> => {
    const response = await axios.get(`${API_BASE_URL}/api/dfsa/requirements/${requirementId}/`);
    return response.data;
  },

  // Submission History
  getSubmissionHistory: async (reportId: string): Promise<DFSASubmissionHistory[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/dfsa/reports/${reportId}/history/`);
    return response.data;
  },

  // File Upload
  uploadAttachment: async (reportId: string, file: File): Promise<{ id: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/dfsa/reports/${reportId}/attachments/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteAttachment: async (reportId: string, attachmentId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/dfsa/reports/${reportId}/attachments/${attachmentId}/`);
  },

  // Export
  exportReport: async (reportId: string, format: 'pdf' | 'excel'): Promise<Blob> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/dfsa/reports/${reportId}/export/`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  },
}; 