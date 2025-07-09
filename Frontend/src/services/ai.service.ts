import { api } from './api';
import type {
  MLModel,
  MLPrediction,
  AnomalyDetection,
  PatternRecognition,
  RiskScore,
  MLModelTraining,
  FalsePositiveAnalysis,
  AIAnalysis,
  ModelPerformance,
} from '../types/ai';

class AIService {
  private readonly BASE_PATH = '/api/ai';

  // Model Management
  async getModels(): Promise<MLModel[]> {
    const response = await api.get<MLModel[]>(`${this.BASE_PATH}/models`);
    return response.data;
  }

  async getModel(modelId: string): Promise<MLModel> {
    const response = await api.get<MLModel>(`${this.BASE_PATH}/models/${modelId}`);
    return response.data;
  }

  async trainModel(modelId: string, parameters: Record<string, any>): Promise<MLModelTraining> {
    const response = await api.post<MLModelTraining>(`${this.BASE_PATH}/models/${modelId}/train`, parameters);
    return response.data;
  }

  async getModelPerformance(modelId: string): Promise<ModelPerformance> {
    const response = await api.get<ModelPerformance>(`${this.BASE_PATH}/models/${modelId}/performance`);
    return response.data;
  }

  // Predictions
  async getPrediction(entityId: string, entityType: string): Promise<MLPrediction> {
    const response = await api.get<MLPrediction>(`${this.BASE_PATH}/predict`, {
      params: { entityId, entityType },
    });
    return response.data;
  }

  // Anomaly Detection
  async detectAnomalies(data: {
    entityId: string;
    entityType: string;
  }): Promise<AnomalyDetection[]> {
    const response = await api.post<AnomalyDetection[]>(`${this.BASE_PATH}/anomalies/detect`, data);
    return response.data;
  }

  async getAnomalyHistory(entityId: string): Promise<AnomalyDetection[]> {
    const response = await api.get<AnomalyDetection[]>(`${this.BASE_PATH}/anomalies/history/${entityId}`);
    return response.data;
  }

  // Pattern Recognition
  async recognizePatterns(data: {
    entities: string[];
    type: string;
  }): Promise<PatternRecognition[]> {
    const response = await api.post<PatternRecognition[]>(`${this.BASE_PATH}/patterns/recognize`, data);
    return response.data;
  }

  // Risk Scoring
  async calculateRiskScore(entityId: string, entityType: string): Promise<RiskScore> {
    const response = await api.post<RiskScore>(`${this.BASE_PATH}/risk-score/calculate`, {
      entityId,
      entityType,
    });
    return response.data;
  }

  async getRiskScoreHistory(entityId: string): Promise<RiskScore[]> {
    const response = await api.get<RiskScore[]>(`${this.BASE_PATH}/risk-score/history/${entityId}`);
    return response.data;
  }

  // False Positive Analysis
  async analyzeFalsePositive(data: {
    alertId: string;
    reason: string;
    analyst: string;
  }): Promise<FalsePositiveAnalysis> {
    const response = await api.post<FalsePositiveAnalysis>(`${this.BASE_PATH}/false-positive/analyze`, data);
    return response.data;
  }

  async getFalsePositiveHistory(): Promise<FalsePositiveAnalysis[]> {
    const response = await api.get<FalsePositiveAnalysis[]>(`${this.BASE_PATH}/false-positive/history`);
    return response.data;
  }

  // AI Analysis
  async analyzeEntity(data: {
    entityId: string;
    type: 'TRANSACTION' | 'BEHAVIOR' | 'RISK';
  }): Promise<AIAnalysis> {
    const response = await api.post<AIAnalysis>(`${this.BASE_PATH}/analyze`, data);
    return response.data;
  }

  async getAnalysisHistory(entityId: string): Promise<AIAnalysis[]> {
    const response = await api.get<AIAnalysis[]>(`${this.BASE_PATH}/analysis/history/${entityId}`);
    return response.data;
  }
}

export const aiService = new AIService(); 