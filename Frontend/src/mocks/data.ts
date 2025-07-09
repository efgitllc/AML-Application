import { faker } from '@faker-js/faker';
import type {
  User,
  Customer,
  Transaction,
  Alert,
  Case,
  Document,
  RiskAssessment,
  RiskFactor,
  ComplianceCheck,
  ScreeningResult,
  Report,
  DFSAReport,
  EmiratesIDVerification,
  SystemHealth,
  MetricCard,
  DashboardStats,
  ReportsData
} from '../types';
import type { AnalyticsData } from '../types/analytics';

// Generate mock users
export const mockUsers: User[] = [
  {
    id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    department: 'Compliance'
  },
  {
    id: 'user2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'analyst',
    department: 'Risk'
  },
  {
    id: 'user3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    role: 'investigator',
    department: 'AML'
  }
];

// Generate mock documents
export const mockDocuments: Document[] = Array.from({ length: 50 }, (): Document => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement(['passport', 'id_card', 'driving_license', 'utility_bill']),
  name: faker.system.fileName(),
  status: faker.helpers.arrayElement(['valid', 'invalid', 'expired']),
  expiryDate: faker.date.future().toISOString(),
  verificationStatus: faker.helpers.arrayElement(['verified', 'pending', 'failed'])
}));

// Generate mock customers
export const mockCustomers: Customer[] = [
  {
    id: 'cust1',
    firstName: 'Alice',
    lastName: 'Brown',
    email: 'alice.brown@email.com',
    riskLevel: 'high',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'cust2',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob.wilson@email.com',
    riskLevel: 'medium',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z'
  }
];

// Generate mock transactions
export const mockTransactions: Transaction[] = Array.from({ length: 200 }, (): Transaction => ({
  id: faker.string.uuid(),
  amount: faker.number.int({ min: 100, max: 1000000 }),
  currency: faker.helpers.arrayElement(['AED', 'USD', 'EUR', 'GBP']),
  type: faker.helpers.arrayElement(['transfer', 'deposit', 'withdrawal', 'exchange']),
  date: faker.date.recent().toISOString(),
  status: faker.helpers.arrayElement(['completed', 'pending', 'failed', 'suspicious']),
  riskScore: faker.number.int({ min: 0, max: 100 }),
  sender: faker.person.fullName(),
  receiver: faker.person.fullName()
}));

// Generate mock alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert1',
    title: 'Suspicious Transaction Pattern Detected',
    description: 'Multiple high-value transactions in short succession from different locations',
    severity: 'critical',
    type: 'suspicious_transaction',
    status: 'open',
    customer: 'cust1',
    timestamp: '2024-01-20T10:30:00Z',
    assignedTo: 'user2'
  },
  {
    id: 'alert2',
    title: 'KYC Documentation Expired',
    description: 'Customer identification documents require immediate renewal',
    severity: 'high',
    type: 'kyc_alert',
    status: 'in_progress',
    customer: 'cust2',
    timestamp: '2024-01-19T15:45:00Z',
    assignedTo: 'user3'
  },
  {
    id: 'alert3',
    title: 'Compliance Policy Violation',
    description: 'Transaction exceeds permitted daily limit for customer risk category',
    severity: 'medium',
    type: 'compliance_violation',
    status: 'under_review',
    customer: 'cust1',
    timestamp: '2024-01-18T09:15:00Z'
  },
  {
    id: 'alert4',
    title: 'Watchlist Match Found',
    description: 'Potential match found in recent sanctions list update',
    severity: 'critical',
    type: 'watchlist_match',
    status: 'open',
    customer: 'cust2',
    timestamp: '2024-01-20T11:00:00Z'
  }
];

// Generate mock cases
export const mockCases: Case[] = [
  {
    id: 'case1',
    caseNumber: 'AML-2024-001',
    title: 'High-Value Transaction Investigation',
    description: 'Investigation into a series of high-value transactions that may indicate potential money laundering activity.',
    caseType: 'aml_investigation',
    status: 'open',
    priority: 'high',
    customerId: 'cust1',
    assignedTo: { id: 'user2' },
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    dueDate: '2024-02-15T00:00:00Z',
    notes: [
      {
        id: 'note1',
        content: 'Initial review completed. Multiple transactions above reporting threshold identified.',
        createdBy: 'user2',
        createdAt: '2024-01-15T09:00:00Z'
      }
    ],
    documents: [
      {
        id: 'doc1',
        name: 'Transaction Report.pdf',
        type: 'application/pdf',
        uploadedBy: 'user2',
        uploadedAt: '2024-01-15T09:30:00Z'
      }
    ]
  },
  {
    id: 'case2',
    caseNumber: 'AML-2024-002',
    title: 'Suspicious Pattern Detection',
    description: 'Multiple small transactions showing potential structuring pattern.',
    caseType: 'suspicious_activity',
    status: 'investigating',
    priority: 'critical',
    customerId: 'cust2',
    assignedTo: { id: 'user3' },
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
    dueDate: '2024-02-16T00:00:00Z',
    notes: [
      {
        id: 'note2',
        content: 'Pattern analysis reveals potential structuring attempt. Further investigation needed.',
        createdBy: 'user3',
        createdAt: '2024-01-16T11:00:00Z'
      }
    ]
  },
  {
    id: 'case3',
    caseNumber: 'AML-2024-003',
    title: 'Compliance Policy Review',
    description: 'Regular review of high-risk customer account activity.',
    caseType: 'compliance_review',
    status: 'pending_review',
    priority: 'medium',
    customerId: 'cust1',
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-20T14:15:00Z',
    dueDate: '2024-02-17T00:00:00Z'
  },
  {
    id: 'case4',
    caseNumber: 'AML-2024-004',
    title: 'Regulatory Inquiry Response',
    description: 'Preparing response to regulatory inquiry regarding transaction monitoring procedures.',
    caseType: 'regulatory_inquiry',
    status: 'open',
    priority: 'high',
    customerId: 'cust2',
    assignedTo: { id: 'user1' },
    createdAt: '2024-01-18T11:30:00Z',
    updatedAt: '2024-01-20T17:00:00Z',
    dueDate: '2024-02-18T00:00:00Z'
  }
];

// Generate mock risk factors
export const mockRiskFactors: RiskFactor[] = Array.from({ length: 10 }, (): RiskFactor => ({
  name: faker.lorem.words(2),
  score: faker.number.int({ min: 0, max: 100 }),
  weight: faker.number.float({ min: 0.1, max: 1, fractionDigits: 2 }),
  description: faker.lorem.sentence()
}));

// Generate mock risk assessments
export const mockRiskAssessments: RiskAssessment[] = Array.from({ length: 40 }, (): RiskAssessment => ({
  id: faker.string.uuid(),
  entityId: faker.string.uuid(),
  entityType: faker.helpers.arrayElement(['customer', 'transaction']),
  score: faker.number.int({ min: 0, max: 100 }),
  factors: faker.helpers.arrayElements(mockRiskFactors, { min: 3, max: 7 }),
  lastUpdated: faker.date.recent().toISOString()
}));

// Generate mock compliance checks
export const mockComplianceChecks: ComplianceCheck[] = Array.from({ length: 25 }, (): ComplianceCheck => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement(['kyc', 'aml', 'sanctions', 'pep']),
  status: faker.helpers.arrayElement(['passed', 'failed', 'pending']),
  findings: Array.from({ length: faker.number.int({ min: 0, max: 4 }) }, () => faker.lorem.sentence()),
  date: faker.date.recent().toISOString()
}));

// Generate mock screening results
export const mockScreeningResults: ScreeningResult[] = Array.from({ length: 35 }, (): ScreeningResult => ({
  id: faker.string.uuid(),
  entityId: faker.string.uuid(),
  matchType: faker.helpers.arrayElement(['exact', 'partial', 'fuzzy']),
  score: faker.number.float({ min: 0, max: 100, multipleOf: 0.01 }),
  source: faker.helpers.arrayElement(['worldcheck', 'dow_jones', 'lexis_nexis', 'refinitiv']),
  details: faker.lorem.paragraph()
}));

// Generate mock reports
export const mockReports: Report[] = Array.from({ length: 15 }, (): Report => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement(['monthly', 'quarterly', 'annual', 'ad_hoc']),
  status: faker.helpers.arrayElement(['draft', 'pending', 'approved', 'submitted']),
  generatedAt: faker.date.recent().toISOString(),
  data: {
    summary: faker.lorem.paragraph(),
    findings: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => faker.lorem.sentence()),
    recommendations: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.lorem.sentence())
  }
}));

// Generate mock DFSA reports
export const mockDFSAReports: DFSAReport[] = Array.from({ length: 10 }, (): DFSAReport => ({
  id: faker.string.uuid(),
  period: `Q${faker.number.int({ min: 1, max: 4 })} ${faker.date.past().getFullYear()}`,
  status: faker.helpers.arrayElement(['draft', 'submitted', 'accepted', 'rejected']),
  submissions: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
    date: faker.date.recent().toISOString(),
    type: faker.helpers.arrayElement(['aml_return', 'sar_stats', 'risk_assessment']),
    status: faker.helpers.arrayElement(['pending', 'accepted', 'rejected'])
  }))
}));

// Generate mock Emirates ID verifications
export const mockEmiratesIDVerifications: EmiratesIDVerification[] = Array.from({ length: 20 }, (): EmiratesIDVerification => ({
  id: faker.string.uuid(),
  status: faker.helpers.arrayElement(['verified', 'failed', 'pending']),
  verificationDate: faker.date.recent().toISOString(),
  details: {
    idNumber: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
    name: faker.person.fullName(),
    nationality: faker.location.country(),
    expiryDate: faker.date.future().toISOString()
  }
}));

// Generate mock system health
export const mockSystemHealth: SystemHealth = {
  status: faker.helpers.arrayElement(['healthy', 'warning', 'error']),
  components: {
    database: {
      status: faker.helpers.arrayElement(['operational', 'degraded', 'down']),
      message: faker.lorem.sentence()
    },
    api: {
      status: faker.helpers.arrayElement(['operational', 'degraded', 'down']),
      message: faker.lorem.sentence()
    },
    screening: {
      status: faker.helpers.arrayElement(['operational', 'degraded', 'down']),
      message: faker.lorem.sentence()
    },
    monitoring: {
      status: faker.helpers.arrayElement(['operational', 'degraded', 'down']),
      message: faker.lorem.sentence()
    }
  }
};

// Mock data for analytics dashboard
export const mockMetricCards: MetricCard[] = [
  {
    id: 1,
    title: 'Total Transactions',
    value: '$2.4M',
    change: 12.5,
    changeType: 'increase',
    color: 'primary'
  },
  {
    id: 2,
    title: 'High Risk Alerts',
    value: '156',
    change: -8.2,
    changeType: 'decrease',
    color: 'high'
  },
  {
    id: 3,
    title: 'Active Customers',
    value: '2,845',
    change: 5.1,
    changeType: 'increase',
    color: 'low'
  },
  {
    id: 4,
    title: 'Compliance Score',
    value: '94%',
    change: 2.3,
    changeType: 'increase',
    color: 'medium'
  }
];

export const mockDashboardStats: DashboardStats = {
  transactionVolume: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    value: Math.floor(Math.random() * 100000) + 50000
  })),
  riskDistribution: [
    { name: 'Low Risk', value: 65 },
    { name: 'Medium Risk', value: 25 },
    { name: 'High Risk', value: 10 }
  ]
};

export const mockAnalyticsData: AnalyticsData = {
  metrics: {
    alertsByType: {
      'Transaction Monitoring': 45,
      'Customer Due Diligence': 32,
      'Sanctions Screening': 28,
      'Adverse Media': 15
    },
    riskTrends: Array.from({ length: 12 }, () => ({
      lowRisk: Math.floor(Math.random() * 100),
      mediumRisk: Math.floor(Math.random() * 60),
      highRisk: Math.floor(Math.random() * 30)
    }))
  }
};

export const mockReportsData: ReportsData = {
  recentReports: [
    {
      id: 1,
      title: 'Monthly Compliance Summary',
      type: 'Compliance',
      date: '2024-03-15',
      status: 'Completed',
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Risk Assessment Report',
      type: 'Risk',
      date: '2024-03-14',
      status: 'In Progress',
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Suspicious Activity Report',
      type: 'SAR',
      date: '2024-03-13',
      status: 'Under Review',
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Customer Due Diligence Report',
      type: 'KYC',
      date: '2024-03-12',
      status: 'Completed',
      downloadUrl: '#'
    }
  ],
  reportCategories: [
    {
      id: 1,
      name: 'Compliance Reports',
      count: 45,
      description: 'Regulatory compliance and audit reports'
    },
    {
      id: 2,
      name: 'Risk Reports',
      count: 32,
      description: 'Risk assessment and monitoring reports'
    },
    {
      id: 3,
      name: 'Transaction Reports',
      count: 28,
      description: 'Transaction monitoring and analysis'
    },
    {
      id: 4,
      name: 'Customer Reports',
      count: 36,
      description: 'Customer due diligence and KYC reports'
    }
  ]
}; 