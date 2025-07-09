import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { useAI } from '../../hooks/useAI';

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
      id={`ai-analytics-tabpanel-${index}`}
      aria-labelledby={`ai-analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const AIAnalyticsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const {
    models,
    selectedModel,
    modelPerformance,
    predictions,
    anomalies,
    patterns,
    riskScores,
    falsePositives,
    analyses,
    loading,
    error,
    selectModel,
    trainModel,
  } = useAI();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderModelPerformance = () => {
    if (!modelPerformance) return null;

    return (
      <Card>
        <CardHeader title="Model Performance Metrics" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Accuracy</Typography>
              <Typography variant="h6">
                {(modelPerformance.metrics.accuracy * 100).toFixed(2)}%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Precision</Typography>
              <Typography variant="h6">
                {(modelPerformance.metrics.precision * 100).toFixed(2)}%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Recall</Typography>
              <Typography variant="h6">
                {(modelPerformance.metrics.recall * 100).toFixed(2)}%
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderAnomalies = () => {
    return (
      <Timeline>
        {anomalies.map((anomaly) => (
          <TimelineItem key={anomaly.id}>
            <TimelineSeparator>
              <TimelineDot color={
                anomaly.severity === 'HIGH' ? 'error' :
                anomaly.severity === 'MEDIUM' ? 'warning' : 'success'
              } />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle2">{anomaly.anomalyType}</Typography>
              <Typography variant="body2">{anomaly.description}</Typography>
              <Typography variant="caption">
                {new Date(anomaly.detectedAt).toLocaleString()}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  const renderPatterns = () => {
    return (
      <List>
        {patterns.map((pattern) => (
          <ListItem key={pattern.id}>
            <ListItemText
              primary={pattern.patternType}
              secondary={
                <>
                  <Typography variant="body2">{pattern.description}</Typography>
                  <Box mt={1}>
                    <Chip
                      label={`Confidence: ${(pattern.confidence * 100).toFixed(2)}%`}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={`Risk: ${pattern.risk}`}
                      size="small"
                      color={
                        pattern.risk === 'HIGH' ? 'error' :
                        pattern.risk === 'MEDIUM' ? 'warning' : 'success'
                      }
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        AI Analytics Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Model Performance" />
          <Tab label="Anomaly Detection" />
          <Tab label="Pattern Recognition" />
          <Tab label="Risk Analysis" />
          <Tab label="False Positives" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {loading ? (
                <CircularProgress />
              ) : (
                <>
                  <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                      Available Models
                    </Typography>
                    <Grid container spacing={2}>
                      {models.map((model) => (
                        <Grid item xs={12} sm={6} md={4} key={model.id}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6">{model.name}</Typography>
                              <Typography color="textSecondary">
                                Version: {model.version}
                              </Typography>
                              <Typography color="textSecondary">
                                Type: {model.type}
                              </Typography>
                              <Box mt={2}>
                                <Button
                                  variant="contained"
                                  onClick={() => selectModel(model.id)}
                                  disabled={loading}
                                >
                                  Select Model
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  {selectedModel && renderModelPerformance()}
                </>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {loading ? <CircularProgress /> : renderAnomalies()}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {loading ? <CircularProgress /> : renderPatterns()}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {loading ? (
                <CircularProgress />
              ) : (
                <List>
                  {riskScores.map((score) => (
                    <ListItem key={score.id}>
                      <ListItemText
                        primary={`Risk Score: ${score.score}`}
                        secondary={
                          <>
                            <Typography variant="body2">
                              Entity: {score.entityType} ({score.entityId})
                            </Typography>
                            <Typography variant="body2">
                              Previous Score: {score.previousScore}
                            </Typography>
                            <Box mt={1}>
                              {score.factors.map((factor, index) => (
                                <Chip
                                  key={index}
                                  label={`${factor.factor}: ${factor.contribution}`}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {loading ? (
                <CircularProgress />
              ) : (
                <List>
                  {falsePositives.map((fp) => (
                    <ListItem key={fp.id}>
                      <ListItemText
                        primary={`Alert ID: ${fp.alertId}`}
                        secondary={
                          <>
                            <Typography variant="body2">
                              Original Score: {fp.originalScore}
                            </Typography>
                            <Typography variant="body2">
                              Adjusted Score: {fp.adjustedScore}
                            </Typography>
                            <Typography variant="body2">
                              Reason: {fp.reason}
                            </Typography>
                            <Typography variant="body2">
                              Analyst: {fp.analyst}
                            </Typography>
                            <Box mt={1}>
                              {fp.learningPoints.map((point, index) => (
                                <Typography key={index} variant="body2">
                                  • {point}
                                </Typography>
                              ))}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}; 