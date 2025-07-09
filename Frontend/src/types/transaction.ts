export interface Transaction {
  id: string;
  customerId: string;
  type: 'credit' | 'debit' | 'transfer' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'flagged' | 'under_review';
  date: string;
  description?: string;
  reference?: string;
  senderInfo?: {
    name: string;
    accountNumber: string;
    bankName?: string;
    swiftCode?: string;
  };
  recipientInfo?: {
    name: string;
    accountNumber: string;
    bankName?: string;
    swiftCode?: string;
  };
  riskScore?: number;
  flags?: {
    id: string;
    reason: string;
    createdAt: string;
    createdBy: string;
  }[];
  notes?: {
    id: string;
    note: string;
    createdAt: string;
    createdBy: string;
  }[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionNote {
  id: string;
  transactionId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface TransactionFlag {
  id: string;
  transactionId: string;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface TransactionHistory {
  id: string;
  transactionId: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
} 