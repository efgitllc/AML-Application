import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  LinearProgress,
  Stack,
  Alert,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Api,
  Webhook,
  CloudSync,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  Refresh,
  History,
  Settings,
  CloudUpload,
  CloudDownload,
  Check,
  Error,
  Link
} from '@mui/icons-material';

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  responseTime: number;
  category: 'kyc' | 'screening' | 'reporting' | 'transaction';
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered?: string;
  successRate: number;
}

interface DataSync {
  id: string;
  type: 'import' | 'export';
  source: string;
  destination: string;
  schedule: string;
  lastRun?: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  recordsProcessed?: number;
}

export const Integration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [dataSync, setDataSync] = useState<DataSync[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'api' | 'webhook' | 'sync'>('api');

  useEffect(() => {
    // TODO: Replace with actual API calls
    setEndpoints([
      {
        id: 'API001',
        name: 'Emirates ID Verification',
        url: '/api/v1/verify/emirates-id',
        method: 'POST',
        status: 'active',
        lastSync: '2024-01-20T10:30:00Z',
        responseTime: 245,
        category: 'kyc'
      },
      {
        id: 'API002',
        name: 'Sanctions Screening',
        url: '/api/v1/screening/sanctions',
        method: 'POST',
        status: 'active',
        lastSync: '2024-01-20T10:15:00Z',
        responseTime: 890,
        category: 'screening'
      }
    ]);

    setWebhooks([
      {
        id: 'WH001',
        name: 'Alert Notification',
        url: 'https://external-system/webhooks/alerts',
        events: ['alert.created', 'alert.updated'],
        status: 'active',
        lastTriggered: '2024-01-20T09:45:00Z',
        successRate: 99.8
      },
      {
        id: 'WH002',
        name: 'Transaction Report',
        url: 'https://reporting-system/webhooks/transactions',
        events: ['transaction.suspicious', 'transaction.large'],
        status: 'active',
        lastTriggered: '2024-01-20T08:30:00Z',
        successRate: 100
      }
    ]);

    setDataSync([
      {
        id: 'SYNC001',
        type: 'import',
        source: 'External KYC System',
        destination: 'Local Database',
        schedule: '0 0 * * *',
        lastRun: '2024-01-20T00:00:00Z',
        status: 'completed',
        recordsProcessed: 1250
      },
      {
        id: 'SYNC002',
        type: 'export',
        source: 'Transaction Database',
        destination: 'Regulatory Reporting System',
        schedule: '0 */6 * * *',
        lastRun: '2024-01-19T18:00:00Z',
        status: 'scheduled'
      }
    ]);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'api' | 'webhook' | 'sync') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    // TODO: Implement refresh logic
    setTimeout(() => setLoading(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'success';
      case 'inactive':
      case 'scheduled':
        return 'warning';
      case 'error':
      case 'failed':
        return 'error';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderAPIEndpoints = () => (
    <List>
      {endpoints.map((endpoint) => (
        <ListItem key={endpoint.id}>
          <ListItemIcon>
            <Api />
          </ListItemIcon>
          <ListItemText
            primary={endpoint.name}
            secondary={`${endpoint.method} ${endpoint.url}`}
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title={`Response Time: ${endpoint.responseTime}ms`}>
              <Typography variant="body2" color="text.secondary">
                {endpoint.responseTime}ms
              </Typography>
            </Tooltip>
            <Chip
              label={endpoint.status}
              color={getStatusColor(endpoint.status)}
              size="small"
            />
            <IconButton size="small">
              <Settings fontSize="small" />
            </IconButton>
          </Stack>
        </ListItem>
      ))}
    </List>
  );

  const renderWebhooks = () => (
    <List>
      {webhooks.map((webhook) => (
        <ListItem key={webhook.id}>
          <ListItemIcon>
            <Webhook />
          </ListItemIcon>
          <ListItemText
            primary={webhook.name}
            secondary={
              <>
                {webhook.url}
                <br />
                Events: {webhook.events.join(', ')}
              </>
            }
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title={`Success Rate: ${webhook.successRate}%`}>
              <Typography variant="body2" color="text.secondary">
                {webhook.successRate}%
              </Typography>
            </Tooltip>
            <Chip
              label={webhook.status}
              color={getStatusColor(webhook.status)}
              size="small"
            />
            <IconButton size="small">
              <Settings fontSize="small" />
            </IconButton>
          </Stack>
        </ListItem>
      ))}
    </List>
  );

  const renderDataSync = () => (
    <List>
      {dataSync.map((sync) => (
        <ListItem key={sync.id}>
          <ListItemIcon>
            {sync.type === 'import' ? <CloudDownload /> : <CloudUpload />}
          </ListItemIcon>
          <ListItemText
            primary={`${sync.source} → ${sync.destination}`}
            secondary={`Schedule: ${sync.schedule} | Last Run: ${sync.lastRun || 'Never'}`}
          />
          <Stack direction="row" spacing={2} alignItems="center">
            {sync.recordsProcessed && (
              <Tooltip title="Records Processed">
                <Typography variant="body2" color="text.secondary">
                  {sync.recordsProcessed} records
                </Typography>
              </Tooltip>
            )}
            <Chip
              label={sync.status}
              color={getStatusColor(sync.status)}
              size="small"
            />
            <IconButton size="small">
              <Settings fontSize="small" />
            </IconButton>
          </Stack>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Integration Management
        </Typography>
        <Stack direction="row" spacing={2}>
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
            onClick={() => handleOpenDialog(tabValue === 0 ? 'api' : tabValue === 1 ? 'webhook' : 'sync')}
          >
            Add New
          </Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<Api />} label="API Endpoints" />
          <Tab icon={<Webhook />} label="Webhooks" />
          <Tab icon={<CloudSync />} label="Data Sync" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {tabValue === 0 && renderAPIEndpoints()}
        {tabValue === 1 && renderWebhooks()}
        {tabValue === 2 && renderDataSync()}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {`Add New ${dialogType === 'api' ? 'API Endpoint' : dialogType === 'webhook' ? 'Webhook' : 'Data Sync'}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              sx={{ mb: 2 }}
            />
            {dialogType === 'api' && (
              <>
                <TextField
                  fullWidth
                  label="URL"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  select
                  label="Method"
                  defaultValue="GET"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </TextField>
              </>
            )}
            {dialogType === 'webhook' && (
              <>
                <TextField
                  fullWidth
                  label="Webhook URL"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Events (comma-separated)"
                  sx={{ mb: 2 }}
                />
              </>
            )}
            {dialogType === 'sync' && (
              <>
                <TextField
                  fullWidth
                  select
                  label="Type"
                  defaultValue="import"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="import">Import</MenuItem>
                  <MenuItem value="export">Export</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Source"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Destination"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Schedule (cron expression)"
                  sx={{ mb: 2 }}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 