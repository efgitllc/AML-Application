import { useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/ai.service';
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

interface UseAIReturn {
  // Models
  models: MLModel[];
  selectedModel: MLModel | null;
  modelPerformance: ModelPerformance | null;
  loadModels: () => Promise<void>;
  selectModel: (modelId: string) => Promise<void>;
  trainModel: (modelId: string, parameters: Record<string, any>) => Promise<void>;
  
  // Predictions
  predictions: MLPrediction[];
  getPrediction: (entityId: string, entityType: string) => Promise<void>;
  
  // Anomalies
  anomalies: AnomalyDetection[];
  detectAnomalies: (data: { entityId: string; entityType: string }) => Promise<void>;
  
  // Patterns
  patterns: PatternRecognition[];
  recognizePatterns: (data: { entities: string[]; type: string }) => Promise<void>;
  
  // Risk Scoring
  riskScores: RiskScore[];
  calculateRiskScore: (entityId: string, entityType: string) => Promise<void>;
  
  // False Positives
  falsePositives: FalsePositiveAnalysis[];
  analyzeFalsePositive: (data: { alertId: string; reason: string; analyst: string }) => Promise<void>;
  
  // AI Analysis
  analyses: AIAnalysis[];
  analyzeEntity: (data: { entityId: string; type: 'TRANSACTION' | 'BEHAVIOR' | 'RISK' }) => Promise<void>;
  
  loading: boolean;
  error: string | null;
}

export const useAI = (): UseAIReturn => {
  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [patterns, setPatterns] = useState<PatternRecognition[]>([]);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [falsePositives, setFalsePositives] = useState<FalsePositiveAnalysis[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModels = async () => {
    try {
      setLoading(true);
      const result = await aiService.getModels();
      setModels(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const selectModel = async (modelId: string) => {
    try {
      setLoading(true);
      const [model, performance] = await Promise.all([
        aiService.getModel(modelId),
        aiService.getModelPerformance(modelId),
      ]);
      setSelectedModel(model);
      setModelPerformance(performance);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select model');
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async (modelId: string, parameters: Record<string, any>) => {
    try {
      setLoading(true);
      await aiService.trainModel(modelId, parameters);
      await loadModels(); // Refresh models list
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to train model');
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = async (entityId: string, entityType: string) => {
    try {
      setLoading(true);
      const result = await aiService.getPrediction(entityId, entityType);
      setPredictions((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = async (data: { entityId: string; entityType: string }) => {
    try {
      setLoading(true);
      const result = await aiService.detectAnomalies(data);
      setAnomalies(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect anomalies');
    } finally {
      setLoading(false);
    }
  };

  const recognizePatterns = async (data: { entities: string[]; type: string }) => {
    try {
      setLoading(true);
      const result = await aiService.recognizePatterns(data);
      setPatterns(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recognize patterns');
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskScore = async (entityId: string, entityType: string) => {
    try {
      setLoading(true);
      const result = await aiService.calculateRiskScore(entityId, entityType);
      setRiskScores((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate risk score');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFalsePositive = async (data: { alertId: string; reason: string; analyst: string }) => {
    try {
      setLoading(true);
      const result = await aiService.analyzeFalsePositive(data);
      setFalsePositives((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze false positive');
    } finally {
      setLoading(false);
    }
  };

  const analyzeEntity = async (data: { entityId: string; type: 'TRANSACTION' | 'BEHAVIOR' | 'RISK' }) => {
    try {
      setLoading(true);
      const result = await aiService.analyzeEntity(data);
      setAnalyses((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze entity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  return {
    models,
    selectedModel,
    modelPerformance,
    loadModels,
    selectModel,
    trainModel,
    predictions,
    getPrediction,
    anomalies,
    detectAnomalies,
    patterns,
    recognizePatterns,
    riskScores,
    calculateRiskScore,
    falsePositives,
    analyzeFalsePositive,
    analyses,
    analyzeEntity,
    loading,
    error,
  };
}; 