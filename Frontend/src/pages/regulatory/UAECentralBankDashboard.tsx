import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useUAECB } from '../../hooks/useUAECB';
import { UAECBMetricsCard } from '../../components/regulatory/UAECBMetricsCard';
import { UAECBReportsList } from '../../components/regulatory/UAECBReportsList';
import { UAECBRequirements } from '../../components/regulatory/UAECBRequirements';
import { CreateUAECBReportDialog } from '../../components/regulatory/CreateUAECBReportDialog';
import { GoAMLStatusCard } from '../../components/regulatory/GoAMLStatusCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

export const UAECentralBankDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isCreateReportOpen, setCreateReportOpen] = useState(false);

  const {
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
    refreshData,
  } = useUAECB({
    autoFetch: true,
    period: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      end: new Date().toISOString(),
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSyncWithGoAML = async () => {
    try {
      await syncWithGoAML();
      refreshData();
    } catch (error) {
      console.error('Failed to sync with goAML:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              UAE Central Bank Reporting
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleSyncWithGoAML}
                disabled={!goAMLStatus?.connected}
              >
                Sync with goAML
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCreateReportOpen(true)}
              >
                Create New Report
              </Button>
            </Stack>
          </Box>
        </Grid>

        {/* Metrics Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            {metrics && <UAECBMetricsCard metrics={metrics} />}
          </Paper>
        </Grid>

        {/* goAML Integration Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            {goAMLStatus && <GoAMLStatusCard status={goAMLStatus} />}
          </Paper>
        </Grid>

        {/* Pending Actions */}
        {metrics && metrics.pendingReports > 0 && (
          <Grid item xs={12}>
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              action={
                <Button color="inherit" size="small">
                  View All
                </Button>
              }
            >
              You have {metrics.pendingReports} pending reports that require attention
            </Alert>
          </Grid>
        )}

        {/* Tabbed Content */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Reports" />
              <Tab label="Requirements" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <UAECBReportsList
                reports={reports}
                onUpdateReport={updateReport}
                onSubmitReport={submitReport}
                onValidateReport={validateReport}
                onUploadAttachment={uploadAttachment}
                onAddComment={addComment}
                onSubmitBatch={submitBatchReports}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <UAECBRequirements requirements={requirements} />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Report Dialog */}
      <CreateUAECBReportDialog
        open={isCreateReportOpen}
        onClose={() => setCreateReportOpen(false)}
        onSubmit={async (reportData) => {
          await createReport(reportData);
          setCreateReportOpen(false);
          refreshData();
        }}
      />
    </Box>
  );
}; 