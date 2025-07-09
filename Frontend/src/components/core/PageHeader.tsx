import type { ReactNode } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'text' | 'outlined' | 'contained';
  };
  children?: ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  action,
  children,
}: PageHeaderProps) => {
  return (
    <Box mb={4}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h4" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Button
            variant={action.variant || 'contained'}
            onClick={action.onClick}
            disabled={action.disabled}
            startIcon={action.icon}
          >
            {action.label}
          </Button>
        )}
      </Box>
      {children && (
        <>
          <Box my={3}>{children}</Box>
          <Divider />
        </>
      )}
    </Box>
  );
}; 