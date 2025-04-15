import { Skeleton, Box, Paper } from '@mui/material';
import { useInitialPatients, PatientRow } from '../../hooks/useInitialPatients';
import { PatientDashboardTable } from '../PatientDashboardTable';
import { PatientSummaryCard } from '../PatientsSummary';
import {
  skeletonContainerStyles,
  skeletonBoxStyles,
  skeletonRowStyles,
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
      <Box>
        {/* Skeleton for the summary cards */}
        <Paper sx={skeletonContainerStyles}>
          <Box sx={skeletonBoxStyles}>
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                variant="rectangular"
                width="33%"
                height={120}
                animation="wave"
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
    );
  }

  return (
    <div>
      <PatientSummaryCard rows={data} />
      <PatientDashboardTable rows={filteredRows} />
    </div>
  );
};
