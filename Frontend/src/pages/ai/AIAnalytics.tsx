import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  Warning,
  Security,
  Timeline,
  Assessment,
  BugReport,
  Speed,
  Insights,
  Refresh,
  Settings,
  Download
} from '@mui/icons-material';
import { Chart } from '../../components/core/Chart';

interface MLMetric {
  id: string;
  name: string;
  value: number;
  trend: number;
  status: 'optimal' | 'warning' | 'critical';
  category: 'risk' | 'behavior' | 'anomaly' | 'prediction';
}

interface BehavioralPattern {
  id: string;
  type: 'transaction' | 'login' | 'activity';
  description: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  detectedAt: string;
  status: 'new' | 'investigating' | 'resolved';
}

interface AnomalyDetection {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
  falsePositive: boolean;
  confidence: number;
}

export const AIAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mlMetrics, setMLMetrics] = useState<MLMetric[]>([]);
  const [patterns, setPatterns] = useState<BehavioralPattern[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setMLMetrics([
      {
        id: 'ML001',
        name: 'Risk Prediction Accuracy',
        value: 94.5,
        trend: 2.3,
        status: 'optimal',
        category: 'risk'
      },
      {
        id: 'ML002',
        name: 'Behavioral Analysis Precision',
        value: 88.7,
        trend: -1.2,
        status: 'warning',
        category: 'behavior'
      },
      {
        id: 'ML003',
        name: 'Anomaly Detection Rate',
        value: 96.2,
        trend: 1.5,
        status: 'optimal',
        category: 'anomaly'
      },
      {
        id: 'ML004',
        name: 'False Positive Reduction',
        value: 78.4,
        trend: 5.6,
        status: 'warning',
        category: 'prediction'
      }
    ]);

    setPatterns([
      {
        id: 'BP001',
        type: 'transaction',
        description: 'Unusual transaction pattern detected in corporate accounts',
        confidence: 89.5,
        riskLevel: 'medium',
        detectedAt: '2024-01-20T10:30:00Z',
        status: 'new'
      },
      {
        id: 'BP002',
        type: 'login',
        description: 'Multiple failed login attempts from unusual locations',
        confidence: 95.2,
        riskLevel: 'high',
        detectedAt: '2024-01-20T09:15:00Z',
        status: 'investigating'
      }
    ]);

    setAnomalies([
      {
        id: 'AN001',
        type: 'transaction_velocity',
        description: 'Sudden increase in transaction frequency',
        severity: 'high',
        detectedAt: '2024-01-20T11:00:00Z',
        falsePositive: false,
        confidence: 92.8
      },
      {
        id: 'AN002',
        type: 'behavior_change',
        description: 'Unexpected change in customer transaction pattern',
        severity: 'medium',
        detectedAt: '2024-01-20T10:45:00Z',
        falsePositive: false,
        confidence: 87.3
      }
    ]);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    // TODO: Implement refresh logic
    setTimeout(() => setLoading(false), 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          AI/ML Analytics Dashboard
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
            startIcon={<Settings />}
          >
            ML Settings
          </Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3}>
        {/* ML Metrics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {mlMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {metric.name}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Typography variant="h4" component="div">
                        {metric.value}%
                      </Typography>
                      <Chip
                        size="small"
                        label={`${metric.trend > 0 ? '+' : ''}${metric.trend}%`}
                        color={metric.trend > 0 ? 'success' : 'error'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Chip
                      size="small"
                      label={metric.status}
                      color={getStatusColor(metric.status)}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Behavioral Patterns */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Behavioral Patterns
            </Typography>
            <List>
              {patterns.map((pattern) => (
                <ListItem key={pattern.id}>
                  <ListItemIcon>
                    <Psychology />
                  </ListItemIcon>
                  <ListItemText
                    primary={pattern.description}
                    secondary={`Confidence: ${pattern.confidence}% | Detected: ${new Date(pattern.detectedAt).toLocaleString()}`}
                  />
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={pattern.riskLevel}
                      color={getRiskColor(pattern.riskLevel)}
                    />
                    <Chip
                      size="small"
                      label={pattern.status}
                      color={pattern.status === 'new' ? 'error' : pattern.status === 'investigating' ? 'warning' : 'success'}
                    />
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Anomaly Detection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Anomaly Detection
            </Typography>
            <List>
              {anomalies.map((anomaly) => (
                <ListItem key={anomaly.id}>
                  <ListItemIcon>
                    <Warning />
                  </ListItemIcon>
                  <ListItemText
                    primary={anomaly.description}
                    secondary={`Type: ${anomaly.type} | Confidence: ${anomaly.confidence}%`}
                  />
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={anomaly.severity}
                      color={getRiskColor(anomaly.severity)}
                    />
                    {anomaly.falsePositive && (
                      <Chip
                        size="small"
                        label="False Positive"
                        color="default"
                      />
                    )}
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* ML Performance Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              ML Performance Trends
            </Typography>
            <Chart
              title="Model Performance Over Time"
              type="line"
              data={[
                { date: '2023-Q1', accuracy: 88, precision: 85, recall: 82 },
                { date: '2023-Q2', accuracy: 90, precision: 87, recall: 84 },
                { date: '2023-Q3', accuracy: 92, precision: 89, recall: 86 },
                { date: '2023-Q4', accuracy: 94, precision: 91, recall: 88 }
              ]}
              xAxisKey="date"
              series={[
                { key: 'accuracy', label: 'Accuracy' },
                { key: 'precision', label: 'Precision' },
                { key: 'recall', label: 'Recall' }
              ]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 