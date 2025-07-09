import type { ReactNode } from 'react';
import {
  Tooltip as MuiTooltip,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

interface TooltipProps {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  arrow?: boolean;
  enterDelay?: number;
  leaveDelay?: number;
}

export const Tooltip = ({
  title,
  description,
  children,
  icon = <HelpIcon fontSize="small" />,
  placement = 'top',
  arrow = true,
  enterDelay = 200,
  leaveDelay = 0,
}: TooltipProps) => {
  const content = (
    <Box>
      <Typography variant="subtitle2">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );

  if (children) {
    return (
      <MuiTooltip
        title={content}
        placement={placement}
        arrow={arrow}
        enterDelay={enterDelay}
        leaveDelay={leaveDelay}
      >
        <span>{children}</span>
      </MuiTooltip>
    );
  }

  return (
    <MuiTooltip
      title={content}
      placement={placement}
      arrow={arrow}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
    >
      <IconButton
        size="small"
        color="inherit"
        aria-label={`help for ${title}`}
        sx={{
          ml: 0.5,
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        {icon}
      </IconButton>
    </MuiTooltip>
  );
}; 