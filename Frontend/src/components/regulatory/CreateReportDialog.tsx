import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DFSAReport } from '../../types/dfsa';

interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<DFSAReport, 'id'>) => Promise<void>;
}

export const CreateReportDialog: React.FC<CreateReportDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    type: 'quarterly',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.startDate || !formData.endDate) return;

    try {
      setLoading(true);
      await onSubmit({
        type: formData.type as DFSAReport['type'],
        status: 'draft',
        reportingPeriod: {
          start: formData.startDate.toISOString(),
          end: formData.endDate.toISOString(),
        },
        metrics: {
          totalAssets: 0,
          totalLiabilities: 0,
          capitalAdequacyRatio: 0,
          liquidityRatio: 0,
          suspiciousTransactions: 0,
          highRiskCustomers: 0,
          pendingKycUpdates: 0,
          sanctionsScreeningAlerts: 0,
        },
        riskAssessment: {
          overallRisk: 'low',
          categories: {
            operationalRisk: 0,
            creditRisk: 0,
            marketRisk: 0,
            complianceRisk: 0,
            reputationalRisk: 0,
          },
        },
        complianceChecklist: [],
        attachments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'quarterly',
      startDate: null,
      endDate: null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New DFSA Report</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Report Type"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    <MenuItem value="quarterly">Quarterly Report</MenuItem>
                    <MenuItem value="annual">Annual Report</MenuItem>
                    <MenuItem value="ad_hoc">Ad Hoc Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, startDate: date }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, endDate: date }))
                  }
                  minDate={formData.startDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.startDate || !formData.endDate}
          >
            Create Report
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 