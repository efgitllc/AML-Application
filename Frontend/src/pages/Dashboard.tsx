import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Button,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  FolderSpecial,
  Person,
  FilterList,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { mockTransactions, mockAlerts } from '../mocks/data';
import { DashboardCard } from '../components/core/DashboardCard';
import type { MetricCard, Alert, Transaction } from '../types';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#dc2626'];

export const Dashboard = () => {
  const theme = useTheme();

  // Process transaction data for the chart
  const transactionData = mockTransactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30)
    .map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      amount: t.amount,
      volume: Math.round(t.amount * 0.8), // Simulated volume data
    }));

  // Process alert data for the pie chart
  const alertDistribution = [
    { name: 'High', value: mockAlerts.filter(a => a.severity === 'high').length },
    { name: 'Medium', value: mockAlerts.filter(a => a.severity === 'medium').length },
    { name: 'Low', value: mockAlerts.filter(a => a.severity === 'low').length },
    { name: 'Critical', value: mockAlerts.filter(a => a.severity === 'critical').length },
  ];

  const summaryCards = [
    {
      title: 'Total Transactions',
      value: mockTransactions.length.toLocaleString(),
      icon: <TrendingUp color="primary" />,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Active Alerts',
      value: mockAlerts.filter(a => a.status === 'new').length.toLocaleString(),
      icon: <Warning color="warning" />,
      trend: { value: 8, isPositive: false }
    },
    {
      title: 'Open Cases',
      value: '23',
      icon: <FolderSpecial color="info" />,
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'High Risk Customers',
      value: '15',
      icon: <Person color="error" />,
      trend: { value: 3, isPositive: false }
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Dashboard Overview
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton size="small" sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FilterList />}
            sx={{ boxShadow: 'none' }}
          >
            Filter
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <DashboardCard {...card} />
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Transaction Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last 30 days performance
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transactionData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="date"
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      boxShadow: theme.shadows[2],
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    name="Amount"
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke={theme.palette.secondary.main}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                    name="Volume"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Alert Distribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By severity level
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={alertDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill={theme.palette.primary.main}
                    paddingAngle={2}
                  >
                    {alertDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      boxShadow: theme.shadows[2],
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span style={{ color: theme.palette.text.primary }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recent Alerts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest suspicious activities
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterList />}
                >
                  Filter
                </Button>
              </Box>
              {mockAlerts.slice(0, 5).map((alert) => (
                <Box
                  key={alert.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      boxShadow: theme.shadows[1],
                    },
                    '&:last-child': {
                      mb: 0,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {alert.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {alert.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        {new Date(alert.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={alert.severity}
                      size="small"
                      color={
                        alert.severity === 'critical'
                          ? 'error'
                          : alert.severity === 'high'
                          ? 'warning'
                          : alert.severity === 'medium'
                          ? 'info'
                          : 'default'
                      }
                      sx={{
                        fontWeight: 500,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 