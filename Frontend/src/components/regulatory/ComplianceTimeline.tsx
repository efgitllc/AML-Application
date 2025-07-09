import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { ComplianceTask } from '../../types/regulatory';

interface ComplianceTimelineProps {
  tasks: ComplianceTask[];
}

export const ComplianceTimeline: React.FC<ComplianceTimelineProps> = ({ tasks }) => {
  const getPriorityColor = (priority: ComplianceTask['priority']) => {
    switch (priority) {
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

  const getStatusIcon = (status: ComplianceTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in_progress':
        return <ScheduleIcon color="primary" />;
      case 'pending':
        return <WarningIcon color="warning" />;
      default:
        return null;
    }
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Compliance Timeline
        </Typography>

        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                '&:last-child': { mb: 0 },
              }}
            >
              <ListItemIcon>
                {getStatusIcon(task.status)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2">
                      {task.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
                      {task.description}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Tooltip title="Assigned To">
                        <Box display="flex" alignItems="center">
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="caption" ml={0.5}>
                            {task.assignedTo}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Due Date">
                        <Box display="flex" alignItems="center">
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="caption" ml={0.5}>
                            {formatDueDate(task.dueDate)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};