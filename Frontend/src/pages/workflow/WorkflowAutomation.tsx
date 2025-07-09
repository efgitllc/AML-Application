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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Stack,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Alert
} from '@mui/material';
import {
  AutoAwesome,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  History,
  Settings,
  Timeline,
  Assignment,
  Check,
  Warning,
  Error as ErrorIcon,
  AccountTree,
  Schedule
} from '@mui/icons-material';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action' | 'condition';
  status: 'pending' | 'completed' | 'failed' | 'skipped';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  parameters: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'kyc' | 'transaction' | 'reporting' | 'compliance';
  status: 'active' | 'inactive' | 'draft';
  priority: 'high' | 'medium' | 'low';
  trigger: {
    type: 'event' | 'schedule' | 'manual';
    conditions: string[];
  };
  steps: WorkflowStep[];
  createdAt: string;
  lastModified: string;
  lastRun?: string;
  statistics?: {
    totalRuns: number;
    successRate: number;
    averageCompletionTime: number;
  };
}

export const WorkflowAutomation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setWorkflows([
      {
        id: 'WF001',
        name: 'New Customer Onboarding',
        description: 'Automated customer onboarding workflow',
        category: 'kyc',
        status: 'active',
        priority: 'high',
        trigger: {
          type: 'event',
          conditions: ['customer.created']
        },
        steps: [
          {
            id: 'STEP001',
            name: 'Document Verification',
            type: 'action',
            status: 'completed',
            parameters: {
              documentTypes: ['id', 'proof_of_address']
            }
          },
          {
            id: 'STEP002',
            name: 'Risk Assessment',
            type: 'action',
            status: 'completed',
            parameters: {
              riskFactors: ['location', 'business_type', 'transaction_volume']
            }
          },
          {
            id: 'STEP003',
            name: 'Compliance Approval',
            type: 'approval',
            status: 'pending',
            assignedTo: 'compliance_team',
            dueDate: '2024-01-22T17:00:00Z',
            parameters: {
              requiredLevel: 'senior',
              escalationTime: '24h'
            }
          }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        lastModified: '2024-01-15T10:00:00Z',
        lastRun: '2024-01-20T09:30:00Z',
        statistics: {
          totalRuns: 128,
          successRate: 94.5,
          averageCompletionTime: 3600
        }
      },
      {
        id: 'WF002',
        name: 'Suspicious Transaction Review',
        description: 'Automated review process for suspicious transactions',
        category: 'transaction',
        status: 'active',
        priority: 'high',
        trigger: {
          type: 'event',
          conditions: ['transaction.suspicious']
        },
        steps: [
          {
            id: 'STEP004',
            name: 'Transaction Analysis',
            type: 'action',
            status: 'completed',
            parameters: {
              analysisType: 'pattern',
              lookbackPeriod: '30d'
            }
          },
          {
            id: 'STEP005',
            name: 'Alert Generation',
            type: 'action',
            status: 'completed',
            parameters: {
              alertType: 'suspicious_activity',
              priority: 'high'
            }
          }
        ],
        createdAt: '2024-01-05T00:00:00Z',
        lastModified: '2024-01-15T11:00:00Z',
        lastRun: '2024-01-20T10:15:00Z',
        statistics: {
          totalRuns: 56,
          successRate: 98.2,
          averageCompletionTime: 1800
        }
      }
    ]);
  }, []);

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setOpenDialog(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setOpenDialog(true);
  };

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows(prevWorkflows =>
      prevWorkflows.map(workflow =>
        workflow.id === workflowId
          ? { ...workflow, status: workflow.status === 'active' ? 'inactive' : 'active' }
          : workflow
      )
    );
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'approval': return <Assignment />;
      case 'notification': return <Warning />;
      case 'action': return <PlayArrow />;
      case 'condition': return <AccountTree />;
      default: return <AutoAwesome />;
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'skipped': return 'default';
      default: return 'default';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Workflow Automation
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateWorkflow}
        >
          Create Workflow
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3}>
        {workflows.map((workflow) => (
          <Grid item xs={12} key={workflow.id}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {workflow.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workflow.description}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={workflow.status}
                    color={workflow.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                  <IconButton size="small" onClick={() => handleEditWorkflow(workflow)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleWorkflow(workflow.id)}
                  >
                    {workflow.status === 'active' ? <Stop /> : <PlayArrow />}
                  </IconButton>
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" gutterBottom>
                    Workflow Steps
                  </Typography>
                  <List>
                    {workflow.steps.map((step, index) => (
                      <ListItem key={step.id}>
                        <ListItemIcon>
                          {getStepIcon(step.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={step.name}
                          secondary={
                            <>
                              {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                              {step.assignedTo && ` • Assigned to: ${step.assignedTo}`}
                              {step.dueDate && ` • Due: ${new Date(step.dueDate).toLocaleDateString()}`}
                            </>
                          }
                        />
                        <Chip
                          label={step.status}
                          color={getStepStatusColor(step.status)}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Performance Metrics
                      </Typography>
                      {workflow.statistics && (
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Total Runs"
                              secondary={workflow.statistics.totalRuns}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Success Rate"
                              secondary={`${workflow.statistics.successRate}%`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Avg. Completion Time"
                              secondary={formatDuration(workflow.statistics.averageCompletionTime)}
                            />
                          </ListItem>
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Workflow Name"
              defaultValue={selectedWorkflow?.name}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              defaultValue={selectedWorkflow?.description}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  defaultValue={selectedWorkflow?.category || 'kyc'}
                >
                  <MenuItem value="kyc">KYC</MenuItem>
                  <MenuItem value="transaction">Transaction</MenuItem>
                  <MenuItem value="reporting">Reporting</MenuItem>
                  <MenuItem value="compliance">Compliance</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  defaultValue={selectedWorkflow?.priority || 'medium'}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            {selectedWorkflow ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 