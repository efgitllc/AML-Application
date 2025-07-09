import { useState, useEffect, useCallback } from 'react';
import { uaeCentralBankService } from '../services/uaeCentralBank.service';
import type {
  UAECBReport,
  UAECBMetrics,
  UAECBRequirement,
  UAECBSubmissionResult,
  GoAMLIntegrationStatus,
} from '../types/uaeCentralBank';

interface UseUAECBOptions {
  autoFetch?: boolean;
  period?: {
    start: string;
    end: string;
  };
}

export const useUAECB = (options: UseUAECBOptions = {}) => {
  const [reports, setReports] = useState<UAECBReport[]>([]);
  const [metrics, setMetrics] = useState<UAECBMetrics | null>(null);
  const [requirements, setRequirements] = useState<UAECBRequirement[]>([]);
  const [goAMLStatus, setGoAMLStatus] = useState<GoAMLIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        reportsData,
        metricsData,
        requirementsData,
        goAMLStatusData,
      ] = await Promise.all([
        uaeCentralBankService.getReports(),
        options.period ? uaeCentralBankService.getMetrics(options.period) : null,
        uaeCentralBankService.getRequirements(),
        uaeCentralBankService.getGoAMLStatus(),
      ]);

      setReports(reportsData);
      if (metricsData) setMetrics(metricsData);
      setRequirements(requirementsData);
      setGoAMLStatus(goAMLStatusData);
    } catch (err) {
      setError('Failed to fetch UAE Central Bank data. Please try again later.');
      console.error('UAE Central Bank data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [options.period]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  const createReport = async (report: Omit<UAECBReport, 'id'>) => {
    try {
      const newReport = await uaeCentralBankService.createReport(report);
      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (err) {
      console.error('Failed to create UAE Central Bank report:', err);
      throw err;
    }
  };

  const updateReport = async (reportId: string, updates: Partial<UAECBReport>) => {
    try {
      const updatedReport = await uaeCentralBankService.updateReport(reportId, updates);
      setReports(prev =>
        prev.map(report =>
          report.id === reportId ? updatedReport : report
        )
      );
      return updatedReport;
    } catch (err) {
      console.error('Failed to update UAE Central Bank report:', err);
      throw err;
    }
  };

  const submitReport = async (reportId: string): Promise<UAECBSubmissionResult> => {
    try {
      const result = await uaeCentralBankService.submitReport(reportId);
      if (result.success) {
        setReports(prev =>
          prev.map(report =>
            report.id === reportId
              ? { ...report, status: 'submitted', submissionDate: new Date().toISOString() }
              : report
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Failed to submit UAE Central Bank report:', err);
      throw err;
    }
  };

  const validateReport = async (reportId: string): Promise<UAECBSubmissionResult> => {
    try {
      return await uaeCentralBankService.validateReport(reportId);
    } catch (err) {
      console.error('Failed to validate UAE Central Bank report:', err);
      throw err;
    }
  };

  const uploadAttachment = async (reportId: string, file: File) => {
    try {
      const attachment = await uaeCentralBankService.uploadAttachment(reportId, file);
      return attachment;
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      throw err;
    }
  };

  const addComment = async (
    reportId: string,
    comment: { content: string; type: 'internal' | 'regulatory' }
  ) => {
    try {
      await uaeCentralBankService.addComment(reportId, comment);
      const updatedReport = await uaeCentralBankService.getReportById(reportId);
      setReports(prev =>
        prev.map(report =>
          report.id === reportId ? updatedReport : report
        )
      );
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const syncWithGoAML = async () => {
    try {
      await uaeCentralBankService.syncWithGoAML();
      const newStatus = await uaeCentralBankService.getGoAMLStatus();
      setGoAMLStatus(newStatus);
    } catch (err) {
      console.error('Failed to sync with goAML:', err);
      throw err;
    }
  };

  const submitBatchReports = async (reportIds: string[]): Promise<UAECBSubmissionResult[]> => {
    try {
      const results = await uaeCentralBankService.submitBatchReports(reportIds);
      const successfulSubmissions = results
        .filter(result => result.success)
        .map(result => result.referenceNumber)
        .filter((ref): ref is string => ref !== undefined);

      if (successfulSubmissions.length > 0) {
        setReports(prev =>
          prev.map(report =>
            reportIds.includes(report.id)
              ? { ...report, status: 'submitted', submissionDate: new Date().toISOString() }
              : report
          )
        );
      }
      return results;
    } catch (err) {
      console.error('Failed to submit batch reports:', err);
      throw err;
    }
  };

  return {
    reports,
    metrics,
    requirements,
    goAMLStatus,
    loading,
    error,
    createReport,
    updateReport,
    submitReport,
    validateReport,
    uploadAttachment,
    addComment,
    syncWithGoAML,
    submitBatchReports,
    refreshData: fetchData,
  };
}; 