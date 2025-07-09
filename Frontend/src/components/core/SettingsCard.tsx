import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  IconButton,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import { Edit, Info } from '@mui/icons-material';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onEdit?: () => void;
  children: React.ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon,
  onEdit,
  children,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardHeader
        avatar={
          icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )
        }
        action={
          onEdit && (
            <IconButton onClick={onEdit} size="small">
              <Edit fontSize="small" />
            </IconButton>
          )
        }
        title={
          <Typography variant="h6" component="h2" fontWeight="bold">
            {title}
          </Typography>
        }
        subheader={
          description && (
            <Box display="flex" alignItems="center" mt={0.5}>
              <Info sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          )
        }
      />
      <CardContent>{children}</CardContent>
    </Card>
  );
}; 