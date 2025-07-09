import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { login, verifyMFA, clearError, clearMFA } from '../../store/slices/authSlice';
import { MFAVerification } from '../../components/auth/MFAVerification';

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    mfaRequired, 
    mfaUserId 
  } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());
    
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      await dispatch(login({ 
        email: email.trim(), 
        password,
        remember_me: rememberMe 
      })).unwrap();
    } catch (err: any) {
      console.error('Login error:', err);
      setLocalError(err || 'Login failed. Please try again.');
    }
  };

  const handleMFAVerification = async (code: string, userId: string) => {
    try {
      await dispatch(verifyMFA({ code, userId })).unwrap();
    } catch (err: any) {
      console.error('MFA verification error:', err);
      // Error will be handled by the MFA component
    }
  };

  const handleBackToLogin = () => {
    dispatch(clearMFA());
    setEmail('');
    setPassword('');
    setLocalError('');
  };

  // Show MFA verification if required
  if (mfaRequired && mfaUserId) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MFAVerification
            userId={mfaUserId}
            onVerificationSuccess={handleMFAVerification}
            isLoading={isLoading}
            error={error}
            onBack={handleBackToLogin}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                QBT AML SYSTEM 
              </Typography>
              {/* <Typography variant="h6" color="text.secondary" gutterBottom>
              QBT AML SYSTEM
              </Typography> */}
              <Typography variant="body2" color="text.secondary">
                Sign in to access your QBT AML SYSTEM dashboard
              </Typography>
            </Box>

            {(localError || error) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {localError || error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                disabled={isLoading}
                autoComplete="email"
                autoFocus
                error={!!(localError || error)}
                placeholder="Enter your email address"
                inputProps={{
                  'data-testid': 'email-input',
                }}
              />
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                disabled={isLoading}
                autoComplete="current-password"
                error={!!(localError || error)}
                placeholder="Enter your password"
                inputProps={{
                  'data-testid': 'password-input',
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Remember me"
                sx={{ mt: 1 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading || !email || !password}
                data-testid="login-button"
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <MuiLink 
                  component={Link} 
                  to="/forgot-password" 
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Forgot your password?
                </MuiLink>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <MuiLink 
                    component={Link} 
                    to="/register" 
                    variant="body2"
                    sx={{ textDecoration: 'none' }}
                  >
                    Sign up here
                  </MuiLink>
                </Typography>
              </Box>
            </form>

            {/* Development hint */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="caption" color="info.contrastText">
                <strong>Development Mode:</strong> Connected to Django backend at localhost:8000
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}; 