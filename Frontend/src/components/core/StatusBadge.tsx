import { Chip, type ChipProps } from '@mui/material';

type StatusType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default'
  | 'primary'
  | 'secondary';

type StatusVariant = 'filled' | 'outlined';

interface StatusBadgeProps extends Omit<ChipProps, 'color' | 'variant'> {
  status: StatusType;
  variant?: StatusVariant;
}

const getStatusColor = (status: StatusType): ChipProps['color'] => {
  switch (status) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'info':
      return 'info';
    case 'primary':
      return 'primary';
    case 'secondary':
      return 'secondary';
    default:
      return 'default';
  }
};

export const StatusBadge = ({
  status,
  variant = 'filled',
  ...props
}: StatusBadgeProps) => {
  return (
    <Chip
      {...props}
      color={getStatusColor(status)}
      variant={variant}
      sx={{
        fontWeight: 'medium',
        ...props.sx,
      }}
    />
  );
}; 