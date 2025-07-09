import { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  loading?: boolean;
  debounceMs?: number;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export const SearchInput = ({
  placeholder = 'Search...',
  value: externalValue,
  onChange,
  onSearch,
  loading = false,
  debounceMs = 300,
  fullWidth = true,
  size = 'medium',
}: SearchInputProps) => {
  const [value, setValue] = useState(externalValue || '');
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    setValue(externalValue || '');
  }, [externalValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      onChange(value);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, debounceMs, onChange]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleClear = () => {
    setValue('');
    onChange('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <Box width={fullWidth ? '100%' : 'auto'}>
      <TextField
        fullWidth={fullWidth}
        size={size}
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress size={20} />
              ) : value ? (
                <IconButton
                  size="small"
                  aria-label="clear"
                  onClick={handleClear}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              ) : null}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}; 