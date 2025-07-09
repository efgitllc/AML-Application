import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import type { UAECBMetrics } from '../../types/uaeCentralBank';

interface UAECBMetricsCardProps {
  metrics: UAECBMetrics;
}

export const UAECBMetricsCard: React.FC<UAECBMetricsCardProps> = ({ metrics }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-AE').format(value);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getCompletionRate = () => {
    const total = metrics.submittedReports + metrics.pendingReports + metrics.rejectedReports;
    return total > 0 ? (metrics.submittedReports / total) * 100 : 0;
  };

  const metrics_display = [
    {
      label: 'Suspicious Transaction Reports',
      value: metrics.strCount,
      format: formatNumber,
      icon: <WarningIcon color="error" />,
      tooltip: 'Total number of STRs filed',
    },
    {
      label: 'Cash Transaction Reports',
      value: metrics.ctrCount,
      format: formatNumber,
      icon: <AssessmentIcon color="primary" />,
      tooltip: 'Total number of CTRs filed',
    },
    {
      label: 'Total Transaction Value',
      value: metrics.totalTransactionValue,
      format: formatCurrency,
      icon: <AssessmentIcon color="primary" />,
      tooltip: 'Total value of all reported transactions',
    },
    {
      label: 'High Risk Transactions',
      value: metrics.highRiskTransactions,
      format: formatNumber,
      icon: <WarningIcon color="warning" />,
      tooltip: 'Number of transactions flagged as high risk',
    },
    {
      label: 'Submitted Reports',
      value: metrics.submittedReports,
      format: formatNumber,
      icon: <CheckCircleIcon color="success" />,
      tooltip: 'Number of reports successfully submitted',
    },
    {
      label: 'Pending Reports',
      value: metrics.pendingReports,
      format: formatNumber,
      icon: <PendingIcon color="warning" />,
      tooltip: 'Number of reports pending submission',
    },
    {
      label: 'Rejected Reports',
      value: metrics.rejectedReports,
      format: formatNumber,
      icon: <CancelIcon color="error" />,
      tooltip: 'Number of reports rejected by the system',
    },
    {
      label: 'Average Processing Time',
      value: metrics.averageProcessingTime,
      format: formatTime,
      icon: <TimerIcon color="info" />,
      tooltip: 'Average time taken to process a report',
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Reporting Metrics
          </Typography>
          <Tooltip title="Report completion rate">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Completion Rate: {getCompletionRate().toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getCompletionRate()}
                sx={{ width: 100 }}
                color={getCompletionRate() >= 90 ? 'success' : 'warning'}
              />
            </Box>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          {metrics_display.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.label}>
              <Tooltip title={metric.tooltip}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.default',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {metric.icon}
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {metric.format(metric.value)}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}; 