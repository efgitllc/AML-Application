import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Button,
  Stack,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import type { UAECBReport, UAECBSubmissionResult } from '../../types/uaeCentralBank';

interface UAECBReportsListProps {
  reports: UAECBReport[];
  onUpdateReport: (reportId: string, updates: Partial<UAECBReport>) => Promise<void>;
  onSubmitReport: (reportId: string) => Promise<UAECBSubmissionResult>;
  onValidateReport: (reportId: string) => Promise<UAECBSubmissionResult>;
  onUploadAttachment: (reportId: string, file: File) => Promise<void>;
  onAddComment: (reportId: string, comment: { content: string; type: 'internal' | 'regulatory' }) => Promise<void>;
  onSubmitBatch: (reportIds: string[]) => Promise<UAECBSubmissionResult[]>;
}

export const UAECBReportsList: React.FC<UAECBReportsListProps> = ({
  reports,
  onUpdateReport,
  onSubmitReport,
  onValidateReport,
  onUploadAttachment,
  onAddComment,
  onSubmitBatch,
}) => {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [fileUploadId, setFileUploadId] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentReportId, setCommentReportId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [validationResults, setValidationResults] = useState<Record<string, UAECBSubmissionResult>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && fileUploadId) {
      await onUploadAttachment(fileUploadId, event.target.files[0]);
      event.target.value = '';
      setFileUploadId(null);
    }
  };

  const triggerFileUpload = (reportId: string) => {
    setFileUploadId(reportId);
    fileInputRef.current?.click();
  };

  const handleCommentSubmit = async () => {
    if (commentReportId && comment.trim()) {
      await onAddComment(commentReportId, {
        content: comment,
        type: 'internal',
      });
      setCommentDialogOpen(false);
      setCommentReportId(null);
      setComment('');
    }
  };

  const handleValidate = async (reportId: string) => {
    const result = await onValidateReport(reportId);
    setValidationResults(prev => ({
      ...prev,
      [reportId]: result,
    }));
  };

  const handleSubmit = async (reportId: string) => {
    await handleValidate(reportId);
    const validationResult = validationResults[reportId];
    
    if (!validationResult?.validationErrors?.some(error => error.severity === 'error')) {
      await onSubmitReport(reportId);
    }
  };

  const handleBatchSubmit = async () => {
    const validationPromises = selectedReports.map(handleValidate);
    await Promise.all(validationPromises);

    const validReports = selectedReports.filter(
      reportId => !validationResults[reportId]?.validationErrors?.some(error => error.severity === 'error')
    );

    if (validReports.length > 0) {
      await onSubmitBatch(validReports);
      setSelectedReports([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'info';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Reports
        </Typography>
        {selectedReports.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleBatchSubmit}
          >
            Submit Selected ({selectedReports.length})
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedReports.length > 0 && selectedReports.length < reports.length}
                  checked={selectedReports.length === reports.length}
                  onChange={(event) =>
                    setSelectedReports(
                      event.target.checked
                        ? reports.map((r) => r.id)
                        : []
                    )
                  }
                />
              </TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Validation</TableCell>
              <TableCell>goAML Reference</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onChange={(event) =>
                      setSelectedReports(
                        event.target.checked
                          ? [...selectedReports, report.id]
                          : selectedReports.filter((id) => id !== report.id)
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.reportType}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  {formatDate(report.reportingPeriod.start)} - {formatDate(report.reportingPeriod.end)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    size="small"
                    color={getStatusColor(report.status)}
                  />
                </TableCell>
                <TableCell>
                  {validationResults[report.id] && (
                    validationResults[report.id].validationErrors?.some(error => error.severity === 'error')
                      ? <Tooltip title="Validation failed">
                          <ErrorIcon color="error" />
                        </Tooltip>
                      : <Tooltip title="Validation passed">
                          <CheckCircleIcon color="success" />
                        </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  {report.goAMLReference || '-'}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Edit Report">
                      <IconButton
                        size="small"
                        onClick={() => onUpdateReport(report.id, {})}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Upload Attachment">
                      <IconButton
                        size="small"
                        onClick={() => triggerFileUpload(report.id)}
                      >
                        <CloudUploadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Comment">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCommentReportId(report.id);
                          setCommentDialogOpen(true);
                        }}
                      >
                        <CommentIcon />
                      </IconButton>
                    </Tooltip>
                    {report.status === 'draft' && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleValidate(report.id)}
                        >
                          Validate
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<SendIcon />}
                          onClick={() => handleSubmit(report.id)}
                        >
                          Submit
                        </Button>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={commentDialogOpen}
        onClose={() => {
          setCommentDialogOpen(false);
          setCommentReportId(null);
          setComment('');
        }}
      >
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCommentSubmit} variant="contained" color="primary">
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 