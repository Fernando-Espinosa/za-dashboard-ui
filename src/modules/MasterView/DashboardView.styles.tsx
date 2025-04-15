import { SxProps, Theme } from '@mui/material';

export const skeletonContainerStyles: SxProps<Theme> = {
  mb: 2,
  p: 2,
};

export const skeletonBoxStyles: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 2,
};

export const skeletonRowStyles: SxProps<Theme> = {
  mt: 0.5,
};

export const dashboardContainerStyles: SxProps<Theme> = {
  width: '100%',
  overflowX: 'auto',
  py: 2,
};
