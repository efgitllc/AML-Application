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
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import type { DFSARequirement } from '../../types/dfsa';

interface DFSARequirementsProps {
  requirements: DFSARequirement[];
}

export const DFSARequirements: React.FC<DFSARequirementsProps> = ({
  requirements,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prudential':
        return 'primary';
      case 'conduct':
        return 'secondary';
      case 'aml_cft':
        return 'error';
      case 'reporting':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'warning';
      case 'archived':
        return 'default';
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

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'one_time':
        return 'One-time';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'annual':
        return 'Annual';
      default:
        return frequency;
    }
  };

  return (
    <Grid container spacing={3}>
      {requirements.map((requirement) => (
        <Grid item xs={12} key={requirement.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CategoryIcon color={getCategoryColor(requirement.category)} />
                    <Typography variant="h6">
                      {requirement.title}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} mb={2}>
                    <Chip
                      label={requirement.category.replace('_', ' ')}
                      color={getCategoryColor(requirement.category)}
                      size="small"
                    />
                    <Chip
                      label={requirement.status}
                      color={getStatusColor(requirement.status)}
                      size="small"
                    />
                    {requirement.frequency && (
                      <Chip
                        icon={<ScheduleIcon />}
                        label={getFrequencyLabel(requirement.frequency)}
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>
                {requirement.deadline && (
                  <Tooltip title="Deadline">
                    <Chip
                      icon={<ScheduleIcon />}
                      label={formatDate(requirement.deadline)}
                      color="warning"
                      size="small"
                    />
                  </Tooltip>
                )}
              </Box>

              <Typography variant="body1" paragraph>
                {requirement.description}
              </Typography>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Applicable to:
                </Typography>
                <Stack direction="row" spacing={1} mb={2}>
                  {requirement.applicability.map((item, index) => (
                    <Chip key={index} label={item} size="small" />
                  ))}
                </Stack>
              </Box>

              {requirement.documents.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Related Documents:
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

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={2}
              >
                Last updated: {formatDate(requirement.lastUpdated)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}; 