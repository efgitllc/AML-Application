import React from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import type { DFSAReport } from '../../types/dfsa';

interface DFSAReportsListProps {
  reports: DFSAReport[];
  onUpdateReport: (reportId: string, updates: Partial<DFSAReport>) => Promise<void>;
  onSubmitReport: (reportId: string) => Promise<void>;
  onUploadAttachment: (reportId: string, file: File) => Promise<void>;
  onDeleteAttachment: (reportId: string, attachmentId: string) => Promise<void>;
  onExportReport: (reportId: string, format: 'pdf' | 'excel') => Promise<void>;
}

export const DFSAReportsList: React.FC<DFSAReportsListProps> = ({
  reports,
  onUpdateReport,
  onSubmitReport,
  onUploadAttachment,
  onDeleteAttachment,
  onExportReport,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && selectedReportId) {
      await onUploadAttachment(selectedReportId, event.target.files[0]);
      event.target.value = '';
    }
  };

  const triggerFileUpload = (reportId: string) => {
    setSelectedReportId(reportId);
    fileInputRef.current?.click();
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell>Attachments</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <Chip
                    label={report.type.replace('_', ' ')}
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
                  {report.submissionDate ? formatDate(report.submissionDate) : '-'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {report.attachments.map((attachment) => (
                      <Tooltip
                        key={attachment.id}
                        title={`${attachment.name} (${attachment.size} bytes)`}
                      >
                        <Chip
                          label={attachment.name}
                          size="small"
                          onDelete={() => onDeleteAttachment(report.id, attachment.id)}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
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
                    <Tooltip title="Export as PDF">
                      <IconButton
                        size="small"
                        onClick={() => onExportReport(report.id, 'pdf')}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    {report.status === 'draft' && (
                      <Tooltip title="Submit Report">
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<SendIcon />}
                          onClick={() => onSubmitReport(report.id)}
                        >
                          Submit
                        </Button>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 