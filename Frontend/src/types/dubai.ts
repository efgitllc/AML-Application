export interface EmiratesIDVerification {
  id: string;
  emiratesId: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  verificationDate: string;
  expiryDate: string;
  holderName: string;
  nationality: string;
  documentImage?: string;
}

export interface ShariaCompliance {
  id: string;
  transactionId: string;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW_NEEDED';
  reviewDate: string;
  reviewedBy: string;
  shariaBoard: string;
  comments: string;
  requirements: string[];
}

export interface DNFBPCompliance {
  id: string;
  businessType: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  registrationNumber: string;
  licenseNumber: string;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
  lastAssessmentDate: string;
  nextAssessmentDate: string;
}

export interface DubaiRegulatory {
  id: string;
  regulationType: 'DFSA' | 'UAE_CENTRAL_BANK' | 'DIFC';
  reportingPeriod: string;
  submissionDeadline: string;
  status: 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  documents: string[];
  comments: string;
}

export interface UAERiskAssessment {
  id: string;
  entityId: string;
  riskCategory: string;
  riskScore: number;
  assessmentDate: string;
  nextReviewDate: string;
  mitigationMeasures: string[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface BeneficialOwner {
  id: string;
  customerId: string;
  name: string;
  nationality: string;
  ownershipPercentage: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  pepStatus: boolean;
  sanctionStatus: boolean;
  documents: string[];
} 