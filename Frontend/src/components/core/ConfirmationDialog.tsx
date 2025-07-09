import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

type ConfirmationType = 'warning' | 'error' | 'info' | 'success';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const getIcon = (type: ConfirmationType) => {
  switch (type) {
    case 'warning':
      return <WarningIcon color="warning" fontSize="large" />;
    case 'error':
      return <ErrorIcon color="error" fontSize="large" />;
    case 'success':
      return <SuccessIcon color="success" fontSize="large" />;
    default:
      return <InfoIcon color="info" fontSize="large" />;
  }
};

export const ConfirmationDialog = ({
  open,
  title,
  message,
  type = 'warning',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirmation-dialog-title"
    >
      <DialogTitle id="confirmation-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          {getIcon(type)}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={type === 'error' ? 'error' : 'primary'}
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 