import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Warning,
  Security,
  Assignment,
  Person,
  Business,
  Receipt,
  FilterList,
  Search,
  Refresh,
  FileDownload,
  Flag,
  CheckCircle,
  Cancel,
  Schedule,
  AttachFile,
  Comment,
  History,
  Gavel,
  AccountBalance,
  ExpandMore,
  Close,
  Save,
  TrendingUp,
  TrendingDown,
  NotificationsActive,
  Timer,
  Assessment,
  Folder,
  PriorityHigh
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { 
  mockCases, 
  mockUsers,
  mockCustomers,
  mockTransactions,
  mockAlerts
} from '../mocks';
import type { Case, User, Customer, Transaction, Alert as AlertType } from '../types';
import { StatCard } from '../components/core/StatCard';

type CaseType = 'aml_investigation' | 'suspicious_activity' | 'compliance_review' | 'customer_review' | 'transaction_review' | 'regulatory_inquiry';
type Status = 'open' | 'investigating' | 'pending_review' | 'closed' | 'escalated' | 'on_hold';
type Priority = 'low' | 'medium' | 'high' | 'critical';

const caseTypeColors: Record<CaseType, string> = {
  aml_investigation: 'primary',
  suspicious_activity: 'error',
  compliance_review: 'warning',
  customer_review: 'info',
  transaction_review: 'secondary',
  regulatory_inquiry: 'error'
};

const statusColors: Record<Status, string> = {
  open: 'error',
  investigating: 'warning',
  pending_review: 'info',
  closed: 'success',
  escalated: 'error',
  on_hold: 'default'
};

const priorityColors: Record<Priority, string> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  critical: 'error'
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`case-tabpanel-${index}`}
      aria-labelledby={`case-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface AssignedUser extends User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface RelatedCustomer {
  id: string;
  firstName: string;
  lastName: string;
  riskLevel: string;
}

interface RelatedAlert extends AlertType {
  id: string;
  title: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  customer: {
    id: string;
  };
}

const CaseDetailsDialog: React.FC<{
  case_: Case | null;
  open: boolean;
  onClose: () => void;
}> = ({ case_, open, onClose }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [newNote, setNewNote] = useState('');
  
  if (!case_) return null;

  const assignedUser = case_.assignedTo ? 
    mockUsers.find(u => typeof u.id === 'string' && u.id === case_.assignedTo?.id) as AssignedUser | null : 
    null;
  const relatedCustomer = case_.customerId ? 
    mockCustomers.find(c => typeof c.id === 'string' && c.id === case_.customerId) as RelatedCustomer | null : 
    null;
  const relatedAlerts = mockAlerts
    .filter(alert => {
      const typedAlert = alert as RelatedAlert;
      return typedAlert.customer?.id === case_.customerId;
    })
    .map(alert => alert as RelatedAlert);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log('Adding note:', newNote);
      setNewNote('');
    }
  };

  const getCaseIcon = (type: string) => {
    switch (type) {
      case 'aml_investigation': return <Security />;
      case 'suspicious_activity': return <Warning />;
      case 'compliance_review': return <Gavel />;
      case 'customer_review': return <Person />;
      case 'transaction_review': return <Receipt />;
      case 'regulatory_inquiry': return <AccountBalance />;
      default: return <Assignment />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                mr: 2, 
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${theme.palette[caseTypeColors[case_.caseType as CaseType] as CaseTypeColor].main} 0%, ${theme.palette[caseTypeColors[case_.caseType as CaseType] as CaseTypeColor].dark} 100%)`,
              }}
            >
              {getCaseIcon(case_.caseType)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Case #{case_.caseNumber}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {case_.title}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={case_.priority} 
              color={priorityColors[case_.priority as Priority]} 
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette[priorityColors[case_.priority as Priority]].main, 0.2)} 0%, ${alpha(theme.palette[priorityColors[case_.priority as Priority]].main, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette[priorityColors[case_.priority as Priority]].main, 0.2)}`,
                color: theme.palette[priorityColors[case_.priority as Priority]].main,
                fontWeight: 'medium',
              }}
            />
            <Chip 
              label={case_.status} 
              color={statusColors[case_.status as Status]} 
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette[statusColors[case_.status as Status]].main, 0.2)} 0%, ${alpha(theme.palette[statusColors[case_.status as Status]].main, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette[statusColors[case_.status as Status]].main, 0.2)}`,
                color: theme.palette[statusColors[case_.status as Status]].main,
                fontWeight: 'medium',
              }}
            />
          </Stack>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontWeight: 'medium',
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              },
              '& .MuiTabs-indicator': {
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Investigation" />
            <Tab label="Documents" />
            <Tab label="Timeline" />
            <Tab label="Related Data" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card 
                sx={{ 
                  background: alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="medium">
                    Case Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Case Number" 
                        secondary={case_.caseNumber} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Flag color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Title" 
                        secondary={case_.title} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Comment color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Description" 
                        secondary={case_.description} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {getCaseIcon(case_.caseType)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Case Type" 
                        secondary={
                          <Chip 
                            label={case_.caseType.replace('_', ' ')} 
                            size="small"
                            sx={{
                              background: `linear-gradient(135deg, ${alpha(theme.palette[caseTypeColors[case_.caseType as CaseType] as CaseTypeColor].main, 0.2)} 0%, ${alpha(theme.palette[caseTypeColors[case_.caseType as CaseType] as CaseTypeColor].main, 0.1)} 100%)`,
                              border: `1px solid ${alpha(theme.palette[caseTypeColors[case_.caseType as CaseType] as CaseTypeColor].main, 0.2)}`,
                              color: theme.palette[caseTypeColors[case_.caseType as CaseType] as CaseTypeColor].main,
                              fontWeight: 'medium',
                            }}
                            icon={getCaseIcon(case_.caseType)}
                          />
                        } 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Card 
                  sx={{ 
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="medium">
                      Assignment
                    </Typography>
                    {assignedUser ? (
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 1,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          }}
                        >
                          {assignedUser.firstName[0]}{assignedUser.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {assignedUser.firstName} {assignedUser.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {assignedUser.role}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Alert severity="info">
                        This case is not assigned to anyone.
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  sx={{ 
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="medium">
                      Customer Information
                    </Typography>
                    {relatedCustomer ? (
                      <Box>
                        <Typography variant="subtitle1">
                          {relatedCustomer.firstName} {relatedCustomer.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Customer ID: {relatedCustomer.id}
                        </Typography>
                        <Chip 
                          label={`Risk Level: ${relatedCustomer.riskLevel}`}
                          size="small"
                          sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            color: theme.palette.warning.main,
                            fontWeight: 'medium',
                          }}
                        />
                      </Box>
                    ) : (
                      <Alert severity="info">
                        No customer associated with this case.
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  sx={{ 
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="medium">
                      Quick Actions
                    </Typography>
                    <Stack spacing={1}>
                      <Button 
                        variant="outlined" 
                        startIcon={<Edit />}
                        fullWidth
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        Edit Case
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<AttachFile />}
                        fullWidth
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        Add Document
                      </Button>
                      {case_.status === 'open' && (
                        <Button 
                          variant="contained"
                          startIcon={<CheckCircle />}
                          fullWidth
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                            }
                          }}
                        >
                          Close Case
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card 
                sx={{ 
                  background: alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="medium">
                    Investigation Notes
                  </Typography>
                  {case_.notes && case_.notes.length > 0 ? (
                    <List>
                      {case_.notes.map((note, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar 
                                  sx={{ 
                                    width: 24, 
                                    height: 24,
                                    fontSize: '12px',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                  }}
                                >
                                  {note.author.firstName[0]}{note.author.lastName[0]}
                                </Avatar>
                                <Typography variant="subtitle2">
                                  {note.author.firstName} {note.author.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  • {new Date(note.createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography 
                                variant="body2" 
                                sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                              >
                                {note.content}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      No investigation notes available.
                    </Alert>
                  )}
                  
                  <Box mt={3}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Add Investigation Note"
                      placeholder="Enter your investigation findings..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: alpha(theme.palette.background.paper, 0.5),
                        }
                      }}
                    />
                    <Button 
                      variant="contained" 
                      sx={{ 
                        mt: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                        }
                      }}
                      startIcon={<Add />}
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      Add Note
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Card 
                  sx={{ 
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="medium">
                      Investigation Status
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <AttachFile color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Evidence Collected" 
                          secondary="3 documents, 2 transactions"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Person color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Interviews Conducted" 
                          secondary="1 customer interview"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Schedule color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="External Requests" 
                          secondary="2 pending responses"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Card 
                  sx={{ 
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="medium">
                      Quick Actions
                    </Typography>
                    <Stack spacing={1}>
                      <Button 
                        variant="outlined" 
                        startIcon={<AttachFile />}
                        fullWidth
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        Upload Document
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<Schedule />}
                        fullWidth
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        Schedule Interview
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<Flag />}
                        fullWidth
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        Request External Info
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card 
            sx={{ 
              background: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Case Documents
              </Typography>
              {case_.documents && case_.documents.length > 0 ? (
                <List>
                  {case_.documents.map((doc, index) => (
                    <ListItem 
                      key={index} 
                      divider
                      sx={{
                        '&:hover': {
                          background: alpha(theme.palette.action.hover, 0.1),
                        },
                      }}
                    >
                      <ListItemIcon>
                        <AttachFile color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.fileName}
                        secondary={`${doc.fileType} • ${doc.fileSize} • Uploaded by ${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName} on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<FileDownload />}
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        Download
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No documents uploaded for this case.
                </Alert>
              )}
              
              <Box mt={3}>
                <Button 
                  variant="contained" 
                  startIcon={<AttachFile />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    }
                  }}
                >
                  Upload Document
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card 
            sx={{ 
              background: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Case Timeline
              </Typography>
              {case_.statusHistory && case_.statusHistory.length > 0 ? (
                <Box sx={{ py: 2 }}>
                  {case_.statusHistory.map((history, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        mb: index < case_.statusHistory!.length - 1 ? 3 : 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 2,
                          bgcolor: index < case_.statusHistory!.length - 1 ? alpha(theme.palette.divider, 0.2) : 'transparent',
                          ml: 2.5,
                          mt: 4,
                          height: index < case_.statusHistory!.length - 1 ? 40 : 0,
                        }}
                      />
                      <Box
                        sx={{
                          minWidth: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette[statusColors[history.status as Status]].main} 0%, ${theme.palette[statusColors[history.status as Status]].dark} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        <History sx={{ fontSize: 16, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          Status changed to {history.status}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          by {history.changedBy.firstName} {history.changedBy.lastName} • {new Date(history.changedAt).toLocaleString()}
                        </Typography>
                        {history.comment && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mt: 1,
                              p: 1.5,
                              borderRadius: 1,
                              background: alpha(theme.palette.background.paper, 0.5),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            {history.comment}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  No timeline history available.
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            {relatedAlerts.length > 0 && (
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="medium">
                      Related Alerts ({relatedAlerts.length})
                    </Typography>
                    <List>
                      {relatedAlerts.slice(0, 5).map((alert) => (
                        <ListItem 
                          key={alert.id} 
                          divider
                          sx={{
                            '&:hover': {
                              background: alpha(theme.palette.action.hover, 0.1),
                            },
                          }}
                        >
                          <ListItemIcon>
                            <Warning color={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={alert.title}
                            secondary={`${alert.type} • ${new Date(alert.timestamp).toLocaleString()}`}
                          />
                          <Chip 
                            label={alert.severity} 
                            size="small"
                            sx={{
                              background: `linear-gradient(135deg, ${alpha(theme.palette[alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'].main, 0.2)} 0%, ${alpha(theme.palette[alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'].main, 0.1)} 100%)`,
                              border: `1px solid ${alpha(theme.palette[alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'].main, 0.2)}`,
                              color: theme.palette[alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'].main,
                              fontWeight: 'medium',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Alert 
                severity="info"
                sx={{
                  background: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  '& .MuiAlert-icon': {
                    color: theme.palette.info.main,
                  },
                }}
              >
                Additional related data features coming soon.
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              background: alpha(theme.palette.action.hover, 0.1),
            }
          }}
        >
          Close
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Edit />}
          sx={{
            borderColor: alpha(theme.palette.primary.main, 0.5),
            '&:hover': {
              borderColor: theme.palette.primary.main,
              background: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          Edit Case
        </Button>
        {case_.status === 'open' && (
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<CheckCircle />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
              }
            }}
          >
            Close Case
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export const Cases: React.FC = () => {
  const theme = useTheme();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_);
    setDialogOpen(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  // Calculate statistics
  const openCases = mockCases.filter(c => c.status === 'open').length;
  const highPriorityCases = mockCases.filter(c => c.priority === 'high' || c.priority === 'critical').length;
  const casesClosedToday = mockCases.filter(c => 
    c.status === 'closed' && 
    new Date(c.updatedAt).toDateString() === new Date().toDateString()
  ).length;
  const unassignedCases = mockCases.filter(c => !c.assignedTo).length;

  const filteredCases = mockCases.filter((case_) => {
    const matchesSearch = 
      case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || case_.caseType === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const columns: GridColDef[] = [
    {
      field: 'caseNumber',
      headerName: 'Case Number',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="primary.main">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'caseType',
      headerName: 'Type',
      width: 180,
      renderCell: (params) => {
        const colorKey = caseTypeColors[params.value as CaseType] || 'primary';
        const color = theme.palette[colorKey] || theme.palette.primary;
        return (
          <Chip
            label={params.value.replace('_', ' ')}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(color.main, 0.2)} 0%, ${alpha(color.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(color.main, 0.2)}`,
              color: color.main,
              fontWeight: 'medium',
            }}
          />
        );
      },
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.description.slice(0, 60)}...
          </Typography>
        </Box>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params) => {
        const colorKey = priorityColors[params.value as Priority] || 'primary';
        const color = theme.palette[colorKey] || theme.palette.primary;
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(color.main, 0.2)} 0%, ${alpha(color.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(color.main, 0.2)}`,
              color: color.main,
              fontWeight: 'medium',
            }}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const colorKey = statusColors[params.value as Status] || 'default';
        const color = theme.palette[colorKey] || theme.palette.primary;
        return (
          <Chip
            label={params.value.replace('_', ' ')}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(color.main, 0.2)} 0%, ${alpha(color.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(color.main, 0.2)}`,
              color: color.main,
              fontWeight: 'medium',
            }}
          />
        );
      },
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 200,
      valueGetter: (params) => {
        if (!params.value) return 'Unassigned';
        const user = mockUsers.find(u => u.id === params.value.id);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
      },
      renderCell: (params) => {
        if (params.value === 'Unassigned') {
          return (
            <Typography variant="body2" color="text.secondary">
              Unassigned
            </Typography>
          );
        }
        const [firstName, lastName] = params.value.split(' ');
        return (
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                width: 24, 
                height: 24, 
                mr: 1, 
                fontSize: '12px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              {firstName[0]}{lastName[0]}
            </Avatar>
            <Typography variant="body2">
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : 'No due date';
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleString();
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <Tooltip title="View Details">
          <IconButton
            onClick={() => handleViewCase(params.row)}
            sx={{ color: theme.palette.primary.main }}
          >
            <Visibility />
          </IconButton>
        </Tooltip>,
      ],
    },
  ];

  return (
    <Box 
      sx={{ 
        p: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        minHeight: '100vh'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Case Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and manage investigation cases
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
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
            startIcon={<Add />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
              }
            }}
          >
            Create Case
          </Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Cases"
            value={openCases}
            trend={{ value: 8, isPositive: false }}
            icon={<NotificationsActive />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Priority"
            value={highPriorityCases}
            trend={{ value: 12, isPositive: false }}
            icon={<PriorityHigh />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Closed Today"
            value={casesClosedToday}
            icon={<CheckCircle />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unassigned"
            value={unassignedCases}
            trend={{ value: 5, isPositive: true }}
            icon={<Assignment />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      <Paper 
        sx={{ 
          p: 2, 
          mb: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search Cases"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                background: alpha(theme.palette.background.paper, 0.5),
              }
            }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <TextField
            select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                background: alpha(theme.palette.background.paper, 0.5),
              }
            }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="aml_investigation">AML Investigation</MenuItem>
            <MenuItem value="suspicious_activity">Suspicious Activity</MenuItem>
            <MenuItem value="compliance_review">Compliance Review</MenuItem>
            <MenuItem value="customer_review">Customer Review</MenuItem>
            <MenuItem value="transaction_review">Transaction Review</MenuItem>
            <MenuItem value="regulatory_inquiry">Regulatory Inquiry</MenuItem>
          </TextField>
          <TextField
            select
            label="Priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                background: alpha(theme.palette.background.paper, 0.5),
              }
            }}
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                background: alpha(theme.palette.background.paper, 0.5),
              }
            }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="investigating">Investigating</MenuItem>
            <MenuItem value="pending_review">Pending Review</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="escalated">Escalated</MenuItem>
            <MenuItem value="on_hold">On Hold</MenuItem>
          </TextField>
          <Box flexGrow={1} />
          <Stack direction="row" spacing={1}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />}
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.5),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Advanced
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<FileDownload />}
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.5),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Export
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper 
        sx={{ 
          height: 600, 
          width: '100%',
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderColor: alpha(theme.palette.divider, 0.1),
          },
          '& .MuiDataGrid-columnHeaders': {
            borderColor: alpha(theme.palette.divider, 0.1),
            background: alpha(theme.palette.background.paper, 0.5),
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              background: alpha(theme.palette.action.hover, 0.1),
            },
          },
        }}
      >
        <DataGrid
          rows={filteredCases}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 }
            },
            sorting: {
              sortModel: [{ field: 'createdAt', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          loading={loading}
        />
      </Paper>

      <CaseDetailsDialog
        case_={selectedCase}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCase(null);
        }}
      />
    </Box>
  );
}; 