import { Fragment } from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <Box mb={3}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          const content = (
            <Fragment key={item.label}>
              {item.icon && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    mr: 0.5,
                    verticalAlign: 'text-bottom',
                  }}
                >
                  {item.icon}
                </Box>
              )}
              {item.label}
            </Fragment>
          );

          if (isLast) {
            return (
              <Typography
                key={item.label}
                color="text.primary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {content}
              </Typography>
            );
          }

          return item.href ? (
            <Link
              key={item.label}
              component={RouterLink}
              to={item.href}
              color="inherit"
              sx={{
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {content}
            </Link>
          ) : (
            <Typography
              key={item.label}
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {content}
            </Typography>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}; 