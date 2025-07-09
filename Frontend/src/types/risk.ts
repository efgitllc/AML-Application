export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'OPERATIONAL' | 'FINANCIAL' | 'COMPLIANCE' | 'STRATEGIC' | 'REPUTATIONAL';
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  likelihood: 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';
  status: 'IDENTIFIED' | 'ASSESSED' | 'TREATED' | 'MONITORED' | 'CLOSED';
  owner: {
    id: string;
    name: string;
    role: string;
  };
  dateIdentified: string;
  lastReviewDate: string;
  nextReviewDate: string;
  controls: RiskControl[];
  treatments: RiskTreatment[];
  assessments: RiskAssessment[];
  metrics: RiskMetrics;
  tags: string[];
}

export interface RiskControl {
  id: string;
  name: string;
  type: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE';
  description: string;
  effectiveness: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';
  implementationDate: string;
  lastTestDate?: string;
  nextTestDate?: string;
  testResults?: {
    date: string;
    outcome: 'PASS' | 'FAIL' | 'PARTIAL';
    findings: string;
  }[];
}

export interface RiskTreatment {
  id: string;
  strategy: 'AVOID' | 'REDUCE' | 'TRANSFER' | 'ACCEPT';
  description: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  owner: {
    id: string;
    name: string;
  };
  startDate: string;
  dueDate: string;
  completionDate?: string;
  cost?: number;
  progress: number;
  actions: {
    id: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate: string;
  }[];
}

export interface RiskAssessment {
  id: string;
  date: string;
  assessor: {
    id: string;
    name: string;
  };
  inherentRisk: {
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';
    rating: number;
  };
  residualRisk: {
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';
    rating: number;
  };
  methodology: string;
  assumptions: string[];
  findings: string[];
  recommendations: string[];
}

export interface RiskMetrics {
  riskScore: number;
  trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
  controlEffectiveness: number;
  treatmentProgress: number;
  lastIncidentDate?: string;
  incidentCount: number;
  complianceStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  keyIndicators: {
    name: string;
    value: number;
    threshold: number;
    status: 'WITHIN_LIMITS' | 'NEAR_THRESHOLD' | 'EXCEEDED';
  }[];
}

export interface RiskDashboardStats {
  totalRisks: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byImpact: Record<string, number>;
  byLikelihood: Record<string, number>;
  topRisks: Risk[];
  riskTrends: {
    date: string;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
  }[];
  controlStats: {
    total: number;
    active: number;
    inactive: number;
    effectiveness: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

export interface RiskFilter {
  category?: string[];
  impact?: string[];
  likelihood?: string[];
  status?: string[];
  owner?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
} 