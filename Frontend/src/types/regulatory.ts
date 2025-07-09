export type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant';

export interface RiskMetrics {
  kycCompliance: number;
  transactionMonitoring: number;
  regulatoryReporting: number;
  riskAssessment: number;
}

export interface ComplianceTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'kyc' | 'transaction' | 'regulatory' | 'risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'new' | 'in_review' | 'resolved';
  relatedEntity?: {
    id: string;
    type: string;
    name: string;
  };
}

export interface ComplianceStatusData {
  status: ComplianceStatus;
  lastUpdated: string;
  details: {
    kycStatus: ComplianceStatus;
    transactionMonitoringStatus: ComplianceStatus;
    regulatoryReportingStatus: ComplianceStatus;
    riskAssessmentStatus: ComplianceStatus;
  };
}

// UAE/Dubai Specific Types
export interface UAEPassData {
  emiratesId: string;
  fullName: string;
  nationality: string;
  photo: string;
}

export interface DFSAReport {
  id: string;
  reportType: 'quarterly' | 'annual' | 'incident';
  dueDate: string;
  submissionDate?: string;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
  content: {
    period: {
      start: string;
      end: string;
    };
    metrics: {
      totalTransactions: number;
      suspiciousTransactions: number;
      highRiskCustomers: number;
      complianceScore: number;
    };
  };
}

export interface UAECentralBankReport {
  id: string;
  reportType: 'goAML' | 'uaePass' | 'sanctions';
  submissionDate: string;
  status: 'pending' | 'submitted';
  data: Record<string, any>;
}