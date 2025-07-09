export interface MLModel {
  id: string;
  name: string;
  type: 'RISK_SCORING' | 'ANOMALY_DETECTION' | 'PATTERN_RECOGNITION' | 'TRANSACTION_ANALYSIS';
  version: string;
  status: 'ACTIVE' | 'TRAINING' | 'INACTIVE';
  accuracy: number;
  lastTrainingDate: string;
  parameters: Record<string, any>;
}

export interface MLPrediction {
  id: string;
  modelId: string;
  entityId: string;
  entityType: 'TRANSACTION' | 'CUSTOMER' | 'ACCOUNT';
  predictionType: string;
  score: number;
  confidence: number;
  factors: string[];
  timestamp: string;
}

export interface AnomalyDetection {
  id: string;
  entityId: string;
  entityType: string;
  anomalyType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  detectedAt: string;
  description: string;
  relatedEntities: string[];
}

export interface PatternRecognition {
  id: string;
  patternType: string;
  entities: string[];
  confidence: number;
  detectedAt: string;
  description: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RiskScore {
  id: string;
  entityId: string;
  entityType: string;
  score: number;
  factors: {
    factor: string;
    weight: number;
    contribution: number;
  }[];
  previousScore: number;
  timestamp: string;
}

export interface MLModelTraining {
  id: string;
  modelId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startTime: string;
  endTime?: string;
  accuracy?: number;
  metrics: Record<string, number>;
  error?: string;
}

export interface FalsePositiveAnalysis {
  id: string;
  alertId: string;
  originalScore: number;
  adjustedScore: number;
  reason: string;
  analyst: string;
  timestamp: string;
  learningPoints: string[];
}

export interface AIAnalysis {
  id: string;
  type: 'TRANSACTION' | 'BEHAVIOR' | 'RISK';
  entityId: string;
  insights: string[];
  recommendations: string[];
  timestamp: string;
  confidence: number;
}

export interface ModelPerformance {
  modelId: string;
  period: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
  };
  confusionMatrix: number[][];
} 