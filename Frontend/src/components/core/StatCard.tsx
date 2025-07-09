import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon,
  color,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(color, 0.1),
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        {trend && (
          <Box display="flex" alignItems="center">
            {trend.isPositive ? (
              <TrendingUp
                sx={{
                  color: theme.palette.success.main,
                  mr: 0.5,
                  fontSize: '1.2rem',
                }}
              />
            ) : (
              <TrendingDown
                sx={{
                  color: theme.palette.error.main,
                  mr: 0.5,
                  fontSize: '1.2rem',
                }}
              />
            )}
            <Typography
              variant="body2"
              color={trend.isPositive ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {trend.value}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 