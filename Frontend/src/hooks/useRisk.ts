import { useState, useEffect, useCallback } from 'react';
import { riskService } from '../services/risk.service';
import type {
  Risk,
  RiskControl,
  RiskTreatment,
  RiskAssessment,
  RiskFilter,
  RiskDashboardStats,
} from '../types/risk';

interface UseRiskReturn {
  // Risks
  risks: Risk[];
  selectedRisk: Risk | null;
  loadRisks: (filters?: RiskFilter) => Promise<void>;
  getRisk: (id: string) => Promise<void>;
  createRisk: (risk: Partial<Risk>) => Promise<void>;
  updateRisk: (id: string, risk: Partial<Risk>) => Promise<void>;
  deleteRisk: (id: string) => Promise<void>;

  // Controls
  addControl: (riskId: string, control: Partial<RiskControl>) => Promise<void>;
  updateControl: (
    riskId: string,
    controlId: string,
    control: Partial<RiskControl>
  ) => Promise<void>;
  deleteControl: (riskId: string, controlId: string) => Promise<void>;
  testControl: (
    riskId: string,
    controlId: string,
    testResult: { outcome: 'PASS' | 'FAIL' | 'PARTIAL'; findings: string }
  ) => Promise<void>;

  // Treatments
  addTreatment: (riskId: string, treatment: Partial<RiskTreatment>) => Promise<void>;
  updateTreatment: (
    riskId: string,
    treatmentId: string,
    treatment: Partial<RiskTreatment>
  ) => Promise<void>;
  deleteTreatment: (riskId: string, treatmentId: string) => Promise<void>;
  updateTreatmentProgress: (
    riskId: string,
    treatmentId: string,
    progress: number
  ) => Promise<void>;

  // Assessments
  addAssessment: (riskId: string, assessment: Partial<RiskAssessment>) => Promise<void>;
  updateAssessment: (
    riskId: string,
    assessmentId: string,
    assessment: Partial<RiskAssessment>
  ) => Promise<void>;
  deleteAssessment: (riskId: string, assessmentId: string) => Promise<void>;

  // Dashboard
  stats: RiskDashboardStats | null;
  loadStats: (timeframe?: string) => Promise<void>;

  // Reports
  generateReport: (filters: RiskFilter, format: 'PDF' | 'EXCEL') => Promise<string>;

  // Bulk Operations
  bulkUpdateStatus: (riskIds: string[], status: Risk['status']) => Promise<void>;
  bulkAssignOwner: (riskIds: string[], ownerId: string) => Promise<void>;
  bulkAddTags: (riskIds: string[], tags: string[]) => Promise<void>;

  // Export/Import
  exportRisks: (filters: RiskFilter) => Promise<string>;
  importRisks: (file: File) => Promise<{
    success: boolean;
    message: string;
    imported: number;
    errors: string[];
  }>;

  loading: boolean;
  error: string | null;
}

export const useRisk = (): UseRiskReturn => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [stats, setStats] = useState<RiskDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRisks = async (filters?: RiskFilter) => {
    try {
      setLoading(true);
      const result = await riskService.getRisks(filters);
      setRisks(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load risks');
    } finally {
      setLoading(false);
    }
  };

  const getRisk = async (id: string) => {
    try {
      setLoading(true);
      const result = await riskService.getRisk(id);
      setSelectedRisk(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get risk');
    } finally {
      setLoading(false);
    }
  };

  const createRisk = async (risk: Partial<Risk>) => {
    try {
      setLoading(true);
      const result = await riskService.createRisk(risk);
      setRisks((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create risk');
    } finally {
      setLoading(false);
    }
  };

  const updateRisk = async (id: string, risk: Partial<Risk>) => {
    try {
      setLoading(true);
      const result = await riskService.updateRisk(id, risk);
      setRisks((prev) => prev.map((r) => (r.id === id ? result : r)));
      if (selectedRisk?.id === id) {
        setSelectedRisk(result);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update risk');
    } finally {
      setLoading(false);
    }
  };

  const deleteRisk = async (id: string) => {
    try {
      setLoading(true);
      await riskService.deleteRisk(id);
      setRisks((prev) => prev.filter((r) => r.id !== id));
      if (selectedRisk?.id === id) {
        setSelectedRisk(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete risk');
    } finally {
      setLoading(false);
    }
  };

  const addControl = async (riskId: string, control: Partial<RiskControl>) => {
    try {
      setLoading(true);
      const result = await riskService.addControl(riskId, control);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          controls: [...selectedRisk.controls, result],
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add control');
    } finally {
      setLoading(false);
    }
  };

  const updateControl = async (
    riskId: string,
    controlId: string,
    control: Partial<RiskControl>
  ) => {
    try {
      setLoading(true);
      const result = await riskService.updateControl(riskId, controlId, control);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          controls: selectedRisk.controls.map((c) =>
            c.id === controlId ? result : c
          ),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update control');
    } finally {
      setLoading(false);
    }
  };

  const deleteControl = async (riskId: string, controlId: string) => {
    try {
      setLoading(true);
      await riskService.deleteControl(riskId, controlId);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          controls: selectedRisk.controls.filter((c) => c.id !== controlId),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete control');
    } finally {
      setLoading(false);
    }
  };

  const testControl = async (
    riskId: string,
    controlId: string,
    testResult: { outcome: 'PASS' | 'FAIL' | 'PARTIAL'; findings: string }
  ) => {
    try {
      setLoading(true);
      const result = await riskService.testControl(riskId, controlId, testResult);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          controls: selectedRisk.controls.map((c) =>
            c.id === controlId ? result : c
          ),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test control');
    } finally {
      setLoading(false);
    }
  };

  const addTreatment = async (riskId: string, treatment: Partial<RiskTreatment>) => {
    try {
      setLoading(true);
      const result = await riskService.addTreatment(riskId, treatment);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          treatments: [...selectedRisk.treatments, result],
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add treatment');
    } finally {
      setLoading(false);
    }
  };

  const updateTreatment = async (
    riskId: string,
    treatmentId: string,
    treatment: Partial<RiskTreatment>
  ) => {
    try {
      setLoading(true);
      const result = await riskService.updateTreatment(riskId, treatmentId, treatment);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          treatments: selectedRisk.treatments.map((t) =>
            t.id === treatmentId ? result : t
          ),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update treatment');
    } finally {
      setLoading(false);
    }
  };

  const deleteTreatment = async (riskId: string, treatmentId: string) => {
    try {
      setLoading(true);
      await riskService.deleteTreatment(riskId, treatmentId);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          treatments: selectedRisk.treatments.filter((t) => t.id !== treatmentId),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete treatment');
    } finally {
      setLoading(false);
    }
  };

  const updateTreatmentProgress = async (
    riskId: string,
    treatmentId: string,
    progress: number
  ) => {
    try {
      setLoading(true);
      const result = await riskService.updateTreatmentProgress(
        riskId,
        treatmentId,
        progress
      );
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          treatments: selectedRisk.treatments.map((t) =>
            t.id === treatmentId ? result : t
          ),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update treatment progress');
    } finally {
      setLoading(false);
    }
  };

  const addAssessment = async (riskId: string, assessment: Partial<RiskAssessment>) => {
    try {
      setLoading(true);
      const result = await riskService.addAssessment(riskId, assessment);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          assessments: [...selectedRisk.assessments, result],
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add assessment');
    } finally {
      setLoading(false);
    }
  };

  const updateAssessment = async (
    riskId: string,
    assessmentId: string,
    assessment: Partial<RiskAssessment>
  ) => {
    try {
      setLoading(true);
      const result = await riskService.updateAssessment(riskId, assessmentId, assessment);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          assessments: selectedRisk.assessments.map((a) =>
            a.id === assessmentId ? result : a
          ),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assessment');
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (riskId: string, assessmentId: string) => {
    try {
      setLoading(true);
      await riskService.deleteAssessment(riskId, assessmentId);
      if (selectedRisk?.id === riskId) {
        setSelectedRisk({
          ...selectedRisk,
          assessments: selectedRisk.assessments.filter((a) => a.id !== assessmentId),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (timeframe?: string) => {
    try {
      setLoading(true);
      const result = await riskService.getDashboardStats(timeframe);
      setStats(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (filters: RiskFilter, format: 'PDF' | 'EXCEL') => {
    try {
      setLoading(true);
      const result = await riskService.generateReport(filters, format);
      setError(null);
      return result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateStatus = async (riskIds: string[], status: Risk['status']) => {
    try {
      setLoading(true);
      await riskService.bulkUpdateStatus(riskIds, status);
      await loadRisks(); // Reload risks after bulk update
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const bulkAssignOwner = async (riskIds: string[], ownerId: string) => {
    try {
      setLoading(true);
      await riskService.bulkAssignOwner(riskIds, ownerId);
      await loadRisks(); // Reload risks after bulk update
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign owner');
    } finally {
      setLoading(false);
    }
  };

  const bulkAddTags = async (riskIds: string[], tags: string[]) => {
    try {
      setLoading(true);
      await riskService.bulkAddTags(riskIds, tags);
      await loadRisks(); // Reload risks after bulk update
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tags');
    } finally {
      setLoading(false);
    }
  };

  const exportRisks = async (filters: RiskFilter) => {
    try {
      setLoading(true);
      const result = await riskService.exportRisks(filters);
      setError(null);
      return result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export risks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importRisks = async (file: File) => {
    try {
      setLoading(true);
      const result = await riskService.importRisks(file);
      if (result.success) {
        await loadRisks(); // Reload risks after import
      }
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import risks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
    loadStats();
  }, []);

  return {
    risks,
    selectedRisk,
    loadRisks,
    getRisk,
    createRisk,
    updateRisk,
    deleteRisk,
    addControl,
    updateControl,
    deleteControl,
    testControl,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    updateTreatmentProgress,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    stats,
    loadStats,
    generateReport,
    bulkUpdateStatus,
    bulkAssignOwner,
    bulkAddTags,
    exportRisks,
    importRisks,
    loading,
    error,
  };
}; 