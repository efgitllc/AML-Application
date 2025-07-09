import React from 'react';
import { Box, Typography } from '@mui/material';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This functionality is coming soon...
      </Typography>
    </Box>
  );
}; 