// Core Types
export type UserRole = 'admin' | 'analyst' | 'investigator' | 'supervisor';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  department?: string;
  role: UserRole;
  isActive: boolean;
  dateJoined: string;
  lastLogin: string;
  lastLoginIp?: string;
  mfaEnabled: boolean;
  employeeId?: string;
  accessLevel: string;
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  position?: string;
  failedLoginAttempts: number;
  accountLockedUntil?: string;
}

export interface RolePermissions {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// KYC/Customer Types
export interface Customer {
  id: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'pending' | 'blocked';
  kycStatus: 'complete' | 'incomplete' | 'expired';
  lastScreeningDate: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  customerId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'exchange';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'rejected' | 'flagged';
  riskScore: number;
  date: string;
  description?: string;
}

// Alert Types
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'in_progress' | 'under_review' | 'closed';
export type AlertType = 'suspicious_transaction' | 'kyc_alert' | 'compliance_violation' | 'watchlist_match' | 'other';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  type: AlertType;
  status: AlertStatus;
  customer: string;
  timestamp: string;
  assignedTo?: string;
}

// Case Types
export type CaseType = 'aml_investigation' | 'suspicious_activity' | 'compliance_review' | 'customer_review' | 'transaction_review' | 'regulatory_inquiry';
export type CaseStatus = 'open' | 'investigating' | 'pending_review' | 'closed' | 'escalated' | 'on_hold';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  customerId: string;
  assignedTo?: {
    id: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  notes?: {
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }[];
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadedBy: string;
    uploadedAt: string;
  }[];
}

// Document Types
export interface Document {
  id: string;
  type: string;
  name: string;
  status: 'valid' | 'invalid' | 'expired';
  expiryDate: string;
  verificationStatus: string;
}

// Risk Assessment Types
export interface RiskAssessment {
  id: string;
  entityId: string;
  entityType: 'customer' | 'transaction';
  score: number;
  factors: RiskFactor[];
  lastUpdated: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

// Compliance Types
export interface ComplianceCheck {
  id: string;
  type: string;
  status: string;
  findings: string[];
  date: string;
}

// Screening Types
export interface ScreeningResult {
  id: string;
  entityId: string;
  matchType: string;
  score: number;
  source: string;
  details: string;
}

// Analytics Types
export interface AnalyticsData {
  period: string;
  metrics: {
    totalTransactions: number;
    totalAlerts: number;
    riskDistribution: { [key: string]: number };
    alertsByType: { [key: string]: number };
  };
}

// Reporting Types
export interface Report {
  id: string;
  type: string;
  status: string;
  generatedAt: string;
  data: any;
}

// Dubai-Specific Types
export interface DFSAReport {
  id: string;
  period: string;
  status: string;
  submissions: any[];
}

export interface EmiratesIDVerification {
  id: string;
  status: string;
  verificationDate: string;
  details: any;
}

// Utility Types
export interface RelatedEntity {
  id: string;
  type: 'customer' | 'transaction' | 'document';
  name: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: any;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  sms: boolean;
  alertTypes: string[];
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  components: {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    message?: string;
  }[];
}

// User Management Types
export interface UserActivity {
  id: string;
  user: User;
  activityType: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export' | 'other';
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
  details: Record<string, any>;
  createdAt: string;
}

export interface IndividualCustomer {
  id: string;
  customer: Customer;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'O' | 'U';
  nationality: string;
  idType: string;
  idNumber: string;
  idExpiryDate: string;
  address: string;
  phoneNumber: string;
  email: string;
  occupation: string;
  employer?: string;
  sourceOfWealth: string;
  expectedTransactionVolume: number;
  expectedTransactionFrequency: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  taxId?: string;
  metadata: Record<string, any>;
}

export interface CorporateCustomer {
  id: string;
  customer: Customer;
  name: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'trust' | 'foundation';
  registrationNumber: string;
  taxId: string;
  countryOfIncorporation: string;
  dateOfIncorporation: string;
  registrationAddress: string;
  businessAddress: string;
  phoneNumber: string;
  email: string;
  website?: string;
  status: 'active' | 'inactive' | 'suspended' | 'dissolved';
  annualRevenue?: number;
  numberOfEmployees?: number;
  industry: string;
  metadata: Record<string, any>;
}

export interface TransactionAlert {
  id: string;
  transaction: Transaction;
  alertType: 'threshold' | 'pattern' | 'velocity' | 'location' | 'sanctions' | 'pep' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in_review' | 'resolved' | 'false_positive' | 'escalated' | 'rejected';
  description: string;
  ruleTriggered: string;
  assignedTo?: User;
  reviewNotes?: string;
  reviewDate?: string;
  reviewBy?: User;
  case?: Case;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface CaseNote {
  id: string;
  case: Case;
  noteType: 'general' | 'investigation' | 'decision' | 'approval' | 'resolution' | 'other';
  content: string;
  isInternal: boolean;
  isConfidential: boolean;
  requiresAcknowledgment: boolean;
  acknowledgedBy?: User;
  acknowledgmentDate?: string;
  metadata: Record<string, any>;
  createdAt: string;
  createdBy: User;
}

export interface CaseDocument {
  id: string;
  case: Case;
  title: string;
  file: string;
  documentType: 'report' | 'evidence' | 'correspondence' | 'approval' | 'resolution' | 'other';
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  version: number;
  isConfidential: boolean;
  requiresApproval: boolean;
  approvedBy?: User;
  approvalDate?: string;
  approvalNotes?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ScreeningList {
  id: string;
  name: string;
  listType: 'pep' | 'sanctions' | 'watchlist';
  source: string;
  isActive: boolean;
  effectiveDate: string;
  expiryDate?: string;
  lastUpdated: string;
  approvedBy?: User;
  supportedLanguages: MultilingualSupport[];
  defaultLanguage?: MultilingualSupport;
  multilingualEnabled: boolean;
  metadata: Record<string, any>;
}

export interface PEP extends ScreeningList {
  position: string;
  positionType: 'head_of_state' | 'head_of_government' | 'minister' | 'senior_official' | 'judge' | 'military' | 'board_member' | 'other';
  country: string;
  startDate?: string;
  endDate?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  familyMembers: any[];
  associates: any[];
}

export interface Sanctions extends ScreeningList {
  sanctionType: 'individual' | 'entity' | 'vessel' | 'country' | 'other';
  issuingAuthority: string;
  sanctionDetails: Record<string, any>;
}

export interface MultilingualSupport {
  id: string;
  language: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ar' | 'zh' | 'ja' | 'ko' | 'hi' | 'ur' | 'fa' | 'tr' | 'nl' | 'sv' | 'no';
  languageName: string;
  isActive: boolean;
  transliterationEnabled: boolean;
  fuzzyMatchingEnabled: boolean;
  matchThreshold: number;
  metadata: Record<string, any>;
}

export interface DashboardStats {
  totalCustomers: number;
  activeAlerts: number;
  openCases: number;
  pendingTransactions: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  transactionVolume: {
    date: string;
    amount: number;
    count: number;
  }[];
  alertsByType: {
    type: string;
    count: number;
  }[];
}

export interface AnalyticsWidget {
  id: string;
  title: string;
  widgetType: 'chart' | 'table' | 'metric' | 'gauge' | 'radar' | 'waterfall' | 'funnel' | 'treemap' | 'sankey' | 'histogram' | 'box_plot';
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'donut';
  configuration: Record<string, any>;
  dataSource: string;
  refreshInterval: number;
  isActive: boolean;
  position: { x: number; y: number; width: number; height: number };
  metadata: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  defaultValue?: any;
  disabled?: boolean;
  hidden?: boolean;
}

// Filter and Search Types
export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

export interface SearchFilters {
  query?: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface MetricCard {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// System Configuration Types
export interface SystemConfig {
  id: string;
  category: string;
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  isEditable: boolean;
  isEncrypted: boolean;
  updatedBy?: User;
  updatedAt: string;
}

// Export types for components
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type StatusType = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type CustomerType = 'individual' | 'corporate' | 'partnership' | 'trust' | 'foundation';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'exchange' | 'investment' | 'loan' | 'other';

export interface Settings {
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    alertTypes: string[];
  };
  monitoring: {
    refreshInterval: number;
    autoRefreshEnabled: boolean;
    thresholds: {
      transactionAmount: number;
      riskScore: number;
    };
  };
  security: {
    mfaEnabled: boolean;
    sessionTimeout: number;
    passwordExpiryDays: number;
  };
  dataRetention: {
    transactionMonths: number;
    alertMonths: number;
    auditLogMonths: number;
  };
}

import type { ReactNode } from 'react';

export interface MetricsData {
  totalTransactions: number;
  activeAlerts: number;
  openCases: number;
  highRiskCustomers: number;
  transactionChange: number;
  alertChange: number;
  caseChange: number;
  customerRiskChange: number;
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

export interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change: number;
  period: string;
  loading?: boolean;
}

export interface ChartProps {
  title: string;
  subtitle?: string;
  type: 'line' | 'area' | 'bar' | 'pie';
  data: any[];
  loading?: boolean;
  xAxisKey?: string;
  series?: Array<{
    key: string;
    label: string;
  }>;
  nameKey?: string;
  dataKey?: string;
}

export interface DataGridProps {
  title: string;
  subtitle?: string;
  data: any[];
  columns: Array<{
    field: string;
    headerName: string;
    width: number;
    renderCell?: (params: any) => ReactNode;
  }>;
  loading?: boolean;
  pageSize?: number;
}

export interface StatusBadgeProps {
  status: AlertStatus;
}

export interface UseAnalyticsReturn<T> {
  metrics: T | null;
  fetchMetrics: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export interface UseAlertsReturn<T> {
  alerts: T[] | null;
  fetchAlerts: (params: { limit: number; status: T extends Alert ? AlertStatus : string }) => Promise<void>;
  loading: boolean;
  error: Error | null;
} 