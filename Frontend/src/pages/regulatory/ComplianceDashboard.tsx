import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Assessment,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useRegulatoryCompliance } from '../../hooks/useRegulatoryCompliance';
import type { ComplianceStatus } from '../../types/regulatory';
import { RiskMetricsCard } from '../../components/regulatory/RiskMetricsCard';
import { ComplianceTimeline } from '../../components/regulatory/ComplianceTimeline';
import { AlertsOverview } from '../../components/regulatory/AlertsOverview';

export const ComplianceDashboard: React.FC = () => {
  const {
    complianceStatus,
    riskMetrics,
    pendingTasks,
    recentAlerts,
    loading,
    error,
    refreshData,
  } = useRegulatoryCompliance();

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'partial':
        return 'warning';
      case 'non_compliant':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!complianceStatus || !riskMetrics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No compliance data available.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          UAE/Dubai Regulatory Compliance Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Assessment />}
          onClick={refreshData}
        >
          Refresh Data
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Overall Compliance Status */}
        <Grid component="div" item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Compliance Status
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={complianceStatus.status}
                color={getStatusColor(complianceStatus.status)}
                icon={complianceStatus.status === 'compliant' ? <CheckCircle /> : <Warning />}
              />
              <Typography>
                Last Updated: {new Date(complianceStatus.lastUpdated).toLocaleString()}
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Risk Metrics */}
        <Grid component="div" item xs={12} md={6}>
          <RiskMetricsCard metrics={riskMetrics} />
        </Grid>

        {/* Compliance Timeline */}
        <Grid component="div" item xs={12} md={6}>
          <ComplianceTimeline tasks={pendingTasks} />
        </Grid>

        {/* Recent Alerts */}
        <Grid component="div" item xs={12}>
          <AlertsOverview alerts={recentAlerts} />
        </Grid>
      </Grid>
    </Box>
  );
};
