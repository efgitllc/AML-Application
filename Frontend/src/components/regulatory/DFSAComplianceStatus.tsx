import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import type { DFSAComplianceStatus } from '../../types/dfsa';

interface DFSAComplianceStatusProps {
  status: DFSAComplianceStatus;
  onUpdateFinding: (findingId: string, status: string) => Promise<void>;
}

export const DFSAComplianceStatus: React.FC<DFSAComplianceStatusProps> = ({
  status,
  onUpdateFinding,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedFinding, setSelectedFinding] = React.useState<string | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, findingId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedFinding(findingId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFinding(null);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (selectedFinding) {
      await onUpdateFinding(selectedFinding, newStatus);
      handleMenuClose();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle color="success" />;
      case 'non_compliant':
        return <Error color="error" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'non_compliant':
        return 'error';
      case 'pending_review':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical':
        return 'error';
      case 'major':
        return 'warning';
      case 'minor':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {getStatusIcon(status.status)}
          <Typography variant="h6" sx={{ ml: 1 }}>
            Overall Compliance Status
          </Typography>
          <Chip
            label={status.status.replace('_', ' ')}
            color={getStatusColor(status.status)}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          Last Assessment: {new Date(status.lastAssessment).toLocaleDateString()}
          <br />
          Next Assessment Due: {new Date(status.nextAssessmentDue).toLocaleDateString()}
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Findings ({status.findings.length})
        </Typography>

        <List>
          {status.findings.map((finding) => (
            <ListItem
              key={finding.id}
              secondaryAction={
                <Box display="flex" alignItems="center">
                  <Chip
                    label={finding.status.replace('_', ' ')}
                    color={getStatusColor(finding.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuClick(e, finding.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Chip
                      label={finding.category}
                      color={getCategoryColor(finding.category)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Tooltip title={`Due: ${new Date(finding.dueDate).toLocaleDateString()}`}>
                      <Typography variant="body1">
                        {finding.description}
                      </Typography>
                    </Tooltip>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleStatusUpdate('open')}>
            Mark as Open
          </MenuItem>
          <MenuItem onClick={() => handleStatusUpdate('in_progress')}>
            Mark as In Progress
          </MenuItem>
          <MenuItem onClick={() => handleStatusUpdate('closed')}>
            Mark as Closed
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}; 