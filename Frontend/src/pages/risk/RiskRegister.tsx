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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Healing as HealingIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  GetApp as ExportIcon,
  Upload as ImportIcon,
} from '@mui/icons-material';
import { useRisk } from '../../hooks/useRisk';
import type { Risk, RiskFilter } from '../../types/risk';

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
      id={`risk-tabpanel-${index}`}
      aria-labelledby={`risk-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const RiskRegister: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<RiskFilter>({});
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    title: '',
    description: '',
    category: 'OPERATIONAL',
    impact: 'MEDIUM',
    likelihood: 'POSSIBLE',
    status: 'IDENTIFIED',
  });

  const {
    risks,
    selectedRisk,
    stats,
    loading,
    error,
    loadRisks,
    createRisk,
    updateRisk,
    deleteRisk,
    getRisk,
    exportRisks,
    importRisks,
  } = useRisk();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRiskSubmit = async () => {
    if (selectedRiskId) {
      await updateRisk(selectedRiskId, newRisk);
    } else {
      await createRisk(newRisk);
    }
    setRiskDialogOpen(false);
    setSelectedRiskId(null);
    setNewRisk({
      title: '',
      description: '',
      category: 'OPERATIONAL',
      impact: 'MEDIUM',
      likelihood: 'POSSIBLE',
      status: 'IDENTIFIED',
    });
  };

  const handleEditRisk = (risk: Risk) => {
    setSelectedRiskId(risk.id);
    setNewRisk(risk);
    setRiskDialogOpen(true);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await importRisks(file);
      if (result.success) {
        // Show success message
      }
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toUpperCase()) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood.toUpperCase()) {
      case 'ALMOST_CERTAIN':
        return 'error';
      case 'LIKELY':
        return 'error';
      case 'POSSIBLE':
        return 'warning';
      case 'UNLIKELY':
        return 'info';
      case 'RARE':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Risks</Typography>
            <Typography variant="h4">{stats.totalRisks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">High Risks</Typography>
            <Typography variant="h4">{stats.byImpact.HIGH || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Control Effectiveness</Typography>
            <Typography variant="h4">
              {((stats.controlStats.effectiveness.high /
                stats.controlStats.total) *
                100).toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Controls</Typography>
            <Typography variant="h4">{stats.controlStats.active}</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderRisks = () => {
    return (
      <>
        <Box display="flex" justifyContent="flex-end" gap={2} mb={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setRiskDialogOpen(true)}
          >
            Add Risk
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => exportRisks(filters)}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            component="label"
          >
            Import
            <input
              type="file"
              hidden
              accept=".csv,.xlsx"
              onChange={handleImport}
            />
          </Button>
        </Box>

        <List>
          {risks.map((risk) => (
            <ListItem key={risk.id}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">{risk.title}</Typography>
                    <Chip
                      label={risk.impact}
                      color={getImpactColor(risk.impact) as any}
                      size="small"
                    />
                    <Chip
                      label={risk.likelihood}
                      color={getLikelihoodColor(risk.likelihood) as any}
                      size="small"
                    />
                    <Chip label={risk.category} size="small" />
                    <Chip label={risk.status} size="small" />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">{risk.description}</Typography>
                    <Typography variant="caption">
                      Owner: {risk.owner.name} | Last Review:{' '}
                      {new Date(risk.lastReviewDate).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditRisk(risk)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteRisk(risk.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog
          open={riskDialogOpen}
          onClose={() => setRiskDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedRiskId ? 'Edit Risk' : 'Add Risk'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={newRisk.title}
                onChange={(e) =>
                  setNewRisk({ ...newRisk, title: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={newRisk.description}
                onChange={(e) =>
                  setNewRisk({ ...newRisk, description: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newRisk.category}
                  onChange={(e) =>
                    setNewRisk({
                      ...newRisk,
                      category: e.target.value as Risk['category'],
                    })
                  }
                  label="Category"
                >
                  <MenuItem value="OPERATIONAL">Operational</MenuItem>
                  <MenuItem value="FINANCIAL">Financial</MenuItem>
                  <MenuItem value="COMPLIANCE">Compliance</MenuItem>
                  <MenuItem value="STRATEGIC">Strategic</MenuItem>
                  <MenuItem value="REPUTATIONAL">Reputational</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Impact</InputLabel>
                <Select
                  value={newRisk.impact}
                  onChange={(e) =>
                    setNewRisk({
                      ...newRisk,
                      impact: e.target.value as Risk['impact'],
                    })
                  }
                  label="Impact"
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Likelihood</InputLabel>
                <Select
                  value={newRisk.likelihood}
                  onChange={(e) =>
                    setNewRisk({
                      ...newRisk,
                      likelihood: e.target.value as Risk['likelihood'],
                    })
                  }
                  label="Likelihood"
                >
                  <MenuItem value="RARE">Rare</MenuItem>
                  <MenuItem value="UNLIKELY">Unlikely</MenuItem>
                  <MenuItem value="POSSIBLE">Possible</MenuItem>
                  <MenuItem value="LIKELY">Likely</MenuItem>
                  <MenuItem value="ALMOST_CERTAIN">Almost Certain</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newRisk.status}
                  onChange={(e) =>
                    setNewRisk({
                      ...newRisk,
                      status: e.target.value as Risk['status'],
                    })
                  }
                  label="Status"
                >
                  <MenuItem value="IDENTIFIED">Identified</MenuItem>
                  <MenuItem value="ASSESSED">Assessed</MenuItem>
                  <MenuItem value="TREATED">Treated</MenuItem>
                  <MenuItem value="MONITORED">Monitored</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRiskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRiskSubmit} variant="contained">
              {selectedRiskId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Risk Register
      </Typography>

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
              <Tab label="Risks" />
              <Tab label="Controls" />
              <Tab label="Treatments" />
              <Tab label="Assessments" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {renderRisks()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* Controls content */}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {/* Treatments content */}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              {/* Assessments content */}
            </TabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
}; 