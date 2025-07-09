import { useState, useEffect, useCallback } from 'react';
import { regulatoryService } from '../services/regulatory.service';
import type { 
  ComplianceStatusData, 
  RiskMetrics, 
  ComplianceTask, 
  ComplianceAlert 
} from '../types/regulatory';

export const useRegulatoryCompliance = () => {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatusData | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [pendingTasks, setPendingTasks] = useState<ComplianceTask[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statusResponse,
        metricsResponse,
        tasksResponse,
        alertsResponse
      ] = await Promise.all([
        regulatoryService.getComplianceStatus(),
        regulatoryService.getRiskMetrics(),
        regulatoryService.getPendingTasks(),
        regulatoryService.getRecentAlerts()
      ]);

      setComplianceStatus(statusResponse);
      setRiskMetrics(metricsResponse);
      setPendingTasks(tasksResponse);
      setRecentAlerts(alertsResponse);
    } catch (err) {
      setError('Failed to fetch regulatory compliance data. Please try again later.');
      console.error('Regulatory compliance data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateTaskStatus = async (taskId: string, status: ComplianceTask['status']) => {
    try {
      await regulatoryService.updateTaskStatus(taskId, status);
      setPendingTasks(tasks =>
        tasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        )
      );
    } catch (err) {
      console.error('Failed to update task status:', err);
      throw err;
    }
  };

  const updateAlertStatus = async (alertId: string, status: ComplianceAlert['status']) => {
    try {
      await regulatoryService.updateAlertStatus(alertId, status);
      setRecentAlerts(alerts =>
        alerts.map(alert =>
          alert.id === alertId ? { ...alert, status } : alert
        )
      );
    } catch (err) {
      console.error('Failed to update alert status:', err);
      throw err;
    }
  };

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    complianceStatus,
    riskMetrics,
    pendingTasks,
    recentAlerts,
    loading,
    error,
    updateTaskStatus,
    updateAlertStatus,
    refreshData,
  };
};