import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import type { DFSAMetrics } from '../../types/dfsa';

interface DFSAMetricsCardProps {
  metrics: DFSAMetrics;
}

export const DFSAMetricsCard: React.FC<DFSAMetricsCardProps> = ({ metrics }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getProgressColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'success';
    if (value >= threshold * 0.8) return 'warning';
    return 'error';
  };

  const metrics_display = [
    {
      label: 'Capital Adequacy Ratio',
      value: metrics.capitalAdequacyRatio,
      format: formatPercentage,
      threshold: 12, // DFSA minimum requirement
      tooltip: 'Minimum requirement: 12%',
    },
    {
      label: 'Liquidity Ratio',
      value: metrics.liquidityRatio,
      format: formatPercentage,
      threshold: 100,
      tooltip: 'Minimum requirement: 100%',
    },
    {
      label: 'Suspicious Transactions',
      value: metrics.suspiciousTransactions,
      format: formatNumber,
      tooltip: 'Number of suspicious transactions detected',
    },
    {
      label: 'High Risk Customers',
      value: metrics.highRiskCustomers,
      format: formatNumber,
      tooltip: 'Number of high-risk customers',
    },
    {
      label: 'Pending KYC Updates',
      value: metrics.pendingKycUpdates,
      format: formatNumber,
      tooltip: 'Number of customers requiring KYC update',
    },
    {
      label: 'Sanctions Screening Alerts',
      value: metrics.sanctionsScreeningAlerts,
      format: formatNumber,
      tooltip: 'Number of active sanctions screening alerts',
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          DFSA Compliance Metrics
        </Typography>
        <Grid container spacing={3}>
          {metrics_display.map((metric) => (
            <Grid item xs={12} sm={6} md={4} key={metric.label}>
              <Tooltip title={metric.tooltip} placement="top">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    {metric.label}
                  </Typography>
                  <Typography variant="h6">
                    {metric.format(metric.value)}
                  </Typography>
                  {metric.threshold && (
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((metric.value / metric.threshold) * 100, 100)}
                      color={getProgressColor(metric.value, metric.threshold)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}; 