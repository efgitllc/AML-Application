import { forwardRef } from 'react';
import {
  Alert as MuiAlert,
  AlertTitle,
  IconButton,
  Collapse,
  Box,
} from '@mui/material';
import type { AlertProps as MuiAlertProps } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface AlertProps extends Omit<MuiAlertProps, 'onClose'> {
  title?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  show?: boolean;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      title,
      children,
      action,
      onClose,
      show = true,
      variant = 'standard',
      ...props
    },
    ref
  ) => {
    return (
      <Collapse in={show}>
        <MuiAlert
          ref={ref}
          variant={variant}
          action={
            <Box>
              {action}
              {onClose && (
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={onClose}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              )}
            </Box>
          }
          {...props}
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {children}
        </MuiAlert>
      </Collapse>
    );
  }
);

Alert.displayName = 'Alert'; 