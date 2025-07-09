import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  DocumentScanner,
  CheckCircle,
  Error,
  Visibility,
  Delete,
  CreditCard,
  Assignment,
  Description,
  Badge,
  History
} from '@mui/icons-material';

interface Document {
  id: string;
  type: 'emirates_id' | 'passport' | 'visa' | 'trade_license' | 'other';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  number: string;
  expiryDate: string;
  verificationDate?: string;
  verificationMethod: 'manual' | 'automated' | 'api';
  metadata: {
    issuer?: string;
    nationality?: string;
    documentClass?: string;
    verificationScore?: number;
  };
}

export const DocumentVerification: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'DOC001',
      type: 'emirates_id',
      status: 'verified',
      number: '784-1234-5678901-1',
      expiryDate: '2025-12-31',
      verificationDate: '2024-01-20',
      verificationMethod: 'api',
      metadata: {
        issuer: 'UAE Federal Authority',
        nationality: 'UAE',
        documentClass: 'Citizen',
        verificationScore: 98
      }
    },
    {
      id: 'DOC002',
      type: 'passport',
      status: 'pending',
      number: 'N1234567',
      expiryDate: '2026-05-15',
      verificationMethod: 'manual',
      metadata: {
        issuer: 'UAE',
        nationality: 'UAE',
        documentClass: 'Regular'
      }
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleVerifyDocument = async (documentId: string) => {
    setLoading(true);
    // TODO: Implement document verification logic
    setTimeout(() => setLoading(false), 1500);
  };

  const handleUploadDocument = () => {
    setSelectedDocument(null);
    setOpenDialog(true);
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setOpenDialog(true);
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'emirates_id': return <Badge />;
      case 'passport': return <CreditCard />;
      case 'visa': return <Description />;
      case 'trade_license': return <Assignment />;
      default: return <DocumentScanner />;
    }
  };

  const renderVerificationDetails = (document: Document) => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Verification Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Method: {document.verificationMethod}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Date: {document.verificationDate || 'Not verified'}
          </Typography>
        </Grid>
        {document.metadata.verificationScore && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Verification Score: {document.metadata.verificationScore}%
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Document Verification
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={handleUploadDocument}
        >
          Upload Document
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3}>
        {/* Emirates ID Verification Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Emirates ID Verification
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Emirates ID Number"
                placeholder="784-XXXX-XXXXXXX-X"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<DocumentScanner />}
                fullWidth
              >
                Verify Emirates ID
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Recent Verifications
            </Typography>
            <List>
              {documents
                .filter(doc => doc.type === 'emirates_id')
                .map(doc => (
                  <ListItem key={doc.id}>
                    <ListItemIcon>
                      {getDocumentIcon(doc.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.number}
                      secondary={`Expires: ${doc.expiryDate}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={doc.status}
                        color={getStatusColor(doc.status)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>

        {/* Other Documents Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Other Documents
            </Typography>
            <List>
              {documents
                .filter(doc => doc.type !== 'emirates_id')
                .map(doc => (
                  <ListItem key={doc.id}>
                    <ListItemIcon>
                      {getDocumentIcon(doc.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${doc.type.replace('_', ' ').toUpperCase()} - ${doc.number}`}
                      secondary={`Expires: ${doc.expiryDate}`}
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <Chip
                          label={doc.status}
                          color={getStatusColor(doc.status)}
                          size="small"
                        />
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDocument ? 'Document Details' : 'Upload New Document'}
        </DialogTitle>
        <DialogContent>
          {selectedDocument ? (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedDocument.type.replace('_', ' ').toUpperCase()}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Document Number
                  </Typography>
                  <Typography variant="body1">
                    {selectedDocument.number}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Expiry Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedDocument.expiryDate}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  {renderVerificationDetails(selectedDocument)}
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                select
                label="Document Type"
                defaultValue="passport"
                sx={{ mb: 2 }}
              >
                <MenuItem value="passport">Passport</MenuItem>
                <MenuItem value="visa">Visa</MenuItem>
                <MenuItem value="trade_license">Trade License</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Document Number"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
              >
                Upload Document
                <input type="file" hidden />
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {selectedDocument ? 'Close' : 'Cancel'}
          </Button>
          {!selectedDocument && (
            <Button variant="contained" onClick={() => setOpenDialog(false)}>
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 