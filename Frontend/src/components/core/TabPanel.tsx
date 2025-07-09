import { useState } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { Box, Tab, Tabs } from '@mui/material';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface TabItem {
  label: string;
  content: ReactNode;
  icon?: ReactElement;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value?: number;
  onChange?: (newValue: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  centered?: boolean;
}

export const TabsPanel = ({
  items,
  value: controlledValue,
  onChange,
  orientation = 'horizontal',
  variant = 'standard',
  centered = false,
}: TabsProps) => {
  const [value, setValue] = useState(controlledValue || 0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setValue(newValue);
    }
  };

  const currentValue = controlledValue !== undefined ? controlledValue : value;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'row' : 'column',
      }}
    >
      <Tabs
        orientation={orientation}
        variant={variant}
        value={currentValue}
        onChange={handleChange}
        aria-label="tabs"
        centered={centered}
        sx={{
          borderRight: orientation === 'vertical' ? 1 : 0,
          borderBottom: orientation === 'horizontal' ? 1 : 0,
          borderColor: 'divider',
          ...(orientation === 'vertical' && {
            minWidth: 200,
          }),
        }}
      >
        {items.map((item, index) => (
          <Tab
            key={index}
            label={item.label}
            icon={item.icon}
            iconPosition="start"
            disabled={item.disabled}
            id={`tab-${index}`}
            aria-controls={`tabpanel-${index}`}
          />
        ))}
      </Tabs>
      <Box
        sx={{
          flex: 1,
          ...(orientation === 'vertical' && {
            ml: 3,
          }),
        }}
      >
        {items.map((item, index) => (
          <TabPanel key={index} value={currentValue} index={index}>
            {item.content}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}; 