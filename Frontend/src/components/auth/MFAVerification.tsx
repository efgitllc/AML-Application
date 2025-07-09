import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

interface MFAVerificationProps {
  userId: string;
  onVerificationSuccess: (code: string, userId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

export const MFAVerification: React.FC<MFAVerificationProps> = ({
  userId,
  onVerificationSuccess,
  isLoading,
  error,
  onBack,
}) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6 || code.length === 8) {
      await onVerificationSuccess(code, userId);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 8) {
      setCode(value);
    }
  };

  const isValidCode = code.length === 6 || code.length === 8; // 6 for TOTP, 8 for backup codes

  return (
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <SecurityIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter the 6-digit code from your authenticator app or an 8-digit backup code
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Verification Code"
            variant="outlined"
            margin="normal"
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            required
            disabled={isLoading}
            autoComplete="one-time-code"
            inputProps={{
              maxLength: 8,
              style: { 
                textAlign: 'center', 
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SecurityIcon />
                </InputAdornment>
              ),
            }}
            helperText={
              code.length === 6 
                ? `TOTP code refreshes in ${timeLeft}s`
                : code.length === 8
                ? "Using backup code"
                : "Enter 6-digit TOTP or 8-digit backup code"
            }
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onBack}
              disabled={isLoading}
            >
              Back to Login
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !isValidCode}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Verify'
              )}
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Having trouble? Contact your system administrator
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 