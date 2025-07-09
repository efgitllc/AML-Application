import React from 'react';
import { Box, Grid, Typography, Paper, Card, CardContent, CardHeader } from '@mui/material';
import { ComplianceTimeline } from '../../components/regulatory/ComplianceTimeline';
import { AlertsOverview } from '../../components/regulatory/AlertsOverview';
import { CreateReportDialog } from '../../components/regulatory/CreateReportDialog';

export const RegulatoryCompliance: React.FC = () => {
  const [openReportDialog, setOpenReportDialog] = React.useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Regulatory Compliance
      </Typography>
      
      <Grid container spacing={3}>
        {/* Compliance Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Compliance Overview
            </Typography>
            <ComplianceTimeline />
          </Paper>
        </Grid>

        {/* Alerts Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Compliance Alerts" />
            <CardContent>
              <AlertsOverview />
            </CardContent>
          </Card>
        </Grid>

        {/* Regulatory Frameworks */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="DFSA Compliance" />
                <CardContent>
                  <Typography>
                    Dubai Financial Services Authority regulatory framework compliance status and requirements.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="UAE Central Bank" />
                <CardContent>
                  <Typography>
                    UAE Central Bank compliance requirements and reporting status.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="DNFBP Compliance" />
                <CardContent>
                  <Typography>
                    Designated Non-Financial Businesses and Professions compliance overview.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <CreateReportDialog
        open={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
        onSubmit={() => {
          // Handle report submission
          setOpenReportDialog(false);
        }}
      />
    </Box>
  );
}; 