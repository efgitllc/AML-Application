import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  alpha,
  Card,
  CardContent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  AttachMoney,
  Warning,
  People,
  Security,
  Timeline,
  DonutLarge,
  BarChart,
  TrendingUp,
} from '@mui/icons-material';
import { Chart } from '../../components/core/Chart';
import { StatCard } from '../../components/core/StatCard';
import { mockAnalyticsData, mockDashboardStats, mockMetricCards } from '../../mocks/data';
import type { MetricCard } from '../../types/analytics';

const timeRanges = ['24h', '7d', '30d', '90d', 'YTD', '1y'] as const;

const Analytics = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<typeof timeRanges[number]>('30d');

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: typeof timeRanges[number] | null
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const transactionVolumeData = {
    labels: mockDashboardStats.transactionVolume.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [{
      label: 'Transaction Volume',
      data: mockDashboardStats.transactionVolume.map(item => item.value),
      fill: true,
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      tension: 0.4,
    }],
  };

  const riskDistributionData = {
    labels: mockDashboardStats.riskDistribution.map(item => item.name),
    datasets: [{
      data: mockDashboardStats.riskDistribution.map(item => item.value),
      backgroundColor: [
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
      ],
    }],
  };

  const alertsByTypeData = {
    labels: Object.keys(mockAnalyticsData.metrics.alertsByType),
    datasets: [{
      data: Object.values(mockAnalyticsData.metrics.alertsByType),
      backgroundColor: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.warning.main,
        theme.palette.info.main,
      ],
    }],
  };

  const riskTrendsData = {
    labels: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Low Risk',
        data: mockAnalyticsData.metrics.riskTrends.map(trend => trend.lowRisk),
        borderColor: theme.palette.success.main,
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        fill: true,
      },
      {
        label: 'Medium Risk',
        data: mockAnalyticsData.metrics.riskTrends.map(trend => trend.mediumRisk),
        borderColor: theme.palette.warning.main,
        backgroundColor: alpha(theme.palette.warning.main, 0.1),
        fill: true,
      },
      {
        label: 'High Risk',
        data: mockAnalyticsData.metrics.riskTrends.map(trend => trend.highRisk),
        borderColor: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        fill: true,
      },
    ],
  };

  const getColorForRiskLevel = (level: MetricCard['color']) => {
    switch (level) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive analysis of AML metrics and trends
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          aria-label="time range"
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            '& .MuiToggleButton-root.Mui-selected': {
              bgcolor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            },
          }}
        >
          {timeRanges.map((range) => (
            <ToggleButton key={range} value={range}>
              {range}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Metric Cards */}
        {mockMetricCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <StatCard
              title={card.title}
              value={card.value}
              trend={card.change ? {
                value: Math.abs(card.change),
                isPositive: card.changeType === 'increase'
              } : undefined}
              icon={
                card.title.includes('Transaction') ? <AttachMoney /> :
                card.title.includes('Risk') ? <Warning /> :
                card.title.includes('Customer') ? <People /> :
                <Security />
              }
              color={getColorForRiskLevel(card.color)}
            />
          </Grid>
        ))}

        {/* Transaction Volume Chart */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              height: '100%',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Timeline sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Transaction Volume Trend</Typography>
              </Box>
              <Chart
                type="line"
                data={transactionVolumeData}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: alpha(theme.palette.divider, 0.1),
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Distribution Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Card
            sx={{
              height: '100%',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DonutLarge sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Risk Distribution</Typography>
              </Box>
              <Chart
                type="doughnut"
                data={riskDistributionData}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts by Type Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BarChart sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Alerts by Type</Typography>
              </Box>
              <Chart
                type="bar"
                data={alertsByTypeData}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: alpha(theme.palette.divider, 0.1),
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Trends Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Risk Trends</Typography>
              </Box>
              <Chart
                type="line"
                data={riskTrendsData}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: alpha(theme.palette.divider, 0.1),
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export { Analytics };
export default Analytics; 