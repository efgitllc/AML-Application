import { forwardRef } from 'react';
import {
  Snackbar,
  Alert as MuiAlert,
  type AlertProps,
  type SnackbarProps,
} from '@mui/material';

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

Alert.displayName = 'Alert';

type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps extends Omit<SnackbarProps, 'onClose'> {
  message: string;
  severity?: NotificationSeverity;
  onClose: () => void;
}

export const Notification = ({
  message,
  severity = 'info',
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  ...props
}: NotificationProps) => {
  return (
    <Snackbar
      open={props.open}
      autoHideDuration={autoHideDuration}
      onClose={(event, reason) => {
        if (reason === 'clickaway') return;
        onClose();
      }}
      anchorOrigin={anchorOrigin}
    >
      <Alert onClose={onClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
}; 