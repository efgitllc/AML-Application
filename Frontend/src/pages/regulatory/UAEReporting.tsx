import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  Visibility,
  Send,
  Schedule,
  CheckCircle,
  Warning
} from '@mui/icons-material';

interface Report {
  id: string;
  title: string;
  type: 'goAML' | 'uaefiu' | 'cbuae' | 'regulatory';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  dueDate: string;
  status: 'draft' | 'pending' | 'submitted' | 'rejected';
  submissionDate?: string;
}

export const UAEReporting: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setReports([
      {
        id: 'REP001',
        title: 'Monthly AML Statistics Report',
        type: 'cbuae',
        frequency: 'monthly',
        dueDate: '2024-01-31',
        status: 'pending'
      },
      {
        id: 'REP002',
        title: 'Suspicious Transaction Report',
        type: 'goAML',
        frequency: 'daily',
        dueDate: '2024-01-25',
        status: 'draft'
      },
      {
        id: 'REP003',
        title: 'Quarterly Compliance Assessment',
        type: 'regulatory',
        frequency: 'quarterly',
        dueDate: '2024-03-31',
        status: 'submitted',
        submissionDate: '2024-01-15'
      }
    ]);
  }, []);

  const handleCreateReport = () => {
    setSelectedReport(null);
    setOpenDialog(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  const handleSubmitReport = (reportId: string) => {
    setLoading(true);
    // TODO: Implement report submission logic
    setTimeout(() => setLoading(false), 1000);
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return <CheckCircle fontSize="small" />;
      case 'pending': return <Schedule fontSize="small" />;
      case 'rejected': return <Warning fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          UAE Central Bank Reporting
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateReport}
        >
          Create Report
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.title}</TableCell>
                <TableCell>
                  <Chip
                    label={report.type.toUpperCase()}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>{report.frequency}</TableCell>
                <TableCell>{report.dueDate}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(report.status)}
                    label={report.status}
                    size="small"
                    color={getStatusColor(report.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => handleEditReport(report)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleSubmitReport(report.id)}
                      disabled={report.status === 'submitted'}
                    >
                      <Send fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <Download fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReport ? 'Edit Report' : 'Create New Report'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Report Title"
              defaultValue={selectedReport?.title}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Report Type"
              defaultValue={selectedReport?.type || 'cbuae'}
              sx={{ mb: 2 }}
            >
              <MenuItem value="cbuae">CBUAE Report</MenuItem>
              <MenuItem value="goAML">goAML Report</MenuItem>
              <MenuItem value="uaefiu">UAE FIU Report</MenuItem>
              <MenuItem value="regulatory">Regulatory Report</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Frequency"
              defaultValue={selectedReport?.frequency || 'monthly'}
              sx={{ mb: 2 }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="annual">Annual</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              defaultValue={selectedReport?.dueDate}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedReport ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 