import axios from 'axios';
import type { 
  ComplianceStatusData, 
  RiskMetrics, 
  ComplianceTask, 
  ComplianceAlert,
  DFSAReport,
  UAECentralBankReport 
} from '../types/regulatory';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.aml-system.ae/v1';

export const regulatoryService = {
  // Compliance Status
  getComplianceStatus: async (): Promise<ComplianceStatusData> => {
    const response = await axios.get(`${API_BASE_URL}/api/regulatory/compliance-status/`);
    return response.data;
  },

  // Risk Metrics
  getRiskMetrics: async (): Promise<RiskMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/api/regulatory/risk-metrics/`);
    return response.data;
  },

  // Compliance Tasks
  getPendingTasks: async (): Promise<ComplianceTask[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/regulatory/tasks/`);
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: ComplianceTask['status']): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/api/regulatory/tasks/${taskId}/`, { status });
  },

  // Compliance Alerts
  getRecentAlerts: async (): Promise<ComplianceAlert[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/regulatory/alerts/`);
    return response.data;
  },

  updateAlertStatus: async (alertId: string, status: ComplianceAlert['status']): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/api/regulatory/alerts/${alertId}/`, { status });
  },

  // DFSA Reporting
  submitDFSAReport: async (report: Omit<DFSAReport, 'id'>): Promise<DFSAReport> => {
    const response = await axios.post(`${API_BASE_URL}/api/regulatory/dfsa-reports/`, report);
    return response.data;
  },

  getDFSAReports: async (): Promise<DFSAReport[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/regulatory/dfsa-reports/`);
    return response.data;
  },

  // UAE Central Bank Reporting
  submitUAECentralBankReport: async (report: Omit<UAECentralBankReport, 'id'>): Promise<UAECentralBankReport> => {
    const response = await axios.post(`${API_BASE_URL}/api/regulatory/uaecb-reports/`, report);
    return response.data;
  },

  getUAECentralBankReports: async (): Promise<UAECentralBankReport[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/regulatory/uaecb-reports/`);
    return response.data;
  },

  // Risk Assessment
  submitRiskAssessment: async (customerId: string, data: any): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/regulatory/risk-assessment/${customerId}/`, data);
  },

  // KYC Verification
  verifyKYC: async (customerId: string, documents: FormData): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/regulatory/kyc-verification/${customerId}/`, documents, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Transaction Monitoring
  getTransactionAlerts: async (filters: any): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/api/regulatory/transaction-alerts/`, {
      params: filters,
    });
    return response.data;
  },

  // Sanctions Screening
  performSanctionsScreening: async (entityData: any): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/api/regulatory/sanctions-screening/`, entityData);
    return response.data;
  },
};