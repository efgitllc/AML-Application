import { Box, Skeleton as MuiSkeleton } from '@mui/material';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
  count?: number;
  spacing?: number;
}

export const Skeleton = ({
  variant = 'text',
  width = '100%',
  height,
  animation = 'pulse',
  count = 1,
  spacing = 1,
}: SkeletonProps) => {
  return (
    <Box sx={{ width }}>
      {Array.from({ length: count }).map((_, index) => (
        <MuiSkeleton
          key={index}
          variant={variant}
          width="100%"
          height={height}
          animation={animation}
          sx={{ mb: index < count - 1 ? spacing : 0 }}
        />
      ))}
    </Box>
  );
};

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  rowHeight?: number;
  headerHeight?: number;
  animation?: 'pulse' | 'wave' | false;
}

export const TableSkeleton = ({
  rowCount = 5,
  columnCount = 4,
  rowHeight = 53,
  headerHeight = 56,
  animation = 'pulse',
}: TableSkeletonProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          mb: 1,
          height: headerHeight,
          alignItems: 'center',
        }}
      >
        {Array.from({ length: columnCount }).map((_, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              px: 2,
            }}
          >
            <MuiSkeleton
              variant="text"
              width="80%"
              animation={animation}
            />
          </Box>
        ))}
      </Box>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: 'flex',
            height: rowHeight,
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <Box
              key={colIndex}
              sx={{
                flex: 1,
                px: 2,
              }}
            >
              <MuiSkeleton
                variant="text"
                width={`${Math.floor(Math.random() * 50) + 30}%`}
                animation={animation}
              />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

interface CardSkeletonProps {
  headerHeight?: number;
  contentHeight?: number;
  animation?: 'pulse' | 'wave' | false;
}

export const CardSkeleton = ({
  headerHeight = 72,
  contentHeight = 200,
  animation = 'pulse',
}: CardSkeletonProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: headerHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <MuiSkeleton
          variant="text"
          width="60%"
          animation={animation}
        />
      </Box>
      <Box sx={{ p: 2, flex: 1 }}>
        <MuiSkeleton
          variant="rectangular"
          width="100%"
          height={contentHeight}
          animation={animation}
        />
      </Box>
    </Box>
  );
}; 