import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Link,
  Stack,
  Tooltip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import type { UAECBRequirement } from '../../types/uaeCentralBank';

interface UAECBRequirementsProps {
  requirements: UAECBRequirement[];
}

export const UAECBRequirements: React.FC<UAECBRequirementsProps> = ({
  requirements,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reporting':
        return 'primary';
      case 'compliance':
        return 'secondary';
      case 'technical':
        return 'info';
      case 'operational':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'error';
      case 'upcoming':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon color="success" />;
      case 'partial':
        return <WarningIcon color="warning" />;
      case 'non_compliant':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Grid container spacing={3}>
      {requirements.map((requirement) => (
        <Grid item xs={12} key={requirement.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CategoryIcon color={getCategoryColor(requirement.category)} />
                    <Typography variant="h6">
                      {requirement.title}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} mb={2}>
                    <Chip
                      label={requirement.category}
                      color={getCategoryColor(requirement.category)}
                      size="small"
                    />
                    <Chip
                      label={requirement.status}
                      color={getStatusColor(requirement.status)}
                      size="small"
                    />
                    <Chip
                      label={`Priority: ${requirement.priority}`}
                      color={getPriorityColor(requirement.priority)}
                      size="small"
                    />
                  </Stack>

                  <Typography variant="body1" paragraph>
                    {requirement.description}
                  </Typography>

                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Compliance Status
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      {getComplianceIcon(requirement.compliance.status)}
                      <Box flex={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Last checked: {formatDate(requirement.compliance.lastChecked)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Next check: {formatDate(requirement.compliance.nextCheck)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            requirement.compliance.status === 'compliant'
                              ? 100
                              : requirement.compliance.status === 'partial'
                              ? 50
                              : 0
                          }
                          color={
                            requirement.compliance.status === 'compliant'
                              ? 'success'
                              : requirement.compliance.status === 'partial'
                              ? 'warning'
                              : 'error'
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {requirement.compliance.findings.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Findings
                      </Typography>
                      <Stack spacing={1}>
                        {requirement.compliance.findings.map((finding, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <WarningIcon fontSize="small" color="warning" />
                            {finding}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {requirement.documents.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Related Documents
                      </Typography>
                      <Stack spacing={1}>
                        {requirement.documents.map((doc) => (
                          <Box
                            key={doc.id}
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <DescriptionIcon fontSize="small" />
                            <Link
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ flex: 1 }}
                            >
                              {doc.name}
                            </Link>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                href={doc.url}
                                download
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Box ml={3} textAlign="right">
                  <Tooltip title="Days until deadline">
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        textAlign: 'center',
                      }}
                    >
                      <ScheduleIcon color="action" />
                      <Typography variant="h4" color={
                        getDaysUntilDeadline(requirement.deadline) <= 7
                          ? 'error.main'
                          : getDaysUntilDeadline(requirement.deadline) <= 30
                          ? 'warning.main'
                          : 'success.main'
                      }>
                        {getDaysUntilDeadline(requirement.deadline)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        days left
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}; 