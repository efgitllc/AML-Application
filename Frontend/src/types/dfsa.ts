export interface DFSAMetrics {
  totalAssets: number;
  totalLiabilities: number;
  capitalAdequacyRatio: number;
  liquidityRatio: number;
  suspiciousTransactions: number;
  highRiskCustomers: number;
  pendingKycUpdates: number;
  sanctionsScreeningAlerts: number;
}

export interface DFSAComplianceStatus {
  status: 'compliant' | 'non_compliant' | 'pending_review';
  lastAssessment: string;
  nextAssessmentDue: string;
  findings: Array<{
    id: string;
    category: 'critical' | 'major' | 'minor';
    description: string;
    dueDate: string;
    status: 'open' | 'in_progress' | 'closed';
  }>;
}

export interface DFSAReport {
  id: string;
  reportingPeriod: {
    start: string;
    end: string;
  };
  type: 'quarterly' | 'annual' | 'ad_hoc';
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  submissionDate?: string;
  metrics: DFSAMetrics;
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    categories: {
      operationalRisk: number;
      creditRisk: number;
      marketRisk: number;
      complianceRisk: number;
      reputationalRisk: number;
    };
  };
  complianceChecklist: Array<{
    id: string;
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'not_applicable';
    evidence?: string;
    comments?: string;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
  }>;
}

export interface DFSANotification {
  id: string;
  type: 'warning' | 'deadline' | 'update' | 'requirement';
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionRequired: boolean;
  link?: string;
}

export interface DFSARequirement {
  id: string;
  category: 'prudential' | 'conduct' | 'aml_cft' | 'reporting';
  title: string;
  description: string;
  applicability: string[];
  deadline?: string;
  frequency?: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'upcoming' | 'archived';
  lastUpdated: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

export interface DFSASubmissionHistory {
  id: string;
  reportId: string;
  reportType: string;
  submissionDate: string;
  status: 'accepted' | 'rejected' | 'pending';
  reviewer?: string;
  reviewDate?: string;
  comments?: string[];
  version: number;
} 