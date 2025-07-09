import type { ReactNode } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';

interface FormProps {
  title?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  error?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  maxWidth?: number | string;
}

export const Form = ({
  title,
  children,
  onSubmit,
  loading = false,
  error,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  maxWidth = 600,
}: FormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        width: '100%',
        maxWidth,
        mx: 'auto',
      }}
    >
      {title && (
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      )}

      <Box sx={{ mb: 3 }}>{children}</Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2} justifyContent="flex-end">
        {onCancel && (
          <Grid item xs={6} sm={3}>
            <Button
              type="button"
              onClick={onCancel}
              disabled={loading}
              variant="outlined"
              fullWidth
            >
              {cancelLabel}
            </Button>
          </Grid>
        )}
        <Grid item xs={6} sm={3}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : undefined
            }
            fullWidth
          >
            {submitLabel}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}; 