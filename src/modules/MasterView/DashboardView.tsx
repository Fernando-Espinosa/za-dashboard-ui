import { Skeleton, Box, Paper, Container } from '@mui/material';
import { useInitialPatients, PatientRow } from '../../hooks/useInitialPatients';
import { PatientDashboardTable } from '../PatientDashboardTable';
import { PatientSummaryCard } from '../PatientsSummary';
import {
  skeletonContainerStyles,
  skeletonBoxStyles,
  skeletonRowStyles,
  dashboardContainerStyles,
} from './DashboardView.styles';
import { useAppSelector } from '../../store/hooks';
import { selectCardFilter } from '../../store/filtersSlice';

export const DashboardView = () => {
  const { data, isLoading } = useInitialPatients();
  const cardFilter = useAppSelector(selectCardFilter);

  const filteredRows: PatientRow[] =
    cardFilter && data
      ? data.filter((row) => {
          if (cardFilter === 'highBP') {
            const [sys, dia] = row.bloodPressure.split('/').map(Number);
            return sys > 140 || dia > 90;
          }
          // Oxygen level filters
          if (cardFilter === 'lowO2') {
            return row.oxygenLevel < 92;
          }
          if (cardFilter === 'normalO2') {
            return row.oxygenLevel >= 92 && row.oxygenLevel <= 98;
          }
          if (cardFilter === 'highO2') {
            return row.oxygenLevel > 98;
          }
          // Heart rate filters
          if (cardFilter === 'lowHR') {
            return row.heartRate < 60;
          }
          if (cardFilter === 'normalHR') {
            return row.heartRate >= 60 && row.heartRate <= 100;
          }
          if (cardFilter === 'highHR') {
            return row.heartRate > 100;
          }
          return true;
        })
      : data || [];

  if (isLoading || !data) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Skeleton for the summary cards */}
          <Paper sx={skeletonContainerStyles} data-testid="skeleton-container">
            <Box sx={skeletonBoxStyles}>
              {[1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  variant="rectangular"
                  width="100%"
                  height={120}
                  animation="wave"
                  sx={{ flexBasis: { xs: '100%', sm: '50%', md: '33%' } }}
                />
              ))}
            </Box>
          </Paper>

          {/* Skeleton for table header */}
          <Paper>
            <Skeleton variant="rectangular" height={56} animation="wave" />

            {/* Skeleton for 10 table rows */}
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                height={52}
                animation="wave"
                sx={skeletonRowStyles}
              />
            ))}
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={dashboardContainerStyles}>
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <PatientSummaryCard rows={data} />
        <PatientDashboardTable rows={filteredRows} />
      </Box>
    </Container>
  );
};
