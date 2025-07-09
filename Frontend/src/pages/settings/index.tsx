import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  useTheme,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  Chip,
  Stack,
  Button,
  alpha,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications,
  Security,
  Gavel,
  Settings as SettingsIcon,
  Api,
  Palette,
  Person,
  Check,
  Warning,
  Error,
  Email,
  Sms,
  Notifications as NotificationsIcon,
  Http as Webhook,
  Refresh,
} from '@mui/icons-material';
import { SettingsCard } from '../../components/core/SettingsCard';
import { mockSettingsData } from '../../mocks/settingsData';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Settings: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getHealthStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <Check sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'error':
        return <Error sx={{ color: theme.palette.error.main }} />;
      default:
        return null;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Email />;
      case 'sms':
        return <Sms />;
      case 'in_app':
        return <NotificationsIcon />;
      case 'webhook':
        return <Webhook />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Settings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Configure your AML system preferences and parameters
          </Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="settings tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
            },
          }}
        >
          <Tab
            icon={<Notifications />}
            label="Notifications"
            iconPosition="start"
          />
          <Tab
            icon={<Security />}
            label="Security"
            iconPosition="start"
          />
          <Tab
            icon={<Gavel />}
            label="Compliance"
            iconPosition="start"
          />
          <Tab
            icon={<SettingsIcon />}
            label="System"
            iconPosition="start"
          />
          <Tab
            icon={<Api />}
            label="API"
            iconPosition="start"
          />
          <Tab
            icon={<Palette />}
            label="Theme"
            iconPosition="start"
          />
          <Tab
            icon={<Person />}
            label="Preferences"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {mockSettingsData.notifications.map((notification) => (
            <Grid item xs={12} md={6} key={notification.id}>
              <SettingsCard
                title={`${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notifications`}
                icon={getNotificationIcon(notification.type)}
                onEdit={() => {}}
              >
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notification.enabled}
                        onChange={() => {}}
                        color="primary"
                      />
                    }
                    label="Enable Notifications"
                  />
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notification Events
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {notification.events.map((event) => (
                        <Chip
                          key={event}
                          label={event.split('_').join(' ').toUpperCase()}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </SettingsCard>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {mockSettingsData.security.map((setting) => (
            <Grid item xs={12} md={6} key={setting.id}>
              <SettingsCard
                title={setting.name}
                description={setting.description}
                icon={<Security />}
                onEdit={() => {}}
              >
                <Box>
                  {typeof setting.value === 'boolean' ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={setting.value}
                          onChange={() => {}}
                          color="primary"
                        />
                      }
                      label="Enable"
                    />
                  ) : typeof setting.value === 'number' ? (
                    <TextField
                      fullWidth
                      type="number"
                      value={setting.value}
                      onChange={() => {}}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Select
                      fullWidth
                      value={setting.value}
                      onChange={() => {}}
                      size="small"
                    >
                      <MenuItem value="strong">Strong</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="basic">Basic</MenuItem>
                    </Select>
                  )}
                </Box>
              </SettingsCard>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {mockSettingsData.compliance.map((setting) => (
            <Grid item xs={12} md={6} key={setting.id}>
              <SettingsCard
                title={setting.name}
                description={setting.description}
                icon={<Gavel />}
                onEdit={() => {}}
              >
                <Box>
                  {typeof setting.value === 'boolean' ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={setting.value as boolean}
                          onChange={() => {}}
                          color="primary"
                        />
                      }
                      label="Enable"
                    />
                  ) : typeof setting.value === 'number' ? (
                    <TextField
                      fullWidth
                      type="number"
                      value={setting.value}
                      onChange={() => {}}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Select
                      fullWidth
                      value={setting.value}
                      onChange={() => {}}
                      size="small"
                    >
                      <MenuItem value="enhanced">Enhanced</MenuItem>
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="basic">Basic</MenuItem>
                    </Select>
                  )}
                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Last updated: {new Date(setting.lastUpdated).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Updated by: {setting.updatedBy}
                    </Typography>
                    {setting.regulatoryReference && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Regulatory Reference: {setting.regulatoryReference}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </SettingsCard>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          {mockSettingsData.system.map((setting) => (
            <Grid item xs={12} md={6} key={setting.id}>
              <SettingsCard
                title={setting.name}
                description={setting.description}
                icon={<SettingsIcon />}
                onEdit={() => {}}
              >
                <Box>
                  {typeof setting.value === 'boolean' ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={setting.value as boolean}
                          onChange={() => {}}
                          color="primary"
                          disabled={!setting.isEditable}
                        />
                      }
                      label="Enable"
                    />
                  ) : typeof setting.value === 'number' ? (
                    <TextField
                      fullWidth
                      type="number"
                      value={setting.value}
                      onChange={() => {}}
                      variant="outlined"
                      size="small"
                      disabled={!setting.isEditable}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      value={setting.value}
                      onChange={() => {}}
                      variant="outlined"
                      size="small"
                      disabled={!setting.isEditable}
                    />
                  )}
                  {!setting.isEditable && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      This setting cannot be modified
                    </Typography>
                  )}
                </Box>
              </SettingsCard>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          {mockSettingsData.api.map((api) => (
            <Grid item xs={12} md={6} key={api.id}>
              <SettingsCard
                title={api.name}
                icon={<Api />}
                onEdit={() => {}}
              >
                <Box>
                  <TextField
                    fullWidth
                    label="Endpoint"
                    value={api.endpoint}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="API Key"
                    value={api.apiKey}
                    type="password"
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Tooltip title={`Status: ${api.healthStatus}`}>
                        {getHealthStatusIcon(api.healthStatus)}
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        Last checked: {new Date(api.lastChecked).toLocaleString()}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => {}}>
                      <Refresh />
                    </IconButton>
                  </Box>
                </Box>
              </SettingsCard>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingsCard
              title="Theme Settings"
              icon={<Palette />}
              onEdit={() => {}}
            >
              <Box>
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Theme Mode
                  </Typography>
                  <Select
                    fullWidth
                    value={mockSettingsData.theme.mode}
                    onChange={() => {}}
                    size="small"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </Box>
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Primary Color
                  </Typography>
                  <TextField
                    fullWidth
                    type="color"
                    value={mockSettingsData.theme.primaryColor}
                    onChange={() => {}}
                    size="small"
                  />
                </Box>
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Density
                  </Typography>
                  <Select
                    fullWidth
                    value={mockSettingsData.theme.density}
                    onChange={() => {}}
                    size="small"
                  >
                    <MenuItem value="comfortable">Comfortable</MenuItem>
                    <MenuItem value="compact">Compact</MenuItem>
                    <MenuItem value="standard">Standard</MenuItem>
                  </Select>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Border Radius
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={mockSettingsData.theme.borderRadius}
                    onChange={() => {}}
                    size="small"
                    InputProps={{
                      endAdornment: <Typography variant="body2">px</Typography>,
                    }}
                  />
                </Box>
              </Box>
            </SettingsCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={6}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingsCard
              title="User Preferences"
              icon={<Person />}
              onEdit={() => {}}
            >
              <Box>
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Language
                  </Typography>
                  <Select
                    fullWidth
                    value={mockSettingsData.preferences.language}
                    onChange={() => {}}
                    size="small"
                  >
                    <MenuItem value="en-US">English (US)</MenuItem>
                    <MenuItem value="ar-AE">Arabic (UAE)</MenuItem>
                    <MenuItem value="zh-CN">Chinese (Simplified)</MenuItem>
                  </Select>
                </Box>
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Timezone
                  </Typography>
                  <Select
                    fullWidth
                    value={mockSettingsData.preferences.timezone}
                    onChange={() => {}}
                    size="small"
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="Asia/Dubai">Asia/Dubai</MenuItem>
                    <MenuItem value="America/New_York">America/New_York</MenuItem>
                  </Select>
                </Box>
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Date Format
                  </Typography>
                  <Select
                    fullWidth
                    value={mockSettingsData.preferences.dateFormat}
                    onChange={() => {}}
                    size="small"
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Default Dashboard
                  </Typography>
                  <Select
                    fullWidth
                    value={mockSettingsData.preferences.defaultDashboard}
                    onChange={() => {}}
                    size="small"
                  >
                    <MenuItem value="analytics">Analytics</MenuItem>
                    <MenuItem value="compliance">Compliance</MenuItem>
                    <MenuItem value="cases">Cases</MenuItem>
                  </Select>
                </Box>
              </Box>
            </SettingsCard>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Settings;