import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

export const Reports = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body1">
            Reports dashboard content will be implemented here.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}; 