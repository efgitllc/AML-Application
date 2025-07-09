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
} from '@mui/material';
import { useDFSA } from '../../hooks/useDFSA';
import { DFSAMetricsCard } from '../../components/regulatory/DFSAMetricsCard';
import { DFSAComplianceStatus } from '../../components/regulatory/DFSAComplianceStatus';
import { DFSAReportsList } from '../../components/regulatory/DFSAReportsList';
import { DFSANotifications } from '../../components/regulatory/DFSANotifications';
import { DFSARequirements } from '../../components/regulatory/DFSARequirements';
import { CreateReportDialog } from '../../components/regulatory/CreateReportDialog';

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

export const DFSADashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isCreateReportOpen, setCreateReportOpen] = useState(false);

  const {
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
    refreshData,
  } = useDFSA({
    autoFetch: true,
    period: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      end: new Date().toISOString(),
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
              DFSA Compliance Dashboard
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateReportOpen(true)}
            >
              Create New Report
            </Button>
          </Box>
        </Grid>

        {/* Metrics Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            {metrics && <DFSAMetricsCard metrics={metrics} />}
          </Paper>
        </Grid>

        {/* Compliance Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            {complianceStatus && (
              <DFSAComplianceStatus
                status={complianceStatus}
                onUpdateFinding={updateFinding}
              />
            )}
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <DFSANotifications
              notifications={notifications}
              onMarkRead={markNotificationRead}
            />
          </Paper>
        </Grid>

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
              <DFSAReportsList
                reports={reports}
                onUpdateReport={updateReport}
                onSubmitReport={submitReport}
                onUploadAttachment={uploadReportAttachment}
                onDeleteAttachment={deleteReportAttachment}
                onExportReport={exportReportFile}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <DFSARequirements requirements={requirements} />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Report Dialog */}
      <CreateReportDialog
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