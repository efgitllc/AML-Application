import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { GoAMLIntegrationStatus } from '../../types/uaeCentralBank';

interface GoAMLStatusCardProps {
  status: GoAMLIntegrationStatus;
}

export const GoAMLStatusCard: React.FC<GoAMLStatusCardProps> = ({ status }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hours ago`;
    } else {
      return date.toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            goAML Integration Status
          </Typography>
          <Chip
            icon={status.connected ? <CheckCircleIcon /> : <ErrorIcon />}
            label={status.connected ? 'Connected' : 'Disconnected'}
            color={status.connected ? 'success' : 'error'}
            size="small"
          />
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Last Synchronization
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body1">
              {formatDate(status.lastSync)}
            </Typography>
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pending Submissions
          </Typography>
          <Typography variant="h4" color={status.pendingSubmissions > 0 ? 'warning.main' : 'success.main'}>
            {status.pendingSubmissions}
          </Typography>
        </Box>

        {status.errors.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Recent Errors
            </Typography>
            <List dense>
              <Divider />
              {status.errors.map((error, index) => (
                <React.Fragment key={`${error.code}-${index}`}>
                  <ListItem>
                    <ListItemText
                      primary={error.message}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={error.code}
                            size="small"
                            color="error"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(error.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 