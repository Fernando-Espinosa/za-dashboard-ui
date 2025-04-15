import { Box, styled } from '@mui/material';

export const DashboardViewContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '24px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));
