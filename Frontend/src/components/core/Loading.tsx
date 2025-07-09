import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

export const Loading = ({
  message = 'Loading...',
  size = 40,
  fullScreen = false,
}: LoadingProps) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      height={fullScreen ? '100vh' : '100%'}
      minHeight={fullScreen ? undefined : 200}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body1" color="textSecondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgcolor="background.paper"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return content;
}; 