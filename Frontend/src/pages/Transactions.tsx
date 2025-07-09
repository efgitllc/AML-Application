import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  Alert,
  LinearProgress,
  useTheme,
  alpha,
  CircularProgress,
  Stack,
  ButtonBase,
  Collapse,
  Fade
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Warning,
  Security,
  Person,
  Business,
  Assessment,
  History,
  FileDownload,
  FilterList,
  Search,
  Refresh,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  AttachMoney,
  Block,
  CheckCircle,
  ErrorOutline,
  Timeline,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
  CompareArrows,
  LocalAtm,
  Schedule,
  Flag,
  Info,
  Close
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

interface Transaction {
  id: string;
  transactionId: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'suspicious' | 'reviewing' | 'blocked';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  customer: string;
  timestamp: string;
}

// Mock data for development
const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'TRX-001',
    type: 'credit',
    amount: 5000,
    currency: 'USD',
    status: 'completed',
    riskLevel: 'low',
    customer: 'John Doe',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    transactionId: 'TRX-002',
    type: 'debit',
    amount: 1500,
    currency: 'USD',
    status: 'pending',
    riskLevel: 'medium',
    customer: 'Jane Smith',
    timestamp: new Date().toISOString()
  },
  {
    id: '3',
    transactionId: 'TRX-003',
    type: 'transfer',
    amount: 25000,
    currency: 'USD',
    status: 'suspicious',
    riskLevel: 'high',
    customer: 'Acme Corp',
    timestamp: new Date().toISOString()
  }
];

const statusColors = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  suspicious: 'error',
  reviewing: 'info',
  blocked: 'error',
} as const;

const riskLevelColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  critical: 'error',
} as const;

export const Transactions: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [showFilters, setShowFilters] = useState(false);

  // Transaction statistics
  const totalTransactions = mockTransactions.length;
  const totalVolume = mockTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const successfulTransactions = mockTransactions.filter(t => t.status === 'completed').length;
  const failedTransactions = mockTransactions.filter(t => t.status === 'failed').length;
  const suspiciousTransactions = mockTransactions.filter(t => t.status === 'suspicious').length;
  const averageTransactionValue = totalVolume / totalTransactions;

  const StatCard = ({ 
    title, 
    value, 
    trend, 
    icon, 
    color,
    subtitle,
    chart 
  }: { 
    title: string; 
    value: string | number; 
    trend?: { value: number; isPositive: boolean }; 
    icon: React.ReactNode; 
    color: string;
    subtitle?: string;
    chart?: React.ReactNode;
  }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.1)}`,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 20px -10px ${alpha(color, 0.3)}`,
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography color="text.secondary" variant="body2" fontWeight="medium">
            {title}
          </Typography>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.2),
              color: color,
              width: 40,
              height: 40,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
            {typeof value === 'number' ? 
              value >= 1000000 
                ? `$${(value / 1000000).toFixed(2)}M`
                : value >= 1000
                ? `$${(value / 1000).toFixed(1)}K`
                : `$${value.toLocaleString()}`
              : value
            }
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box display="flex" alignItems="center" gap={1}>
              {trend.isPositive ? (
                <ArrowUpward fontSize="small" sx={{ color: 'success.main' }} />
              ) : (
                <ArrowDownward fontSize="small" sx={{ color: 'error.main' }} />
              )}
              <Typography
                variant="body2"
                color={trend.isPositive ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {trend.value}% {trend.isPositive ? 'increase' : 'decrease'}
              </Typography>
            </Box>
          )}
        </Box>
        {chart && (
          <Box sx={{ mt: 2, height: 60 }}>
            {chart}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const TransactionAmount = ({ amount, type }: { amount: number; type: string }) => (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography
        variant="body2"
        fontWeight="medium"
        color={type === 'credit' ? 'success.main' : 'error.main'}
      >
        {type === 'credit' ? '+' : '-'}${amount.toLocaleString()}
      </Typography>
      {type === 'credit' ? (
        <ArrowUpward fontSize="small" sx={{ color: 'success.main' }} />
      ) : (
        <ArrowDownward fontSize="small" sx={{ color: 'error.main' }} />
      )}
    </Box>
  );

  const columns: GridColDef[] = [
    {
      field: 'transactionId',
      headerName: 'Transaction',
      width: 200,
      renderCell: (params) => {
        const transaction = params.row as Transaction;
        return (
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                bgcolor: transaction.type === 'credit' ? 'success.main' : 'error.main',
                fontSize: '1rem',
              }}
            >
              {transaction.type === 'credit' ? <TrendingUp /> : <TrendingDown />}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {transaction.transactionId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {transaction.type}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      renderCell: (params) => (
        <TransactionAmount amount={params.row.amount} type={params.row.type} />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={statusColors[params.row.status as keyof typeof statusColors]}
          size="small"
          sx={{
            fontWeight: 'medium',
            minWidth: 90,
            height: 24,
          }}
        />
      ),
    },
    {
      field: 'riskLevel',
      headerName: 'Risk Level',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.riskLevel}
          color={riskLevelColors[params.row.riskLevel as keyof typeof riskLevelColors]}
          size="small"
          sx={{
            fontWeight: 'medium',
            minWidth: 90,
            height: 24,
          }}
        />
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Person fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
            {params.row.customer}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Date & Time',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {new Date(params.row.timestamp).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(params.row.timestamp).toLocaleTimeString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <Tooltip title="View Details">
          <GridActionsCellItem
            icon={<Visibility />}
            label="View"
            onClick={() => setSelectedTransaction(params.row)}
            sx={{
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          />
        </Tooltip>,
        <Tooltip title="Flag Transaction">
          <GridActionsCellItem
            icon={<Flag />}
            label="Flag"
            onClick={() => console.log('Flag', params.row)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'warning.main',
              },
            }}
          />
        </Tooltip>,
        <Tooltip title="More Actions">
          <GridActionsCellItem
            icon={<MoreVert />}
            label="More"
            onClick={() => console.log('More', params.row)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          />
        </Tooltip>,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Transaction Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and analyze financial transactions in real-time
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {}}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                boxShadow: `0 12px 20px -6px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            }}
          >
            New Transaction
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Volume"
            value={totalVolume}
            trend={{ value: 15, isPositive: true }}
            icon={<AccountBalanceWallet />}
            color={theme.palette.primary.main}
            subtitle="Last 24 hours"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Transactions"
            value={totalTransactions}
            trend={{ value: 8, isPositive: true }}
            icon={<SwapHoriz />}
            color={theme.palette.success.main}
            subtitle="Across all channels"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Success Rate"
            value={`${Math.round((successfulTransactions / totalTransactions) * 100)}%`}
            trend={{ value: 3, isPositive: true }}
            icon={<CheckCircle />}
            color={theme.palette.info.main}
            subtitle={`${successfulTransactions} successful`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Failed Transactions"
            value={failedTransactions}
            trend={{ value: 2, isPositive: false }}
            icon={<ErrorOutline />}
            color={theme.palette.error.main}
            subtitle="Requires attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Suspicious Activity"
            value={suspiciousTransactions}
            icon={<Warning />}
            color={theme.palette.warning.main}
            subtitle="Under review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Average Value"
            value={averageTransactionValue}
            icon={<Timeline />}
            color={theme.palette.secondary.main}
            subtitle="Per transaction"
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <TextField
            placeholder="Search transactions..."
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{
              maxWidth: 300,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
              },
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TextField
            select
            size="small"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="suspicious">Suspicious</MenuItem>
          </TextField>
          <Box flex={1} />
          <ButtonBase
            sx={{
              p: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
            }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterList />
          </ButtonBase>
          <ButtonBase
            sx={{
              p: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
            }}
          >
            <FileDownload />
          </ButtonBase>
        </Box>

        <Collapse in={showFilters}>
          <Box mb={3} p={2} bgcolor={alpha(theme.palette.primary.main, 0.05)} borderRadius={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Amount Range"
                  select
                  defaultValue="all"
                >
                  <MenuItem value="all">All Amounts</MenuItem>
                  <MenuItem value="0-1000">$0 - $1,000</MenuItem>
                  <MenuItem value="1000-10000">$1,000 - $10,000</MenuItem>
                  <MenuItem value="10000+">$10,000+</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Transaction Type"
                  select
                  defaultValue="all"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="debit">Debit</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Risk Level"
                  select
                  defaultValue="all"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Currency"
                  select
                  defaultValue="all"
                >
                  <MenuItem value="all">All Currencies</MenuItem>
                  <MenuItem value="usd">USD</MenuItem>
                  <MenuItem value="eur">EUR</MenuItem>
                  <MenuItem value="gbp">GBP</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        <DataGrid
          rows={mockTransactions}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderColor: alpha(theme.palette.divider, 0.1),
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderColor: alpha(theme.palette.divider, 0.1),
            },
            '& .MuiDataGrid-row': {
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              },
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>

      {selectedTransaction && (
        <Dialog
          open={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction Details
            <IconButton
              onClick={() => setSelectedTransaction(null)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1">
                  {selectedTransaction.transactionId}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <TransactionAmount 
                  amount={selectedTransaction.amount} 
                  type={selectedTransaction.type} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedTransaction.status}
                  color={statusColors[selectedTransaction.status as keyof typeof statusColors]}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Risk Level
                </Typography>
                <Chip
                  label={selectedTransaction.riskLevel}
                  color={riskLevelColors[selectedTransaction.riskLevel as keyof typeof riskLevelColors]}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Customer
                </Typography>
                <Typography variant="body1">
                  {selectedTransaction.customer}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedTransaction.timestamp).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}; 