import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Box,
  Tooltip,
} from '@mui/material';
import type { RiskMetrics } from '../../types/regulatory';

interface RiskMetricsCardProps {
  metrics: RiskMetrics;
}

export const RiskMetricsCard: React.FC<RiskMetricsCardProps> = ({ metrics }) => {
  const getProgressColor = (value: number) => {
    if (value <= 30) return 'success';
    if (value <= 70) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Risk Metrics
        </Typography>

        <Grid container spacing={2}>
          {/* KYC Compliance */}
          <Grid component="div" item xs={12}>
            <Tooltip title={`${metrics.kycCompliance}% of customers have completed KYC`}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  KYC Compliance
                </Typography>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1} mr={1}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.kycCompliance}
                      color={getProgressColor(100 - metrics.kycCompliance)}
                    />
                  </Box>
                  <Typography variant="body2">
                    {metrics.kycCompliance}%
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          </Grid>

          {/* Transaction Monitoring */}
          <Grid component="div" item xs={12}>
            <Tooltip title={`${metrics.transactionMonitoring}% alerts reviewed`}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Transaction Monitoring
                </Typography>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1} mr={1}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.transactionMonitoring}
                      color={getProgressColor(100 - metrics.transactionMonitoring)}
                    />
                  </Box>
                  <Typography variant="body2">
                    {metrics.transactionMonitoring}%
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          </Grid>

          {/* Regulatory Reporting */}
          <Grid component="div" item xs={12}>
            <Tooltip title={`${metrics.regulatoryReporting}% reports submitted on time`}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Regulatory Reporting
                </Typography>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1} mr={1}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.regulatoryReporting}
                      color={getProgressColor(100 - metrics.regulatoryReporting)}
                    />
                  </Box>
                  <Typography variant="body2">
                    {metrics.regulatoryReporting}%
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          </Grid>

          {/* Risk Assessment */}
          <Grid component="div" item xs={12}>
            <Tooltip title={`${metrics.riskAssessment}% customers with updated risk assessment`}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Risk Assessment
                </Typography>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1} mr={1}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.riskAssessment}
                      color={getProgressColor(100 - metrics.riskAssessment)}
                    />
                  </Box>
                  <Typography variant="body2">
                    {metrics.riskAssessment}%
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};