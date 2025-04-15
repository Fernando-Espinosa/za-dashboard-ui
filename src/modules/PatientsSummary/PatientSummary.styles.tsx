import { SxProps, Theme } from '@mui/material';

// Card styles
export const getCardStyles = (
  isFilter: boolean,
  isActive: boolean
): SxProps<Theme> => ({
  cursor: isFilter ? 'pointer' : 'default',
  border: isActive ? '2px solid #1976d2' : '1px solid #ccc',
  backgroundColor: isActive ? '#e3f2fd' : 'white',
  transition: 'all 0.2s ease',
  position: 'relative',
  ...(isFilter && {
    borderLeft: '4px solid #f50057',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
  }),
});

// Typography styles
export const typographyContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

// Filter icon styles
export const getFilterIconStyles = (isActive: boolean): SxProps<Theme> => ({
  color: isActive ? '#1976d2' : '#757575',
  verticalAlign: 'middle',
});

// Chip styles
export const filterChipStyles: SxProps<Theme> = {
  height: '16px',
  fontSize: '10px',
  ml: 'auto',
};

// Summary box styles
export const summaryBoxStyles: SxProps<Theme> = {
  mb: 3,
};
