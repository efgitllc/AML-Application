import type { ReactNode } from 'react';
import {
  Card as MuiCard,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Box,
  Divider,
  Collapse,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface CardAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: CardAction[];
  expandable?: boolean;
  defaultExpanded?: boolean;
  headerAction?: ReactNode;
  footer?: ReactNode;
  sx?: SxProps<Theme>;
  children: ReactNode;
}

export const Card = ({
  title,
  subtitle,
  icon,
  actions,
  expandable = false,
  defaultExpanded = false,
  headerAction,
  footer,
  sx,
  children,
}: CardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <MuiCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <CardHeader
        avatar={icon}
        action={
          headerAction || (actions?.length ? (
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          ) : null)
        }
        title={
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        }
        subheader={
          subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )
        }
      />
      <CardContent sx={{ flex: 1 }}>
        {expandable ? (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {children}
          </Collapse>
        ) : (
          children
        )}
      </CardContent>
      {(footer || expandable || actions?.length) && (
        <>
          <Divider />
          <CardActions
            sx={{
              justifyContent: actions?.length
                ? 'space-between'
                : 'flex-end',
              px: 2,
              py: 1,
            }}
          >
            {actions?.length && (
              <Box>
                {actions.map((action, index) => (
                  <IconButton
                    key={index}
                    onClick={action.onClick}
                    aria-label={action.label}
                  >
                    {action.icon}
                  </IconButton>
                ))}
              </Box>
            )}
            {expandable && (
              <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: (theme) =>
                    theme.transitions.create('transform', {
                      duration: theme.transitions.duration.shortest,
                    }),
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
            {footer}
          </CardActions>
        </>
      )}
    </MuiCard>
  );
}; 