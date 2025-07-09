import type { 
  User, UserRole, Customer, IndividualCustomer, CorporateCustomer, 
  Transaction, TransactionAlert, Case, CaseNote, CaseDocument,
  ScreeningList, PEP, Sanctions, ScreeningResult, 
  DashboardStats, Alert, RiskAssessment, AnalyticsWidget,
  UserActivity, MetricCard, ChartData
} from '../types';

// Mock Users
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@amlsystem.com',
    username: 'john.doe',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1-555-0123',
    department: 'Compliance',
    role: {
      id: '1',
      name: 'AML Analyst',
      description: 'Anti-Money Laundering Analyst',
      permissions: { can_review_alerts: true, can_create_cases: true },
      isActive: true,
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z'
    },
    isActive: true,
    dateJoined: '2023-01-15T08:00:00Z',
    lastLogin: '2024-01-20T10:30:00Z',
    lastLoginIp: '192.168.1.100',
    mfaEnabled: true,
    employeeId: 'EMP001',
    accessLevel: 'analyst',
    twoFactorEnabled: true,
    lastPasswordChange: '2023-12-01T00:00:00Z',
    position: 'Senior AML Analyst',
    failedLoginAttempts: 0,
    accountLockedUntil: undefined
  },
  {
    id: '2',
    email: 'sarah.wilson@amlsystem.com',
    username: 'sarah.wilson',
    firstName: 'Sarah',
    lastName: 'Wilson',
    phoneNumber: '+1-555-0124',
    department: 'Compliance',
    role: {
      id: '2',
      name: 'Compliance Manager',
      description: 'Compliance Department Manager',
      permissions: { can_approve_cases: true, can_assign_cases: true, can_review_alerts: true },
      isActive: true,
      createdAt: '2023-01-10T08:00:00Z',
      updatedAt: '2023-01-10T08:00:00Z'
    },
    isActive: true,
    dateJoined: '2023-01-10T08:00:00Z',
    lastLogin: '2024-01-20T09:15:00Z',
    mfaEnabled: true,
    employeeId: 'EMP002',
    accessLevel: 'manager',
    twoFactorEnabled: true,
    lastPasswordChange: '2023-11-15T00:00:00Z',
    position: 'Compliance Manager',
    failedLoginAttempts: 0
  }
];

// Mock User Activities
const mockUserActivities: UserActivity[] = [
  {
    id: '1',
    user: mockUsers[0],
    activityType: 'view',
    action: 'View Customer Profile',
    description: 'Viewed customer profile for CUST001',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: { customerAId: 'CUST001' },
    details: { pageUrl: '/customers/CUST001' },
    createdAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    user: mockUsers[1],
    activityType: 'create',
    action: 'Create Case',
    description: 'Created new case CASE001 for suspicious activity',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: { caseId: 'CASE001' },
    details: { caseType: 'transaction' },
    createdAt: '2024-01-20T11:00:00Z'
  }
];

// Mock Customers
const mockCustomers: Customer[] = [
  {
    id: '1',
    customerId: 'CUST001',
    customerType: 'individual',
    riskLevel: 'medium',
    status: 'active',
    createdBy: mockUsers[0],
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lastReviewDate: '2023-12-15T10:00:00Z',
    nextReviewDate: '2024-06-15T10:00:00Z',
    reviewFrequencyMonths: 6,
    isActive: true,
    metadata: { sourceChannel: 'online', kycCompleted: true }
  },
  {
    id: '2',
    customerId: 'CUST002',
    customerType: 'corporate',
    riskLevel: 'high',
    status: 'active',
    createdBy: mockUsers[1],
    createdAt: '2023-08-20T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    lastReviewDate: '2024-01-10T14:30:00Z',
    nextReviewDate: '2024-04-10T14:30:00Z',
    reviewFrequencyMonths: 3,
    isActive: true,
    metadata: { sourceChannel: 'branch', enhancedDueDiligence: true }
  }
];

// Mock Individual Customers
const mockIndividualCustomers: IndividualCustomer[] = [
  {
    id: '1',
    customer: mockCustomers[0],
    firstName: 'Alice',
    lastName: 'Johnson',
    dateOfBirth: '1985-03-15',
    gender: 'F',
    nationality: 'USA',
    idType: 'Passport',
    idNumber: 'P123456789',
    idExpiryDate: '2028-03-15',
    address: '123 Main St, New York, NY 10001',
    phoneNumber: '+1-555-0101',
    email: 'alice.johnson@email.com',
    occupation: 'Software Engineer',
    employer: 'Tech Corp Inc.',
    sourceOfWealth: 'Employment Income',
    expectedTransactionVolume: 50000,
    expectedTransactionFrequency: 'Monthly',
    maritalStatus: 'married',
    taxId: 'SSN123456789',
    metadata: { preferredContactMethod: 'email' }
  }
];

// Mock Corporate Customers
const mockCorporateCustomers: CorporateCustomer[] = [
  {
    id: '1',
    customer: mockCustomers[1],
    name: 'Global Trading Ltd.',
    businessType: 'corporation',
    registrationNumber: 'REG123456',
    taxId: 'TAX987654321',
    countryOfIncorporation: 'USA',
    dateOfIncorporation: '2015-01-20',
    registrationAddress: '456 Business Ave, New York, NY 10002',
    businessAddress: '456 Business Ave, New York, NY 10002',
    phoneNumber: '+1-555-0200',
    email: 'info@globaltrading.com',
    website: 'https://www.globaltrading.com',
    status: 'active',
    annualRevenue: 10000000,
    numberOfEmployees: 150,
    industry: 'International Trade',
    metadata: { publiclyListed: false }
  }
];

// Mock Transactions
const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'TXN001',
    customer: mockCustomers[0],
    transactionType: 'transfer',
    direction: 'outgoing',
    amount: 15000,
    currency: 'USD',
    status: 'completed',
    transactionDate: '2024-01-20T14:30:00Z',
    valueDate: '2024-01-20T14:30:00Z',
    description: 'Wire transfer to business partner',
    sourceAccount: 'ACC001',
    destinationAccount: 'ACC002',
    paymentMethod: 'wire_transfer',
    paymentReference: 'REF001',
    riskScore: 25,
    location: 'New York, NY',
    ipAddress: '192.168.1.100',
    deviceInfo: { browser: 'Chrome', os: 'Windows' },
    metadata: { channel: 'online_banking' }
  },
  {
    id: '2',
    transactionId: 'TXN002',
    customer: mockCustomers[1],
    transactionType: 'deposit',
    direction: 'incoming',
    amount: 250000,
    currency: 'USD',
    status: 'completed',
    transactionDate: '2024-01-19T10:15:00Z',
    valueDate: '2024-01-19T10:15:00Z',
    description: 'Large cash deposit',
    sourceAccount: 'CASH',
    destinationAccount: 'ACC003',
    paymentMethod: 'cash',
    riskScore: 85,
    location: 'Miami, FL',
    metadata: { branch_id: 'BR001', teller_id: 'T001' }
  }
];

// Mock Transaction Alerts
const mockTransactionAlerts: TransactionAlert[] = [
  {
    id: '1',
    transaction: mockTransactions[1],
    alertType: 'threshold',
    severity: 'high',
    status: 'new',
    description: 'Transaction amount exceeds daily cash deposit threshold',
    ruleTriggered: 'Large Cash Deposit Rule',
    assignedTo: mockUsers[0],
    createdAt: '2024-01-19T10:16:00Z',
    metadata: { rule_id: 'RULE001', auto_generated: true, threshold: 50000, actualValue: 250000 }
  }
];

// Mock Cases
const mockCases: Case[] = [
  {
    id: '1',
    caseNumber: 'CASE001',
    title: 'Suspicious Large Cash Deposits',
    description: 'Investigation into multiple large cash deposits by corporate customer',
    caseType: 'transaction',
    priority: 'high',
    status: 'in_progress',
    customer: mockCustomers[1],
    assignedTo: mockUsers[0],
    assignedBy: mockUsers[1],
    dueDate: '2024-01-26T17:00:00Z',
    isConfidential: false,
    requiresApproval: false,
    slaBreached: false,
    metadata: { source: 'automated_alert', complexity: 'high' },
    createdAt: '2024-01-19T11:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z'
  }
];

// Mock Case Notes
const mockCaseNotes: CaseNote[] = [
  {
    id: '1',
    case: mockCases[0],
    noteType: 'investigation',
    content: 'Initial review of transaction patterns shows unusual cash deposit frequency',
    isInternal: true,
    isConfidential: false,
    requiresAcknowledgment: false,
    createdAt: '2024-01-19T14:30:00Z',
    createdBy: mockUsers[0],
    metadata: { investigation_phase: 'initial_review' }
  }
];

// Mock Screening Lists
const mockScreeningLists: ScreeningList[] = [
  {
    id: '1',
    name: 'OFAC Sanctions List',
    listType: 'sanctions',
    source: 'OFAC',
    isActive: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-15T00:00:00Z',
    supportedLanguages: [],
    multilingualEnabled: false,
    metadata: { update_frequency: 'daily', source_url: 'https://ofac.treasury.gov', entryCount: 15000 }
  },
  {
    id: '2',
    name: 'PEP Database',
    listType: 'pep',
    source: 'World-Check',
    isActive: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-10T00:00:00Z',
    supportedLanguages: [],
    multilingualEnabled: true,
    metadata: { update_frequency: 'weekly', coverage: 'global', entryCount: 50000 }
  }
];

// Mock PEPs
const mockPEPs: PEP[] = [
  {
    id: '1',
    name: 'PEP Database',
    listType: 'pep',
    source: 'World-Check',
    isActive: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-10T00:00:00Z',
    supportedLanguages: [],
    multilingualEnabled: true,
    metadata: { update_frequency: 'weekly', coverage: 'global', entryCount: 50000 },
    position: 'Minister of Finance',
    positionType: 'minister',
    country: 'Example Country',
    startDate: '2020-01-01',
    endDate: '2024-12-31',
    riskLevel: 'high',
    familyMembers: [{ name: 'Jane Political', relationship: 'spouse' }],
    associates: [{ name: 'Deputy Minister', relationship: 'colleague' }]
  }
];

// Mock Sanctions
const mockSanctions: Sanctions[] = [
  {
    id: '1',
    name: 'OFAC Sanctions List',
    listType: 'sanctions',
    source: 'OFAC',
    isActive: true,
    effectiveDate: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-15T00:00:00Z',
    supportedLanguages: [],
    multilingualEnabled: false,
    metadata: { update_frequency: 'daily', source_url: 'https://ofac.treasury.gov', entryCount: 15000 },
    sanctionType: 'entity',
    issuingAuthority: 'US Treasury OFAC',
    sanctionDetails: { 
      reason: 'Money laundering activities',
      program: 'counter_terrorism',
      severity: 'blocking',
      aliases: ['SEC Corp', 'Sanctioned Corp'],
      identifiers: ['TAX123456', 'REG789012']
    }
  }
];

// Mock Screening Results
const mockScreeningResults: ScreeningResult[] = [
  {
    id: '1',
    entity: mockCustomers[0],
    screeningList: mockScreeningLists[0],
    matchType: 'fuzzy',
    matchScore: 0.95,
    matchDetails: {
      matchedFields: ['name'],
      confidence: 'high',
      algorithm: 'fuzzy_match'
    },
    status: 'pending',
    isActive: true,
    createdAt: '2024-01-20T09:00:00Z',
    metadata: { algorithm: 'fuzzy_match', confidence: 'high' }
  }
];

// Mock Risk Assessments
const mockRiskAssessments: RiskAssessment[] = [
  {
    id: '1',
    customer: mockCustomers[0],
    assessmentType: 'onboarding',
    riskScore: 45,
    riskLevel: 'medium',
    assessor: mockUsers[0],
    assessmentDate: '2023-06-15T10:00:00Z',
    riskFactors: [
      {
        id: '1',
        category: 'geographic',
        description: 'Customer located in medium-risk jurisdiction',
        weight: 0.3,
        score: 40,
        metadata: {}
      },
      {
        id: '2',
        category: 'transaction_pattern',
        description: 'Regular transaction patterns within expected range',
        weight: 0.4,
        score: 20,
        metadata: {}
      },
      {
        id: '3',
        category: 'business_relationship',
        description: 'Established business relationship with known entities',
        weight: 0.3,
        score: 30,
        metadata: {}
      }
    ],
    mitigatingFactors: [
      'Customer provided comprehensive documentation',
      'Regular compliance training completed'
    ],
    recommendations: [
      'Continue enhanced monitoring',
      'Request updated business documentation annually'
    ],
    nextReviewDate: '2024-07-15T10:00:00Z',
    isActive: true,
    metadata: { assessmentVersion: '2.1' }
  }
];

// Mock Alerts
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'transaction',
    subType: 'large_amount',
    severity: 'high',
    status: 'open',
    title: 'Large Cash Deposit Alert',
    description: 'Customer deposited $250,000 in cash exceeding daily threshold',
    entityId: mockTransactions[1].id,
    entityType: 'transaction',
    assignedTo: mockUsers[0],
    timestamp: '2024-01-19T10:16:00Z',
    dueDate: '2024-01-24T17:00:00Z',
    metadata: { amount: 250000, threshold: 50000 }
  },
  {
    id: '2',
    type: 'screening',
    subType: 'sanctions_match',
    severity: 'critical',
    status: 'investigating',
    title: 'Potential Sanctions Match',
    description: 'Customer name shows 85% match with sanctions list',
    entityId: mockCustomers[0].id,
    entityType: 'customer',
    assignedTo: mockUsers[1],
    timestamp: '2024-01-20T08:00:00Z',
    dueDate: '2024-01-22T17:00:00Z',
    metadata: { matchScore: 0.85, listType: 'sanctions' }
  }
];

// Mock Dashboard Stats
const mockDashboardStats: DashboardStats = {
  totalTransactions: 2456,
  totalVolume: 12450000,
  activeAlerts: 23,
  pendingReviews: 8,
  riskDistribution: {
    low: 1205,
    medium: 856,
    high: 312,
    critical: 83
  },
  transactionsByType: [
    { type: 'Transfer', count: 1205, volume: 8500000 },
    { type: 'Deposit', count: 687, volume: 2800000 },
    { type: 'Withdrawal', count: 456, volume: 950000 },
    { type: 'Payment', count: 108, volume: 200000 }
  ],
  alertsByType: [
    { type: 'Threshold', count: 12 },
    { type: 'Pattern', count: 6 },
    { type: 'Velocity', count: 3 },
    { type: 'Sanctions', count: 2 }
  ],
  casesByStatus: [
    { status: 'Open', count: 15 },
    { status: 'In Progress', count: 8 },
    { status: 'Pending Review', count: 5 },
    { status: 'Closed', count: 142 }
  ],
  monthlyTrends: [
    { month: 'Nov 2023', transactions: 2156, volume: 10200000, alerts: 18 },
    { month: 'Dec 2023', transactions: 2298, volume: 11800000, alerts: 22 },
    { month: 'Jan 2024', transactions: 2456, volume: 12450000, alerts: 23 }
  ]
};

// Mock Analytics Widgets
const mockAnalyticsWidgets: AnalyticsWidget[] = [
  {
    id: '1',
    title: 'Transaction Volume Trend',
    widgetType: 'chart',
    chartType: 'line',
    configuration: {
      xAxis: 'date',
      yAxis: 'volume',
      timeRange: '30d',
      aggregation: 'daily'
    },
    dataSource: 'transactions',
    refreshInterval: 300,
    isActive: true,
    position: { x: 0, y: 0, width: 6, height: 4 },
    metadata: {}
  },
  {
    id: '2',
    title: 'Risk Distribution',
    widgetType: 'chart',
    chartType: 'pie',
    configuration: {
      field: 'riskLevel',
      colors: ['#4CAF50', '#FF9800', '#F44336', '#9C27B0']
    },
    dataSource: 'customers',
    refreshInterval: 600,
    isActive: true,
    position: { x: 6, y: 0, width: 3, height: 4 },
    metadata: {}
  }
];

// Mock Metric Cards
const mockMetricCards: MetricCard[] = [
  {
    title: 'Total Transactions',
    value: 2456,
    change: 12.5,
    changeType: 'increase',
    icon: 'TrendingUp',
    color: 'primary'
  },
  {
    title: 'Active Alerts',
    value: 23,
    change: -15.2,
    changeType: 'decrease',
    icon: 'Warning',
    color: 'warning'
  },
  {
    title: 'Total Volume',
    value: '$12.45M',
    change: 8.7,
    changeType: 'increase',
    icon: 'AttachMoney',
    color: 'success'
  },
  {
    title: 'High Risk Cases',
    value: 8,
    change: 0,
    changeType: 'neutral',
    icon: 'Security',
    color: 'error'
  }
];

// Mock Chart Data
const mockChartData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Transaction Volume',
      data: [8500000, 9200000, 10100000, 11200000, 11800000, 12450000],
      backgroundColor: 'rgba(26, 35, 126, 0.1)',
      borderColor: 'rgba(26, 35, 126, 1)',
      borderWidth: 2,
      fill: true
    },
    {
      label: 'Alert Count',
      data: [15, 18, 20, 19, 22, 23],
      backgroundColor: 'rgba(198, 40, 40, 0.1)',
      borderColor: 'rgba(198, 40, 40, 1)',
      borderWidth: 2,
      fill: false
    }
  ]
};

// Export all mock data
export {
  mockUsers,
  mockUserActivities,
  mockCustomers,
  mockIndividualCustomers,
  mockCorporateCustomers,
  mockTransactions,
  mockTransactionAlerts,
  mockCases,
  mockCaseNotes,
  mockScreeningLists,
  mockPEPs,
  mockSanctions,
  mockScreeningResults,
  mockRiskAssessments,
  mockAlerts,
  mockDashboardStats,
  mockAnalyticsWidgets,
  mockMetricCards,
  mockChartData
}; 