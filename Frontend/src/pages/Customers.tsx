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
  AvatarGroup,
  ButtonBase
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
  VerifiedUser,
  Block,
  Notifications,
  Timeline,
  AccountBalanceWallet,
  ContactSupport,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { 
  mockCustomers, 
  mockIndividualCustomers, 
  mockCorporateCustomers,
  mockRiskAssessments,
  mockTransactions,
  mockCases
} from '../mocks';
import type { Customer, IndividualCustomer, CorporateCustomer, RiskAssessment } from '../types';

const riskLevelColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  critical: 'error'
} as const;

const statusColors = {
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
  blacklisted: 'error'
} as const;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerDetailsDialog: React.FC<{
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
}> = ({ customer, open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  
  if (!customer) return null;

  const individualDetails = mockIndividualCustomers.find(
    ind => ind.customer.id === customer.id
  );
  const corporateDetails = mockCorporateCustomers.find(
    corp => corp.customer.id === customer.id
  );
  
  const customerTransactions = mockTransactions.filter(
    txn => txn.customer.id === customer.id
  );
  
  const customerCases = mockCases.filter(
    case_ => case_.customer.id === customer.id
  );
  
  const riskAssessment = mockRiskAssessments.find(
    risk => risk.customer.id === customer.id
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {customer.customerType === 'individual' ? <Person /> : <Business />}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {customer.customerId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.customerType.charAt(0).toUpperCase() + customer.customerType.slice(1)} Customer
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              label={customer.riskLevel} 
              color={riskLevelColors[customer.riskLevel]} 
              size="small" 
            />
            <Chip 
              label={customer.status} 
              color={statusColors[customer.status]} 
              size="small" 
            />
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Personal/Business Info" />
            <Tab label="Risk Assessment" />
            <Tab label="Transactions" />
            <Tab label="Cases" />
            <Tab label="Documents" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Customer ID" 
                        secondary={customer.customerId} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Type" 
                        secondary={customer.customerType} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Risk Level" 
                        secondary={
                          <Chip 
                            label={customer.riskLevel} 
                            color={riskLevelColors[customer.riskLevel]} 
                            size="small" 
                          />
                        } 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Status" 
                        secondary={
                          <Chip 
                            label={customer.status} 
                            color={statusColors[customer.status]} 
                            size="small" 
                          />
                        } 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Created" 
                        secondary={new Date(customer.createdAt).toLocaleDateString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Last Review" 
                        secondary={customer.lastReviewDate ? new Date(customer.lastReviewDate).toLocaleDateString() : 'Never'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Next Review" 
                        secondary={customer.nextReviewDate ? new Date(customer.nextReviewDate).toLocaleDateString() : 'Not scheduled'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Activity Summary
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Receipt />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Total Transactions" 
                        secondary={customerTransactions.length} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Security />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Open Cases" 
                        secondary={customerCases.filter(c => c.status === 'open').length} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assessment />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Risk Score" 
                        secondary={riskAssessment ? `${riskAssessment.riskScore}/100` : 'Not assessed'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {customer.customerType === 'individual' && individualDetails && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Individual Customer Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={individualDetails.firstName}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={individualDetails.lastName}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      value={individualDetails.dateOfBirth}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nationality"
                      value={individualDetails.nationality}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ID Type"
                      value={individualDetails.idType}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ID Number"
                      value={individualDetails.idNumber}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={individualDetails.address}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Occupation"
                      value={individualDetails.occupation}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Employer"
                      value={individualDetails.employer || 'N/A'}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {customer.customerType === 'corporate' && corporateDetails && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Corporate Customer Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={corporateDetails.name}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Type"
                      value={corporateDetails.businessType}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Registration Number"
                      value={corporateDetails.registrationNumber}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tax ID"
                      value={corporateDetails.taxId}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country of Incorporation"
                      value={corporateDetails.countryOfIncorporation}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Industry"
                      value={corporateDetails.industry}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Address"
                      value={corporateDetails.businessAddress}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Annual Revenue"
                      value={corporateDetails.annualRevenue ? `$${corporateDetails.annualRevenue.toLocaleString()}` : 'N/A'}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Employees"
                      value={corporateDetails.numberOfEmployees || 'N/A'}
                      InputProps={{ readOnly: true }}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {riskAssessment ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Assessment
                </Typography>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overall Risk Score
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box width="100%" mr={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={riskAssessment.riskScore} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box minWidth={35}>
                      <Typography variant="body2" color="text.secondary">
                        {riskAssessment.riskScore}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Risk Factors
                </Typography>
                {riskAssessment.riskFactors.map((factor, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="body2" fontWeight="medium">
                      {factor.category}: {factor.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Weight: {factor.weight} | Score: {factor.score}
                    </Typography>
                  </Box>
                ))}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Recommendations
                </Typography>
                <List dense>
                  {riskAssessment.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">
              No risk assessment available for this customer.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions ({customerTransactions.length})
          </Typography>
          {customerTransactions.length > 0 ? (
            <List>
              {customerTransactions.slice(0, 10).map((transaction) => (
                <ListItem key={transaction.id} divider>
                  <ListItemText
                    primary={`${transaction.transactionType.toUpperCase()} - $${transaction.amount.toLocaleString()}`}
                    secondary={`${transaction.transactionId} • ${new Date(transaction.transactionDate).toLocaleDateString()}`}
                  />
                  <Chip 
                    label={transaction.status} 
                    size="small" 
                    color={transaction.status === 'completed' ? 'success' : transaction.status === 'flagged' ? 'error' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No transactions found for this customer.</Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Cases ({customerCases.length})
          </Typography>
          {customerCases.length > 0 ? (
            <List>
              {customerCases.map((case_) => (
                <ListItem key={case_.id} divider>
                  <ListItemText
                    primary={case_.title}
                    secondary={`${case_.caseNumber} • ${case_.caseType} • ${new Date(case_.createdAt).toLocaleDateString()}`}
                  />
                  <Chip 
                    label={case_.status} 
                    size="small" 
                    color={case_.status === 'open' ? 'error' : case_.status === 'closed' ? 'success' : 'warning'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No cases found for this customer.</Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Alert severity="info">
            Document management feature coming soon.
          </Alert>
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<Edit />}>
          Edit Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const Customers: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<string>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Customer statistics
  const totalCustomers = mockCustomers.length;
  const activeCustomers = mockCustomers.filter(c => c.status === 'active').length;
  const highRiskCustomers = mockCustomers.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length;
  const pendingReviews = mockCustomers.filter(c => c.kycStatus === 'review').length;
  const kycCompletionRate = Math.round((mockCustomers.filter(c => c.kycStatus === 'complete').length / totalCustomers) * 100);
  const averageRiskScore = Math.round(mockCustomers.reduce((acc, curr) => acc + curr.riskScore, 0) / totalCustomers);

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
    value: number | string; 
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
            {typeof value === 'number' ? value.toLocaleString() : value}
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

  const RiskIndicator = ({ score }: { score: number }) => (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={score}
        size={40}
        thickness={4}
        sx={{
          color: score > 70 ? 'error.main' : score > 40 ? 'warning.main' : 'success.main',
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" fontWeight="bold">
          {score}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Customer Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage customer profiles, risk assessments, and KYC status
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
            Add Customer
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            trend={{ value: 12, isPositive: true }}
            icon={<Person />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Active Customers"
            value={activeCustomers}
            trend={{ value: 8, isPositive: true }}
            icon={<VerifiedUser />}
            color={theme.palette.success.main}
            subtitle={`${Math.round((activeCustomers / totalCustomers) * 100)}% of total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="High Risk Customers"
            value={highRiskCustomers}
            trend={{ value: 5, isPositive: false }}
            icon={<Warning />}
            color={theme.palette.error.main}
            subtitle="Requires immediate attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Pending Reviews"
            value={pendingReviews}
            icon={<Assessment />}
            color={theme.palette.warning.main}
            subtitle="Awaiting verification"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="KYC Completion"
            value={`${kycCompletionRate}%`}
            icon={<CheckCircle />}
            color={theme.palette.info.main}
            subtitle="Overall completion rate"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Average Risk Score"
            value={averageRiskScore}
            icon={<Timeline />}
            color={theme.palette.secondary.main}
            subtitle="Across all customers"
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
            placeholder="Search customers..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="individual">Individual</MenuItem>
            <MenuItem value="corporate">Corporate</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </TextField>
          <Box flex={1} />
          <ButtonBase
            sx={{
              p: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
            }}
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

        <DataGrid
          rows={mockCustomers}
          columns={[
            {
              field: 'customerId',
              headerName: 'Customer',
              width: 250,
              renderCell: (params) => (
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      mr: 2,
                      bgcolor: params.row.customerType === 'individual' ? 'primary.main' : 'secondary.main',
                      fontSize: '1rem',
                    }}
                  >
                    {params.row.customerType === 'individual' ? <Person /> : <Business />}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {params.row.customerType}
                    </Typography>
                  </Box>
                </Box>
              ),
            },
            {
              field: 'name',
              headerName: 'Name',
              width: 200,
              renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">
                  {params.value}
                </Typography>
              ),
            },
            {
              field: 'riskScore',
              headerName: 'Risk Score',
              width: 120,
              renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                  <RiskIndicator score={params.value} />
                  <Typography variant="body2" fontWeight="medium">
                    {params.value}
                  </Typography>
                </Box>
              ),
            },
            {
              field: 'riskLevel',
              headerName: 'Risk Level',
              width: 130,
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  color={riskLevelColors[params.value as keyof typeof riskLevelColors]}
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
              field: 'status',
              headerName: 'Status',
              width: 130,
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  color={statusColors[params.value as keyof typeof statusColors]}
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
              field: 'kycStatus',
              headerName: 'KYC Status',
              width: 150,
              renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                  {params.value === 'complete' ? (
                    <CheckCircle fontSize="small" color="success" />
                  ) : params.value === 'incomplete' ? (
                    <ErrorOutline fontSize="small" color="warning" />
                  ) : (
                    <Block fontSize="small" color="error" />
                  )}
                  <Typography variant="body2" fontWeight="medium">
                    {params.value}
                  </Typography>
                </Box>
              ),
            },
            {
              field: 'lastActivity',
              headerName: 'Last Activity',
              width: 160,
              renderCell: (params) => (
                <Box>
                  <Typography variant="body2">
                    {new Date(params.value).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(params.value).toLocaleTimeString()}
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
                    onClick={() => setSelectedCustomer(params.row)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Edit Customer">
                  <GridActionsCellItem
                    icon={<Edit />}
                    label="Edit"
                    onClick={() => console.log('Edit', params.row)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
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
          ]}
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

      {selectedCustomer && (
        <CustomerDetailsDialog
          customer={selectedCustomer}
          open={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </Box>
  );
}; 