import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import type { ComplianceAlert } from '../../types/regulatory';

interface AlertsOverviewProps {
  alerts: ComplianceAlert[];
}

export const AlertsOverview: React.FC<AlertsOverviewProps> = ({ alerts }) => {
  const getSeverityIcon = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Alerts
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Severity</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Related Entity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getSeverityIcon(alert.severity)}
                      <Chip
                        size="small"
                        label={alert.severity}
                        color={getSeverityColor(alert.severity)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={alert.type}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {alert.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={alert.status}
                      color={
                        alert.status === 'resolved'
                          ? 'success'
                          : alert.status === 'in_review'
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTimestamp(alert.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {alert.relatedEntity && (
                      <Tooltip title={`${alert.relatedEntity.type}: ${alert.relatedEntity.name}`}>
                        <IconButton size="small" color="primary">
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
