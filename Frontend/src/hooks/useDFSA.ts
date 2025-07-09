import { useState, useEffect, useCallback } from 'react';
import { dfsaService } from '../services/dfsa.service';
import type {
  DFSAReport,
  DFSAMetrics,
  DFSAComplianceStatus,
  DFSANotification,
  DFSARequirement,
} from '../types/dfsa';

interface UseDFSAOptions {
  autoFetch?: boolean;
  period?: {
    start: string;
    end: string;
  };
}

export const useDFSA = (options: UseDFSAOptions = {}) => {
  const [reports, setReports] = useState<DFSAReport[]>([]);
  const [metrics, setMetrics] = useState<DFSAMetrics | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<DFSAComplianceStatus | null>(null);
  const [notifications, setNotifications] = useState<DFSANotification[]>([]);
  const [requirements, setRequirements] = useState<DFSARequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        reportsData,
        metricsData,
        complianceData,
        notificationsData,
        requirementsData,
      ] = await Promise.all([
        dfsaService.getDFSAReports(),
        options.period ? dfsaService.getDFSAMetrics(options.period) : null,
        dfsaService.getDFSAComplianceStatus(),
        dfsaService.getDFSANotifications(),
        dfsaService.getDFSARequirements(),
      ]);

      setReports(reportsData);
      if (metricsData) setMetrics(metricsData);
      setComplianceStatus(complianceData);
      setNotifications(notificationsData);
      setRequirements(requirementsData);
    } catch (err) {
      setError('Failed to fetch DFSA data. Please try again later.');
      console.error('DFSA data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [options.period]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  const createReport = async (report: Omit<DFSAReport, 'id'>) => {
    try {
      const newReport = await dfsaService.createDFSAReport(report);
      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (err) {
      console.error('Failed to create DFSA report:', err);
      throw err;
    }
  };

  const updateReport = async (reportId: string, updates: Partial<DFSAReport>) => {
    try {
      const updatedReport = await dfsaService.updateDFSAReport(reportId, updates);
      setReports(prev =>
        prev.map(report =>
          report.id === reportId ? updatedReport : report
        )
      );
      return updatedReport;
    } catch (err) {
      console.error('Failed to update DFSA report:', err);
      throw err;
    }
  };

  const submitReport = async (reportId: string) => {
    try {
      const submittedReport = await dfsaService.submitDFSAReport(reportId);
      setReports(prev =>
        prev.map(report =>
          report.id === reportId ? submittedReport : report
        )
      );
      return submittedReport;
    } catch (err) {
      console.error('Failed to submit DFSA report:', err);
      throw err;
    }
  };

  const updateFinding = async (findingId: string, status: string) => {
    try {
      await dfsaService.updateFindingStatus(findingId, status);
      if (complianceStatus) {
        setComplianceStatus({
          ...complianceStatus,
          findings: complianceStatus.findings.map(finding =>
            finding.id === findingId ? { ...finding, status } : finding
          ),
        });
      }
    } catch (err) {
      console.error('Failed to update finding status:', err);
      throw err;
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await dfsaService.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      throw err;
    }
  };

  const uploadReportAttachment = async (reportId: string, file: File) => {
    try {
      const attachment = await dfsaService.uploadAttachment(reportId, file);
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? {
                ...report,
                attachments: [...report.attachments, {
                  ...attachment,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  uploadDate: new Date().toISOString(),
                }],
              }
            : report
        )
      );
      return attachment;
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      throw err;
    }
  };

  const deleteReportAttachment = async (reportId: string, attachmentId: string) => {
    try {
      await dfsaService.deleteAttachment(reportId, attachmentId);
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? {
                ...report,
                attachments: report.attachments.filter(a => a.id !== attachmentId),
              }
            : report
        )
      );
    } catch (err) {
      console.error('Failed to delete attachment:', err);
      throw err;
    }
  };

  const exportReportFile = async (reportId: string, format: 'pdf' | 'excel') => {
    try {
      const blob = await dfsaService.exportReport(reportId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dfsa-report-${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export report:', err);
      throw err;
    }
  };

  return {
    reports,
    metrics,
    complianceStatus,
    notifications,
    requirements,
    loading,
    error,
    createReport,
    updateReport,
    submitReport,
    updateFinding,
    markNotificationRead,
    uploadReportAttachment,
    deleteReportAttachment,
    exportReportFile,
    refreshData: fetchData,
  };
}; 