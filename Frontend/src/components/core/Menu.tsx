import { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  Menu as MuiMenu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface MenuProps {
  items: MenuItemProps[];
  icon?: ReactNode;
  label?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export const Menu = ({
  items,
  icon = <MoreVertIcon />,
  label = 'more',
  disabled = false,
  children,
}: MenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (onClick?: () => void) => {
    return () => {
      handleClose();
      onClick?.();
    };
  };

  const trigger = children ? (
    <span onClick={handleClick}>{children}</span>
  ) : (
    <IconButton
      ref={buttonRef}
      aria-label={label}
      aria-controls="menu"
      aria-haspopup="true"
      onClick={handleClick}
      disabled={disabled}
      size="small"
    >
      {icon}
    </IconButton>
  );

  return (
    <>
      {trigger}
      <MuiMenu
        id="menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {items.map((item, index) => (
          <div key={index}>
            <MenuItem
              onClick={handleItemClick(item.onClick)}
              disabled={item.disabled}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText>
                <Typography variant="inherit" noWrap>
                  {item.label}
                </Typography>
              </ListItemText>
            </MenuItem>
            {item.divider && <Divider />}
          </div>
        ))}
      </MuiMenu>
    </>
  );
}; 