import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  GetApp as ExportIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAudit } from '../../hooks/useAudit';
import type { AuditFilter } from '../../types/audit';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`audit-tabpanel-${index}`}
      aria-labelledby={`audit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const AuditTrail: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<AuditFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'CSV' | 'PDF' | 'JSON'>('CSV');
  const [retentionDialogOpen, setRetentionDialogOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    entityType: '',
    retentionPeriod: 365,
    archiveAfter: 180,
    deleteAfter: 730,
    archiveLocation: 'default',
  });

  const {
    events,
    trails,
    stats,
    retentionPolicies,
    loading,
    error,
    loadEvents,
    searchEvents,
    createExport,
    createRetentionPolicy,
    updateRetentionPolicy,
    deleteRetentionPolicy,
    archiveEvents,
    restoreFromArchive,
  } = useAudit();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = () => {
    if (searchQuery) {
      searchEvents(searchQuery);
    } else {
      loadEvents(filters);
    }
  };

  const handleExport = async () => {
    await createExport(filters, exportFormat);
    setExportDialogOpen(false);
  };

  const handleArchive = async () => {
    const result = await archiveEvents(filters);
    // You might want to show a success message or update the UI
    console.log('Archive job started:', result);
  };

  const handleCreateRetentionPolicy = async () => {
    await createRetentionPolicy(newPolicy);
    setRetentionDialogOpen(false);
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Events</Typography>
            <Typography variant="h4">{stats.totalEvents}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Success Rate</Typography>
            <Typography variant="h4">
              {((stats.eventsByStatus.success /
                (stats.eventsByStatus.success + stats.eventsByStatus.failure)) *
                100).toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Daily Average</Typography>
            <Typography variant="h4">{stats.averageEventsPerDay.toFixed(1)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Top Entity Type</Typography>
            <Typography variant="h4">
              {stats.topEntities[0]?.entityType || 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderEvents = () => {
    return (
      <>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            label="Search Events"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArchiveIcon />}
            onClick={handleArchive}
          >
            Archive
          </Button>
        </Box>

        <List>
          {events.map((event) => (
            <ListItem key={event.id}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">{event.eventType}</Typography>
                    <Chip
                      label={event.status}
                      color={event.status === 'SUCCESS' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">
                      Entity: {event.entityType} ({event.entityId})
                    </Typography>
                    <Typography variant="body2">
                      User: {event.userId} | IP: {event.ipAddress}
                    </Typography>
                    <Typography variant="caption">
                      {new Date(event.timestamp).toLocaleString()}
                    </Typography>
                    {event.changes && event.changes.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="body2">Changes:</Typography>
                        {event.changes.map((change, index) => (
                          <Typography key={index} variant="caption" component="div">
                            {change.field}: {change.oldValue} → {change.newValue}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  const renderRetentionPolicies = () => {
    return (
      <>
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            variant="contained"
            onClick={() => setRetentionDialogOpen(true)}
          >
            Create Policy
          </Button>
        </Box>

        <List>
          {retentionPolicies.map((policy) => (
            <ListItem key={policy.id}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">{policy.entityType}</Typography>
                    <Chip
                      label={policy.status}
                      color={policy.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">
                      Retention: {policy.retentionPeriod} days
                    </Typography>
                    <Typography variant="body2">
                      Archive after: {policy.archiveAfter} days
                    </Typography>
                    <Typography variant="body2">
                      Delete after: {policy.deleteAfter} days
                    </Typography>
                    <Typography variant="caption">
                      Next execution: {new Date(policy.nextExecution).toLocaleString()}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => deleteRetentionPolicy(policy.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Audit Trail
        </Typography>
        <Box>
          <Tooltip title="Retention Settings">
            <IconButton onClick={() => setRetentionDialogOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderStats()}

          <Paper sx={{ mt: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Events" />
              <Tab label="Retention Policies" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {renderEvents()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {renderRetentionPolicies()}
            </TabPanel>
          </Paper>

          <Dialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Export Audit Events</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  label="Export Format"
                >
                  <MenuItem value="CSV">CSV</MenuItem>
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="JSON">JSON</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleExport} variant="contained">
                Export
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={retentionDialogOpen}
            onClose={() => setRetentionDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create Retention Policy</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Entity Type"
                  value={newPolicy.entityType}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, entityType: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Retention Period (days)"
                  type="number"
                  value={newPolicy.retentionPeriod}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      retentionPeriod: parseInt(e.target.value, 10),
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Archive After (days)"
                  type="number"
                  value={newPolicy.archiveAfter}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      archiveAfter: parseInt(e.target.value, 10),
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Delete After (days)"
                  type="number"
                  value={newPolicy.deleteAfter}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      deleteAfter: parseInt(e.target.value, 10),
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Archive Location"
                  value={newPolicy.archiveLocation}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      archiveLocation: e.target.value,
                    })
                  }
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRetentionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRetentionPolicy} variant="contained">
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
}; 