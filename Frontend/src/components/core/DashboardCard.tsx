import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, useTheme } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import type { MetricCard } from '../../types';

interface DashboardCardProps extends MetricCard {
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
}) => {
  const theme = useTheme();

  return (
    <Card
      className={className}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
          </Box>
          <IconButton
            sx={{
              backgroundColor: theme.palette.primary.main + '10',
              borderRadius: 2,
              p: 1,
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '20',
              },
            }}
          >
            {icon}
          </IconButton>
        </Box>

        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2,
              p: 1,
              borderRadius: 1,
              backgroundColor: trend.isPositive
                ? theme.palette.success.main + '10'
                : theme.palette.error.main + '10',
            }}
          >
            {trend.isPositive ? (
              <ArrowUpward
                sx={{
                  fontSize: 16,
                  color: 'success.main',
                  mr: 0.5,
                }}
              />
            ) : (
              <ArrowDownward
                sx={{
                  fontSize: 16,
                  color: 'error.main',
                  mr: 0.5,
                }}
              />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend.isPositive
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontWeight: 500,
              }}
            >
              {trend.value}% {trend.isPositive ? 'increase' : 'decrease'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 