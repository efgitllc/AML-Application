import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface FilterOption {
  label: string;
  value: string;
  group: string;
}

interface FilterGroup {
  label: string;
  name: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface FilterProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onChange: (filters: Record<string, string[]>) => void;
}

export const Filter = ({
  groups,
  selectedFilters,
  onChange,
}: FilterProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleFilterClick = (group: FilterGroup, value: string) => {
    const currentValues = selectedFilters[group.name] || [];
    let newValues: string[];

    if (group.multiSelect) {
      newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
    } else {
      newValues = currentValues.includes(value) ? [] : [value];
    }

    onChange({
      ...selectedFilters,
      [group.name]: newValues,
    });
  };

  const handleClearAll = () => {
    onChange({});
  };

  const selectedCount = Object.values(selectedFilters).reduce(
    (count, values) => count + values.length,
    0
  );

  const filterContent = (
    <Box
      sx={{
        width: isMobile ? 'auto' : 300,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6">Filters</Typography>
        {isMobile && (
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {selectedCount > 0 && (
        <Button
          onClick={handleClearAll}
          color="inherit"
          sx={{ alignSelf: 'flex-start', mb: 2 }}
        >
          Clear all filters
        </Button>
      )}

      <Stack spacing={3} sx={{ flex: 1, overflow: 'auto' }}>
        {groups.map((group) => (
          <Box key={group.name}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {group.label}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {group.options.map((option) => {
                const isSelected = (
                  selectedFilters[group.name] || []
                ).includes(option.value);

                return (
                  <Chip
                    key={option.value}
                    label={option.label}
                    onClick={() => handleFilterClick(group, option.value)}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );

  return (
    <>
      <Button
        onClick={handleToggle}
        variant="outlined"
        startIcon={<FilterIcon />}
        size="small"
      >
        Filters
        {selectedCount > 0 && (
          <Chip
            label={selectedCount}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </Button>

      {isMobile ? (
        <Drawer anchor="right" open={isOpen} onClose={handleClose}>
          {filterContent}
        </Drawer>
      ) : (
        <Box
          sx={{
            position: 'fixed',
            top: 64,
            right: 0,
            bottom: 0,
            width: 300,
            bgcolor: 'background.paper',
            borderLeft: 1,
            borderColor: 'divider',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: theme.transitions.create('transform'),
            zIndex: theme.zIndex.drawer,
          }}
        >
          {filterContent}
        </Box>
      )}
    </>
  );
}; 