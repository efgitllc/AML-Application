import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
} from '@mui/material';
import { EmiratesIDVerification } from './EmiratesIDVerification';
import { ShariaCompliance } from './ShariaCompliance';
import { DNFBPCompliance } from './DNFBPCompliance';
import { useDubaiRegulatory } from '../../hooks/useDubaiRegulatory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dubai-regulatory-tabpanel-${index}`}
      aria-labelledby={`dubai-regulatory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const DubaiRegulatoryDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const {
    loading,
    error,
    reports,
    riskAssessment,
    beneficialOwners,
    submitReport,
    performRiskAssessment,
    addBeneficialOwner,
  } = useDubaiRegulatory();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dubai Regulatory Compliance Dashboard
      </Typography>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Emirates ID Verification" />
          <Tab label="Sharia Compliance" />
          <Tab label="DNFBP Compliance" />
          <Tab label="Regulatory Reports" />
          <Tab label="Risk Assessment" />
          <Tab label="Beneficial Owners" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <EmiratesIDVerification />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ShariaCompliance transactionId="example-transaction-id" />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DNFBPCompliance businessId="example-business-id" />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Regulatory Reports
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <Box>
                  {reports.map((report) => (
                    <Paper key={report.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1">
                        {report.regulationType} Report
                      </Typography>
                      <Typography variant="body2">
                        Period: {report.reportingPeriod}
                      </Typography>
                      <Typography variant="body2">
                        Status: {report.status}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Risk Assessment
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : riskAssessment && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    Risk Category: {riskAssessment.riskCategory}
                  </Typography>
                  <Typography variant="body2">
                    Risk Score: {riskAssessment.riskScore}
                  </Typography>
                  <Typography variant="body2">
                    Assessment Date: {new Date(riskAssessment.assessmentDate).toLocaleDateString()}
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Beneficial Owners
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <Box>
                  {beneficialOwners.map((owner) => (
                    <Paper key={owner.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1">
                        {owner.name}
                      </Typography>
                      <Typography variant="body2">
                        Ownership: {owner.ownershipPercentage}%
                      </Typography>
                      <Typography variant="body2">
                        Status: {owner.verificationStatus}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}; 