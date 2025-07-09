import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { dubaiService } from '../../services/dubai.service';
import type { ShariaCompliance as ShariaComplianceType } from '../../types/dubai';

export const ShariaCompliance: React.FC<{ transactionId: string }> = ({ transactionId }) => {
  const [compliance, setCompliance] = useState<ShariaComplianceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        const result = await dubaiService.getShariaCompliance(transactionId);
        setCompliance(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch compliance data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompliance();
  }, [transactionId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!compliance) {
    return (
      <Alert severity="info">
        No compliance data available for this transaction.
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'success';
      case 'NON_COMPLIANT':
        return 'error';
      case 'REVIEW_NEEDED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Sharia Compliance Review
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="subtitle1">Status:</Typography>
              <Chip
                label={compliance.complianceStatus}
                color={getStatusColor(compliance.complianceStatus) as any}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Review Date</Typography>
            <Typography>
              {new Date(compliance.reviewDate).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Reviewed By</Typography>
            <Typography>{compliance.reviewedBy}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Sharia Board</Typography>
            <Typography>{compliance.shariaBoard}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2">Comments</Typography>
            <Typography>{compliance.comments}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2">Requirements</Typography>
            <List>
              {compliance.requirements.map((requirement, index) => (
                <ListItem key={index}>
                  <ListItemText primary={requirement} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 