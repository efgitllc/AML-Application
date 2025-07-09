import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { dubaiService } from '../../services/dubai.service';
import type { DNFBPCompliance as DNFBPComplianceType } from '../../types/dubai';

const BUSINESS_TYPES = [
  'REAL_ESTATE',
  'PRECIOUS_METALS',
  'LEGAL_SERVICES',
  'ACCOUNTING_SERVICES',
  'TRUST_SERVICES',
  'COMPANY_SERVICES',
];

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

export const DNFBPCompliance: React.FC<{ businessId: string }> = ({ businessId }) => {
  const [compliance, setCompliance] = useState<DNFBPComplianceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DNFBPComplianceType>>({});

  useEffect(() => {
    fetchCompliance();
  }, [businessId]);

  const fetchCompliance = async () => {
    try {
      setLoading(true);
      const result = await dubaiService.getDNFBPCompliance(businessId);
      setCompliance(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch DNFBP compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessment = async () => {
    try {
      setLoading(true);
      const result = await dubaiService.assessDNFBPCompliance({
        ...formData,
        businessId,
      });
      setCompliance(result);
      setDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">DNFBP Compliance Status</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDialogOpen(true)}
            >
              New Assessment
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {compliance && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Business Type</Typography>
                <Typography>{compliance.businessType}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Risk Level</Typography>
                <Chip
                  label={compliance.riskLevel}
                  color={getRiskLevelColor(compliance.riskLevel) as any}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Registration Number</Typography>
                <Typography>{compliance.registrationNumber}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">License Number</Typography>
                <Typography>{compliance.licenseNumber}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Last Assessment</Typography>
                <Typography>
                  {new Date(compliance.lastAssessmentDate).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Next Assessment Due</Typography>
                <Typography>
                  {new Date(compliance.nextAssessmentDate).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Compliance Status</Typography>
                <Chip
                  label={compliance.complianceStatus}
                  color={compliance.complianceStatus === 'COMPLIANT' ? 'success' : 'error'}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New DNFBP Assessment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Business Type"
                name="businessType"
                value={formData.businessType || ''}
                onChange={handleInputChange}
              >
                {BUSINESS_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Risk Level"
                name="riskLevel"
                value={formData.riskLevel || ''}
                onChange={handleInputChange}
              >
                {RISK_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Registration Number"
                name="registrationNumber"
                value={formData.registrationNumber || ''}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssessment} variant="contained" disabled={loading}>
            Submit Assessment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 