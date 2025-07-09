import type { ReactNode } from 'react';
import {
  Modal as MuiModal,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number | string;
  fullScreen?: boolean;
  showCloseButton?: boolean;
  disableBackdropClick?: boolean;
}

export const Modal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 600,
  fullScreen = false,
  showCloseButton = true,
  disableBackdropClick = false,
}: ModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (disableBackdropClick) {
      event.stopPropagation();
    }
  };

  return (
    <MuiModal
      open={open}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: fullScreen || isMobile ? '100%' : maxWidth,
          height: fullScreen || isMobile ? '100%' : 'auto',
          maxHeight: fullScreen || isMobile ? '100%' : '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          outline: 'none',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {(title || showCloseButton) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            {title && (
              <Typography
                id="modal-title"
                variant="h6"
                component="h2"
                sx={{ mr: 2 }}
              >
                {title}
              </Typography>
            )}
            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        )}
        <Box
          id="modal-description"
          sx={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </MuiModal>
  );
}; 