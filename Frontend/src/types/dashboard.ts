export interface MetricCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface DashboardStats {
  transactionsByType: Array<{
    type: string;
    count: number;
    volume: number;
  }>;
  riskDistribution: Array<{
    date: string;
    high: number;
    medium: number;
    low: number;
  }>;
  alertTypes: Array<{
    type: string;
    value: number;
  }>;
  transactionVolume: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'in_progress' | 'resolved';
  timestamp: string;
  category: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'exchange';
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'suspicious';
  riskScore: number;
  sender: string;
  receiver: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    name: string;
    value: number;
    status: 'healthy' | 'warning' | 'critical';
  }[];
  lastUpdated: string;
} 