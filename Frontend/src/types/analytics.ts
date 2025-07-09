export interface MetricCard {
  id: number;
  title: string;
  value: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  color: 'primary' | 'high' | 'medium' | 'low';
}

export interface TransactionVolume {
  date: string;
  value: number;
}

export interface RiskDistribution {
  name: string;
  value: number;
}

export interface RiskTrend {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

export interface AlertsByType {
  [key: string]: number;
}

export interface AnalyticsMetrics {
  alertsByType: AlertsByType;
  riskTrends: RiskTrend[];
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
}

export interface DashboardStats {
  transactionVolume: TransactionVolume[];
  riskDistribution: RiskDistribution[];
}

export interface Report {
  id: number;
  title: string;
  type: 'Compliance' | 'Risk' | 'SAR' | 'KYC';
  date: string;
  status: 'Completed' | 'In Progress' | 'Under Review';
  downloadUrl: string;
}

export interface ReportCategory {
  id: number;
  name: string;
  count: number;
  description: string;
}

export interface ReportsData {
  recentReports: Report[];
  reportCategories: ReportCategory[];
} 