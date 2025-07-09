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
  Badge,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  NotificationsActive as PushIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';

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
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const NotificationCenter: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<NotificationTemplate>>({
    name: '',
    type: 'IN_APP',
    subject: '',
    content: '',
    category: '',
    priority: 'MEDIUM',
  });

  const {
    notifications,
    preferences,
    templates,
    channels,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    createTemplate,
    updateChannel,
    testChannel,
    subscribeToPush,
    unsubscribeFromPush,
  } = useNotifications();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'URGENT':
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

  const renderStats = () => {
    if (!stats) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Notifications</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Unread</Typography>
            <Typography variant="h4">{stats.unread}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Delivery Success Rate</Typography>
            <Typography variant="h4">
              {((stats.deliveryStats.successful / stats.total) * 100).toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Pending Notifications</Typography>
            <Typography variant="h4">{stats.deliveryStats.pending}</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderNotifications = () => {
    return (
      <>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button onClick={() => markAllAsRead()}>Mark All as Read</Button>
        </Box>
        <List>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">{notification.title}</Typography>
                    <Chip
                      label={notification.priority}
                      color={getPriorityColor(notification.priority) as any}
                      size="small"
                    />
                    <Chip label={notification.category} size="small" />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">{notification.message}</Typography>
                    <Typography variant="caption">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                {!notification.read && (
                  <IconButton
                    edge="end"
                    aria-label="mark as read"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CheckIcon />
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteNotification(notification.id)}
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

  const renderChannels = () => {
    return (
      <List>
        {channels.map((channel) => (
          <ListItem key={channel.id}>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  {channel.type === 'EMAIL' && <EmailIcon />}
                  {channel.type === 'SMS' && <SmsIcon />}
                  {channel.type === 'PUSH' && <PushIcon />}
                  <Typography>{channel.type}</Typography>
                  <Chip
                    label={channel.status}
                    color={channel.status === 'ACTIVE' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2">
                    Last Checked: {new Date(channel.lastChecked).toLocaleString()}
                  </Typography>
                  {channel.errorMessage && (
                    <Typography variant="body2" color="error">
                      Error: {channel.errorMessage}
                    </Typography>
                  )}
                </>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={channel.enabled}
                onChange={(e) =>
                  updateChannel(channel.id, { enabled: e.target.checked })
                }
              />
              <Button
                size="small"
                onClick={() => testChannel(channel.id)}
                disabled={!channel.enabled}
              >
                Test
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderTemplates = () => {
    return (
      <>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            onClick={() => setTemplateDialogOpen(true)}
          >
            Create Template
          </Button>
        </Box>
        <List>
          {templates.map((template) => (
            <ListItem key={template.id}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">{template.name}</Typography>
                    <Chip label={template.type} size="small" />
                    <Chip
                      label={template.priority}
                      color={getPriorityColor(template.priority) as any}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">Subject: {template.subject}</Typography>
                    <Typography variant="body2">Category: {template.category}</Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={template.active}
                  onChange={(e) =>
                    updateTemplate(template.id, { active: e.target.checked })
                  }
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Notification Template</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Subject"
                value={newTemplate.subject}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, subject: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                value={newTemplate.content}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, content: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Category"
                value={newTemplate.category}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, category: e.target.value })
                }
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                createTemplate(newTemplate);
                setTemplateDialogOpen(false);
              }}
              variant="contained"
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const renderPreferences = () => {
    if (!preferences) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Notification Channels
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.channels.email}
                  onChange={(e) =>
                    updatePreferences({
                      channels: { ...preferences.channels, email: e.target.checked },
                    })
                  }
                />
              }
              label="Email Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.channels.inApp}
                  onChange={(e) =>
                    updatePreferences({
                      channels: { ...preferences.channels, inApp: e.target.checked },
                    })
                  }
                />
              }
              label="In-App Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.channels.sms}
                  onChange={(e) =>
                    updatePreferences({
                      channels: { ...preferences.channels, sms: e.target.checked },
                    })
                  }
                />
              }
              label="SMS Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.channels.push}
                  onChange={(e) => {
                    if (e.target.checked) {
                      subscribeToPush();
                    } else {
                      unsubscribeFromPush();
                    }
                    updatePreferences({
                      channels: { ...preferences.channels, push: e.target.checked },
                    });
                  }}
                />
              }
              label="Push Notifications"
            />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Quiet Hours
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.quietHours.enabled}
                  onChange={(e) =>
                    updatePreferences({
                      quietHours: {
                        ...preferences.quietHours,
                        enabled: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Enable Quiet Hours"
            />
          </Grid>
          {preferences.quietHours.enabled && (
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) =>
                    updatePreferences({
                      quietHours: {
                        ...preferences.quietHours,
                        start: e.target.value,
                      },
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) =>
                    updatePreferences({
                      quietHours: {
                        ...preferences.quietHours,
                        end: e.target.value,
                      },
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Batch Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.batchNotifications}
                  onChange={(e) =>
                    updatePreferences({
                      batchNotifications: e.target.checked,
                    })
                  }
                />
              }
              label="Batch Notifications"
            />
          </Grid>
          {preferences.batchNotifications && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Batch Interval (minutes)"
                type="number"
                value={preferences.batchInterval}
                onChange={(e) =>
                  updatePreferences({
                    batchInterval: parseInt(e.target.value, 10),
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Notification Center
        </Typography>
        <IconButton onClick={() => setPreferencesOpen(true)}>
          <SettingsIcon />
        </IconButton>
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
              <Tab label="Notifications" />
              <Tab label="Channels" />
              <Tab label="Templates" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {renderNotifications()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {renderChannels()}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {renderTemplates()}
            </TabPanel>
          </Paper>

          <Dialog
            open={preferencesOpen}
            onClose={() => setPreferencesOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Notification Preferences</DialogTitle>
            <DialogContent>
              {renderPreferences()}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreferencesOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
}; 