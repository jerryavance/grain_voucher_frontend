import * as React from 'react';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

interface IProgressIndicatorProps {
    size?: number | undefined;
    color?: "inherit" | "primary" | "secondary" | "success" | undefined;
    sx?: object;
}

const ProgressIndicator: React.FC<IProgressIndicatorProps> = ({size, color = "primary", sx}) => {
  return (
    <Stack sx={{ color: 'grey.500', ...sx }} spacing={2} direction="row">
      <CircularProgress size={size} color={color} />
    </Stack>
  );
}

export default ProgressIndicator;
