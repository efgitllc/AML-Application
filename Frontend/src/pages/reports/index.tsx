import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Download,
  Search,
  Description,
  Assessment,
  CompareArrows,
  Person,
  FileDownload,
} from '@mui/icons-material';
import { mockReportsData } from '../../mocks/data';
import type { Report, ReportCategory } from '../../types/analytics';

export const Reports = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'Completed':
        return theme.palette.success;
      case 'In Progress':
        return theme.palette.warning;
      case 'Under Review':
        return theme.palette.info;
      default:
        return theme.palette.primary;
    }
  };

  const getCategoryIcon = (name: string) => {
    switch (true) {
      case name.includes('Compliance'):
        return <Assessment />;
      case name.includes('Risk'):
        return <CompareArrows />;
      case name.includes('Transaction'):
        return <Description />;
      case name.includes('Customer'):
        return <Person />;
      default:
        return <Description />;
    }
  };

  const filteredReports = mockReportsData.recentReports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Reports
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Access and generate compliance and risk reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          Generate Report
        </Button>
      </Box>

      {/* Report Categories */}
      <Grid container spacing={3} mb={4}>
        {mockReportsData.reportCategories.map((category) => (
          <Grid item xs={12} sm={6} md={3} key={category.id}>
            <Card
              sx={{
                height: '100%',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    {getCategoryIcon(category.name)}
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {category.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.name}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Reports */}
      <Card
        sx={{
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Recent Reports</Typography>
            <TextField
              size="small"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 250,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => {
                  const statusColor = getStatusColor(report.status);
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Description sx={{ mr: 1, color: theme.palette.primary.main }} />
                          {report.title}
                        </Box>
                      </TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>
                        {new Date(report.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          size="small"
                          sx={{
                            bgcolor: alpha(statusColor.main, 0.1),
                            color: statusColor.main,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => window.open(report.downloadUrl, '_blank')}
                        >
                          <FileDownload />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}; 