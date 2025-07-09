export interface UAECBReport {
  id: string;
  reportType: 'STR' | 'CTR' | 'EFT' | 'KYC' | 'PERIODIC';
  status: 'draft' | 'pending_approval' | 'submitted' | 'accepted' | 'rejected';
  submissionDate?: string;
  reportingPeriod: {
    start: string;
    end: string;
  };
  reportData: {
    totalTransactions: number;
    totalValue: number;
    currency: string;
    reportingEntity: {
      name: string;
      license: string;
      category: string;
    };
  };
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    factors: Array<{
      category: string;
      score: number;
      weight: number;
    }>;
  };
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    type: string;
    parties: {
      originator: {
        name: string;
        accountNumber: string;
        idType: string;
        idNumber: string;
      };
      beneficiary: {
        name: string;
        accountNumber: string;
        bankName: string;
        swiftCode: string;
      };
    };
    suspiciousActivityIndicators?: string[];
  }>;
  goAMLReference?: string;
  comments: Array<{
    id: string;
    author: string;
    date: string;
    content: string;
    type: 'internal' | 'regulatory';
  }>;
}

export interface UAECBMetrics {
  strCount: number;
  ctrCount: number;
  totalTransactionValue: number;
  highRiskTransactions: number;
  pendingReports: number;
  submittedReports: number;
  rejectedReports: number;
  averageProcessingTime: number;
}

export interface UAECBRequirement {
  id: string;
  title: string;
  description: string;
  category: 'reporting' | 'compliance' | 'technical' | 'operational';
  deadline: string;
  status: 'active' | 'upcoming' | 'completed';
  priority: 'high' | 'medium' | 'low';
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  compliance: {
    status: 'compliant' | 'partial' | 'non_compliant';
    lastChecked: string;
    nextCheck: string;
    findings: string[];
  };
}

export interface UAECBValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
  recommendation?: string;
}

export interface UAECBSubmissionResult {
  success: boolean;
  referenceNumber?: string;
  timestamp: string;
  validationErrors?: UAECBValidationError[];
  acknowledgment?: {
    id: string;
    date: string;
    status: string;
    message: string;
  };
}

export interface GoAMLIntegrationStatus {
  connected: boolean;
  lastSync: string;
  pendingSubmissions: number;
  errors: Array<{
    code: string;
    message: string;
    timestamp: string;
  }>;
} 