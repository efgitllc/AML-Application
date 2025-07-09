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
} from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSecurity } from '../../hooks/useSecurity';

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
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const SecurityDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const {
    events,
    sessions,
    alerts,
    encryptionKeys,
    metrics,
    configuration,
    loading,
    error,
    loadEvents,
    terminateSession,
    terminateAllOtherSessions,
    updateAlert,
    rotateKey,
    loadMetrics,
  } = useSecurity();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
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

  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Failed Login Attempts</Typography>
            <Typography variant="h4">{metrics.failedLoginAttempts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Sessions</Typography>
            <Typography variant="h4">{metrics.activeSessions}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">MFA Enrollment Rate</Typography>
            <Typography variant="h4">{(metrics.mfaEnrollmentRate * 100).toFixed(1)}%</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderAlerts = () => {
    return (
      <List>
        {alerts.map((alert) => (
          <ListItem key={alert.id}>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1">{alert.type}</Typography>
                  <Chip
                    label={alert.severity}
                    color={getSeverityColor(alert.severity) as any}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2">{alert.description}</Typography>
                  <Typography variant="caption">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <Button
                size="small"
                onClick={() => updateAlert(alert.id, { status: 'RESOLVED' })}
                disabled={alert.status === 'RESOLVED'}
              >
                Resolve
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderSessions = () => {
    return (
      <>
        <Box mb={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => terminateAllOtherSessions()}
          >
            Terminate All Other Sessions
          </Button>
        </Box>
        <List>
          {sessions.map((session) => (
            <ListItem key={session.id}>
              <ListItemText
                primary={`Device: ${session.deviceInfo.deviceType} - ${session.deviceInfo.browser}`}
                secondary={
                  <>
                    <Typography variant="body2">
                      Started: {new Date(session.startTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Last Activity: {new Date(session.lastActivity).toLocaleString()}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="terminate"
                  onClick={() => terminateSession(session.id)}
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

  const renderEncryptionKeys = () => {
    return (
      <List>
        {encryptionKeys.map((key) => (
          <ListItem key={key.id}>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <VpnKeyIcon />
                  <Typography>{key.type} - {key.algorithm}</Typography>
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2">
                    Status: {key.status}
                  </Typography>
                  <Typography variant="body2">
                    Created: {new Date(key.createdAt).toLocaleDateString()}
                  </Typography>
                  {key.lastRotated && (
                    <Typography variant="body2">
                      Last Rotated: {new Date(key.lastRotated).toLocaleDateString()}
                    </Typography>
                  )}
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="rotate"
                onClick={() => rotateKey(key.id)}
                disabled={key.status === 'REVOKED'}
              >
                <RefreshIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Security Dashboard
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
          {renderMetrics()}

          <Paper sx={{ mt: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Security Alerts" />
              <Tab label="Active Sessions" />
              <Tab label="Encryption Keys" />
              <Tab label="Security Events" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {renderAlerts()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {renderSessions()}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {renderEncryptionKeys()}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <List>
                {events.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemText
                      primary={event.eventType}
                      secondary={
                        <>
                          <Typography variant="body2">
                            Status: {event.status}
                          </Typography>
                          <Typography variant="body2">
                            IP: {event.ipAddress}
                          </Typography>
                          <Typography variant="caption">
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
}; 