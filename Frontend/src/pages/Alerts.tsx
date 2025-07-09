import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  MenuItem,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Alert as MuiAlert,
  Paper,
} from '@mui/material';
import {
  Add,
  Warning,
  NotificationsActive,
  Security,
  Assignment,
  Person,
  Business,
  FilterList,
  Search,
  Refresh,
  FileDownload,
  Flag,
  CheckCircle,
  Cancel,
  Timer,
  TrendingUp,
  TrendingDown,
  Assessment,
  Visibility,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { mockAlerts, mockCustomers } from '../mocks';
import type { Alert, Customer } from '../types';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.1)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend.isPositive ? (
                  <TrendingUp fontSize="small" color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDown fontSize="small" color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  color={trend.isPositive ? 'success.main' : 'error.main'}
                >
                  {trend.value}% {trend.isPositive ? 'decrease' : 'increase'}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.2),
              color: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export const Alerts: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const getCustomerName = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Alert ID',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="primary.main">
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      renderCell: (params) => {
        const color = 
          params.value === 'critical' ? theme.palette.error :
          params.value === 'high' ? theme.palette.warning :
          params.value === 'medium' ? theme.palette.info :
          theme.palette.success;

        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(color.main, 0.2)} 0%, ${alpha(color.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(color.main, 0.2)}`,
              color: color.main,
              fontWeight: 'medium',
            }}
          />
        );
      },
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 180,
      renderCell: (params) => {
        const getIcon = () => {
          switch (params.value) {
            case 'suspicious_transaction': return <Warning color="warning" />;
            case 'kyc_alert': return <Person color="info" />;
            case 'compliance_violation': return <Security color="error" />;
            case 'watchlist_match': return <Flag color="error" />;
            default: return <Assignment color="primary" />;
          }
        };

        return (
          <Box display="flex" alignItems="center" gap={1}>
            {getIcon()}
            <Typography variant="body2">
              {params.value.replace('_', ' ')}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.description.slice(0, 60)}...
          </Typography>
        </Box>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 200,
      valueGetter: (params) => getCustomerName(params.value),
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Avatar 
            sx={{ 
              width: 24, 
              height: 24, 
              mr: 1, 
              fontSize: '12px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {params.value.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const color = 
          params.value === 'open' ? theme.palette.error :
          params.value === 'in_progress' ? theme.palette.warning :
          params.value === 'under_review' ? theme.palette.info :
          theme.palette.success;

        return (
          <Chip
            label={params.value.replace('_', ' ')}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(color.main, 0.2)} 0%, ${alpha(color.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(color.main, 0.2)}`,
              color: color.main,
              fontWeight: 'medium',
            }}
          />
        );
      },
    },
    {
      field: 'timestamp',
      headerName: 'Created',
      width: 180,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleString();
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <Tooltip title="View Details">
          <IconButton
            onClick={() => console.log('View alert', params.row)}
            sx={{ color: theme.palette.primary.main }}
          >
            <Visibility />
          </IconButton>
        </Tooltip>,
      ],
    },
  ];

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesSearch = 
      alert.id.toString().includes(searchTerm.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(alert.customer).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  // Calculate statistics
  const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical').length;
  const openAlerts = mockAlerts.filter(a => a.status === 'open').length;
  const todayAlerts = mockAlerts.filter(a => 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const reviewPendingAlerts = mockAlerts.filter(a => a.status === 'under_review').length;

  return (
    <Box 
      sx={{ 
        p: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        minHeight: '100vh'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Alert Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and manage alerts across your organization
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
              }
            }}
          >
            Create Alert
          </Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Critical Alerts"
            value={criticalAlerts}
            trend={{ value: 12, isPositive: false }}
            icon={<Warning />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Alerts"
            value={openAlerts}
            trend={{ value: 8, isPositive: false }}
            icon={<NotificationsActive />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Alerts"
            value={todayAlerts}
            icon={<Timer />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Review"
            value={reviewPendingAlerts}
            trend={{ value: 5, isPositive: true }}
            icon={<Assessment />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      <Paper 
        sx={{ 
          p: 2, 
          mb: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search Alerts"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                background: alpha(theme.palette.background.paper, 0.5),
              }
            }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <TextField
            select
            label="Severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                background: alpha(theme.palette.background.paper, 0.5),
              }
            }}
          >
            <MenuItem value="all">All Severities</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
          <TextField
            select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                background: alpha(theme.palette.background.paper, 0.5),
              }
            }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="suspicious_transaction">Suspicious Transaction</MenuItem>
            <MenuItem value="kyc_alert">KYC Alert</MenuItem>
            <MenuItem value="compliance_violation">Compliance Violation</MenuItem>
            <MenuItem value="watchlist_match">Watchlist Match</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                background: alpha(theme.palette.background.paper, 0.5),
              }
            }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
          <Box flexGrow={1} />
          <Stack direction="row" spacing={1}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />}
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.5),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Advanced
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<FileDownload />}
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.5),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Export
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper 
        sx={{ 
          height: 600, 
          width: '100%',
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderColor: alpha(theme.palette.divider, 0.1),
          },
          '& .MuiDataGrid-columnHeaders': {
            borderColor: alpha(theme.palette.divider, 0.1),
            background: alpha(theme.palette.background.paper, 0.5),
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              background: alpha(theme.palette.action.hover, 0.1),
            },
          },
        }}
      >
        <DataGrid
          rows={filteredAlerts}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 }
            },
            sorting: {
              sortModel: [{ field: 'timestamp', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          loading={loading}
        />
      </Paper>
    </Box>
  );
}; 