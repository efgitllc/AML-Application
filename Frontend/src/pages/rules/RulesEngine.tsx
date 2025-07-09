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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Rule,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  History,
  Settings,
  ExpandMore,
  Save,
  Check,
  Warning,
  Error as ErrorIcon,
  Timeline,
  Assessment
} from '@mui/icons-material';

interface AMLRule {
  id: string;
  name: string;
  description: string;
  category: 'transaction' | 'customer' | 'behavior' | 'regulatory';
  type: 'threshold' | 'pattern' | 'frequency' | 'combination';
  status: 'active' | 'inactive' | 'draft';
  priority: 'high' | 'medium' | 'low';
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdAt: string;
  lastModified: string;
  lastTriggered?: string;
  performance?: {
    triggeredCount: number;
    falsePositives: number;
    averageProcessingTime: number;
  };
}

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string | number;
  logic: 'AND' | 'OR';
}

interface RuleAction {
  id: string;
  type: 'create_alert' | 'block_transaction' | 'notify' | 'escalate';
  parameters: Record<string, any>;
}

export const RulesEngine: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<AMLRule[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AMLRule | null>(null);
  const [expandedRule, setExpandedRule] = useState<string | false>(false);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setRules([
      {
        id: 'RULE001',
        name: 'Large Cash Transaction',
        description: 'Detect cash transactions exceeding threshold',
        category: 'transaction',
        type: 'threshold',
        status: 'active',
        priority: 'high',
        conditions: [
          {
            id: 'COND001',
            field: 'transaction.amount',
            operator: '>',
            value: 10000,
            logic: 'AND'
          },
          {
            id: 'COND002',
            field: 'transaction.type',
            operator: '==',
            value: 'cash',
            logic: 'AND'
          }
        ],
        actions: [
          {
            id: 'ACT001',
            type: 'create_alert',
            parameters: {
              severity: 'high',
              category: 'large_transaction'
            }
          }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        lastModified: '2024-01-15T10:00:00Z',
        lastTriggered: '2024-01-20T09:30:00Z',
        performance: {
          triggeredCount: 156,
          falsePositives: 12,
          averageProcessingTime: 245
        }
      },
      {
        id: 'RULE002',
        name: 'Suspicious Pattern Detection',
        description: 'Identify suspicious transaction patterns',
        category: 'behavior',
        type: 'pattern',
        status: 'active',
        priority: 'medium',
        conditions: [
          {
            id: 'COND003',
            field: 'transaction.frequency',
            operator: '>',
            value: 5,
            logic: 'AND'
          }
        ],
        actions: [
          {
            id: 'ACT002',
            type: 'create_alert',
            parameters: {
              severity: 'medium',
              category: 'suspicious_pattern'
            }
          }
        ],
        createdAt: '2024-01-05T00:00:00Z',
        lastModified: '2024-01-15T11:00:00Z',
        lastTriggered: '2024-01-20T10:15:00Z',
        performance: {
          triggeredCount: 89,
          falsePositives: 8,
          averageProcessingTime: 320
        }
      }
    ]);
  }, []);

  const handleCreateRule = () => {
    setSelectedRule(null);
    setOpenDialog(true);
  };

  const handleEditRule = (rule: AMLRule) => {
    setSelectedRule(rule);
    setOpenDialog(true);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prevRules =>
      prevRules.map(rule =>
        rule.id === ruleId
          ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
          : rule
      )
    );
  };

  const handleExpandRule = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? false : ruleId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'draft': return 'info';
      default: return 'default';
    }
  };

  const renderRulePerformance = (rule: AMLRule) => {
    if (!rule.performance) return null;

    const accuracy = ((rule.performance.triggeredCount - rule.performance.falsePositives) / 
      rule.performance.triggeredCount * 100).toFixed(1);

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Performance Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Triggered Count
            </Typography>
            <Typography variant="h6">
              {rule.performance.triggeredCount}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Accuracy
            </Typography>
            <Typography variant="h6">
              {accuracy}%
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Avg. Processing Time
            </Typography>
            <Typography variant="h6">
              {rule.performance.averageProcessingTime}ms
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Rules Engine
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateRule}
        >
          Create Rule
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {rules.map((rule) => (
            <Accordion
              key={rule.id}
              expanded={expandedRule === rule.id}
              onChange={() => handleExpandRule(rule.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Rule />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="subtitle1">
                      {rule.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rule.description}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={rule.priority}
                        color={getPriorityColor(rule.priority)}
                        size="small"
                      />
                      <Chip
                        label={rule.status}
                        color={getStatusColor(rule.status)}
                        size="small"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Conditions
                    </Typography>
                    <List dense>
                      {rule.conditions.map((condition) => (
                        <ListItem key={condition.id}>
                          <ListItemText
                            primary={`${condition.field} ${condition.operator} ${condition.value}`}
                            secondary={condition.logic}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Actions
                    </Typography>
                    <List dense>
                      {rule.actions.map((action) => (
                        <ListItem key={action.id}>
                          <ListItemText
                            primary={action.type.replace('_', ' ')}
                            secondary={Object.entries(action.parameters)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    {renderRulePerformance(rule)}
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEditRule(rule)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={rule.status === 'active' ? <Stop /> : <PlayArrow />}
                        onClick={() => handleToggleRule(rule.id)}
                        color={rule.status === 'active' ? 'error' : 'success'}
                      >
                        {rule.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRule ? 'Edit Rule' : 'Create New Rule'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Rule Name"
              defaultValue={selectedRule?.name}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              defaultValue={selectedRule?.description}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  defaultValue={selectedRule?.category || 'transaction'}
                >
                  <MenuItem value="transaction">Transaction</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="behavior">Behavior</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  defaultValue={selectedRule?.priority || 'medium'}
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
            {selectedRule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 