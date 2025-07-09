import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  DevicesOther as DeviceIcon,
} from '@mui/icons-material';

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  lastSeen: string;
  location: string;
  ipAddress: string;
  macAddress: string;
}

const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Fingerprint Scanner A1',
    type: 'Biometric Scanner',
    status: 'active',
    lastSeen: '2024-02-20T10:30:00Z',
    location: 'Main Office',
    ipAddress: '192.168.1.100',
    macAddress: '00:1B:44:11:3A:B7',
  },
  {
    id: '2',
    name: 'Facial Recognition Camera B2',
    type: 'Camera',
    status: 'warning',
    lastSeen: '2024-02-20T10:25:00Z',
    location: 'Entrance',
    ipAddress: '192.168.1.101',
    macAddress: '00:1B:44:11:3A:B8',
  },
  {
    id: '3',
    name: 'Document Scanner C3',
    type: 'Scanner',
    status: 'error',
    lastSeen: '2024-02-20T09:15:00Z',
    location: 'Back Office',
    ipAddress: '192.168.1.102',
    macAddress: '00:1B:44:11:3A:B9',
  },
];

export const DeviceManagement = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    ipAddress: '',
    macAddress: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddDevice = () => {
    setSelectedDevice(null);
    setFormData({
      name: '',
      type: '',
      location: '',
      ipAddress: '',
      macAddress: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      type: device.type,
      location: device.location,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter(device => device.id !== deviceId));
  };

  const handleRefreshDevices = () => {
    // In a real application, this would fetch the latest device data from the API
    console.log('Refreshing device list...');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.type || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    if (selectedDevice) {
      // Update existing device
      setDevices(devices.map(device =>
        device.id === selectedDevice.id
          ? { ...device, ...formData }
          : device
      ));
    } else {
      // Add new device
      const newDevice: Device = {
        id: Math.random().toString(36).substr(2, 9),
        status: 'inactive',
        lastSeen: new Date().toISOString(),
        ...formData,
      };
      setDevices([...devices, newDevice]);
    }

    setIsDialogOpen(false);
    setError(null);
  };

  const getStatusIcon = (status: Device['status']) => {
    switch (status) {
      case 'active':
        return <CheckIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <DeviceIcon color="disabled" />;
    }
  };

  const getStatusChip = (status: Device['status']) => {
    return (
      <Chip
        icon={getStatusIcon(status)}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={
          status === 'active'
            ? 'success'
            : status === 'warning'
            ? 'warning'
            : status === 'error'
            ? 'error'
            : 'default'
        }
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Device Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshDevices}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddDevice}
          >
            Add Device
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Seen</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>MAC Address</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell>{getStatusChip(device.status)}</TableCell>
                    <TableCell>{new Date(device.lastSeen).toLocaleString()}</TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>{device.ipAddress}</TableCell>
                    <TableCell>{device.macAddress}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditDevice(device)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDevice(device.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDevice ? 'Edit Device' : 'Add New Device'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Device Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label="Device Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <TextField
              label="IP Address"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
            />
            <TextField
              label="MAC Address"
              value={formData.macAddress}
              onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedDevice ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 