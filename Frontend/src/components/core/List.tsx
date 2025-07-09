import type { ReactNode } from 'react';
import {
  List as MuiList,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemButton,
  Typography,
  Divider,
  Checkbox,
  IconButton,
} from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';

interface ListItemData {
  id: string | number;
  primary: string;
  secondary?: string;
  icon?: ReactNode;
  action?: ReactNode;
  disabled?: boolean;
  selected?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface ListProps {
  items: ListItemData[];
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  dense?: boolean;
  disablePadding?: boolean;
}

export const List = ({
  items,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  dense = false,
  disablePadding = false,
}: ListProps) => {
  const handleToggle = (id: string | number) => () => {
    if (!onSelectionChange) return;

    const currentIndex = selectedIds.indexOf(id);
    const newSelectedIds = [...selectedIds];

    if (currentIndex === -1) {
      newSelectedIds.push(id);
    } else {
      newSelectedIds.splice(currentIndex, 1);
    }

    onSelectionChange(newSelectedIds);
  };

  return (
    <MuiList dense={dense} disablePadding={disablePadding}>
      {items.map((item, index) => {
        const isSelected = selectedIds.includes(item.id);

        const listItem = (
          <ListItem
            key={item.id}
            disablePadding={!item.divider}
            secondaryAction={
              item.action && (
                <ListItemSecondaryAction>
                  {typeof item.action === 'string' ? (
                    <IconButton edge="end" aria-label={item.action}>
                      <ChevronRightIcon />
                    </IconButton>
                  ) : (
                    item.action
                  )}
                </ListItemSecondaryAction>
              )
            }
          >
            <ListItemButton
              onClick={item.onClick}
              disabled={item.disabled}
              selected={item.selected}
            >
              {selectable && (
                <Checkbox
                  edge="start"
                  checked={isSelected}
                  onChange={handleToggle(item.id)}
                  tabIndex={-1}
                  disableRipple
                />
              )}
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    color={item.disabled ? 'text.disabled' : 'text.primary'}
                  >
                    {item.primary}
                  </Typography>
                }
                secondary={
                  item.secondary && (
                    <Typography
                      variant="body2"
                      color={item.disabled ? 'text.disabled' : 'text.secondary'}
                    >
                      {item.secondary}
                    </Typography>
                  )
                }
              />
            </ListItemButton>
          </ListItem>
        );

        return item.divider ? (
          <div key={item.id}>
            {listItem}
            <Divider />
          </div>
        ) : (
          listItem
        );
      })}
    </MuiList>
  );
}; 