import type { ApiResponse, DashboardStats, ChartData, MetricsData } from '../types';
import { apiService } from './api';

interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  type?: string;
  groupBy?: string;
  customerId?: string;
}

interface ReportConfig {
  type: string;
  format: 'pdf' | 'excel' | 'csv';
  filters?: Record<string, any>;
  includeCharts?: boolean;
}

class AnalyticsService {
  private readonly BASE_PATH = '/analytics';
  private readonly REPORTS_PATH = '/reports';

  // Dashboard Analytics
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiService.get<DashboardStats>(`${this.BASE_PATH}/dashboard`);
  }

  async getTransactionTrends(filters: AnalyticsFilters): Promise<ApiResponse<ChartData>> {
    return apiService.get<ChartData>(`${this.BASE_PATH}/transactions/trends`, { params: filters });
  }

  async getAlertDistribution(filters: AnalyticsFilters): Promise<ApiResponse<ChartData>> {
    return apiService.get<ChartData>(`${this.BASE_PATH}/alerts/distribution`, { params: filters });
  }

  async getRiskScoreDistribution(filters: AnalyticsFilters): Promise<ApiResponse<ChartData>> {
    return apiService.get<ChartData>(`${this.BASE_PATH}/risk-scores/distribution`, { params: filters });
  }

  // Customer Analytics
  async getCustomerSegmentation(): Promise<ApiResponse<{
    segments: Array<{
      name: string;
      count: number;
      riskProfile: string;
      averageTransactionValue: number;
    }>;
  }>> {
    return apiService.get<{
      segments: Array<{
        name: string;
        count: number;
        riskProfile: string;
        averageTransactionValue: number;
      }>;
    }>(`${this.BASE_PATH}/customers/segmentation`);
  }

  async getCustomerActivity(customerId: string, filters: AnalyticsFilters): Promise<ApiResponse<{
    transactions: ChartData;
    alerts: ChartData;
    riskScores: ChartData;
  }>> {
    return apiService.get<{
      transactions: ChartData;
      alerts: ChartData;
      riskScores: ChartData;
    }>(`${this.BASE_PATH}/customers/${customerId}/activity`, { params: filters });
  }

  // Transaction Analytics
  async getTransactionPatterns(filters: AnalyticsFilters): Promise<ApiResponse<{
    patterns: Array<{
      type: string;
      frequency: number;
      riskLevel: string;
      description: string;
    }>;
    chart: ChartData;
  }>> {
    return apiService.get<{
      patterns: Array<{
        type: string;
        frequency: number;
        riskLevel: string;
        description: string;
      }>;
      chart: ChartData;
    }>(`${this.BASE_PATH}/transactions/patterns`, { params: filters });
  }

  // Alert Analytics
  async getAlertMetrics(filters: AnalyticsFilters): Promise<ApiResponse<{
    totalAlerts: number;
    averageResolutionTime: number;
    resolutionByType: Record<string, number>;
    trendChart: ChartData;
  }>> {
    return apiService.get<{
      totalAlerts: number;
      averageResolutionTime: number;
      resolutionByType: Record<string, number>;
      trendChart: ChartData;
    }>(`${this.BASE_PATH}/alerts/metrics`, { params: filters });
  }

  // Case Analytics
  async getCaseMetrics(filters: AnalyticsFilters): Promise<ApiResponse<{
    totalCases: number;
    averageResolutionTime: number;
    casesByStatus: Record<string, number>;
    casesByType: Record<string, number>;
    trendChart: ChartData;
  }>> {
    return apiService.get<{
      totalCases: number;
      averageResolutionTime: number;
      casesByStatus: Record<string, number>;
      casesByType: Record<string, number>;
      trendChart: ChartData;
    }>(`${this.BASE_PATH}/cases/metrics`, { params: filters });
  }

  // Reporting
  async generateReport(config: ReportConfig): Promise<ApiResponse<{
    id: string;
    status: string;
    downloadUrl?: string;
  }>> {
    return apiService.post<{
      id: string;
      status: string;
      downloadUrl?: string;
    }>(`${this.REPORTS_PATH}/generate`, config);
  }

  async getReportStatus(id: string): Promise<ApiResponse<{
    id: string;
    status: string;
    progress: number;
    downloadUrl?: string;
    error?: string;
  }>> {
    return apiService.get<{
      id: string;
      status: string;
      progress: number;
      downloadUrl?: string;
      error?: string;
    }>(`${this.REPORTS_PATH}/${id}/status`);
  }

  async getScheduledReports(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: string;
    schedule: string;
    lastRun?: string;
    nextRun?: string;
    status: string;
  }>>> {
    return apiService.get<Array<{
      id: string;
      name: string;
      type: string;
      schedule: string;
      lastRun?: string;
      nextRun?: string;
      status: string;
    }>>(`${this.REPORTS_PATH}/scheduled`);
  }

  async scheduleReport(config: ReportConfig & {
    name: string;
    schedule: string;
    recipients: string[];
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    schedule: string;
    nextRun: string;
  }>> {
    return apiService.post<{
      id: string;
      name: string;
      schedule: string;
      nextRun: string;
    }>(`${this.REPORTS_PATH}/schedule`, config);
  }

  async deleteScheduledReport(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.REPORTS_PATH}/scheduled/${id}`);
  }

  async getMetrics(): Promise<MetricsData> {
    const { data } = await apiService.get<MetricsData>(`${this.BASE_PATH}/metrics`);
    return data;
  }
}

export const analyticsService = new AnalyticsService(); 