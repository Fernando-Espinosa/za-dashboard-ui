import { useState } from 'react';

import { Skeleton, Box, Paper } from '@mui/material';
import { useInitialPatients, PatientRow } from '../../hooks/useInitialPatients';
import { PatientDashboardTable } from '../PatientDashboardTable';
import { PatientSummaryCard } from '../PatientsSummary';

export const DashboardView = () => {
  const { data, isLoading } = useInitialPatients();
  const [filter, setFilter] = useState<string | null>(null);

  const filteredRows: PatientRow[] =
    filter && data
      ? data.filter((row) => {
          if (filter === 'highBP') {
            const [sys, dia] = row.bloodPressure.split('/').map(Number);
            return sys > 140 || dia > 90;
          }
          if (filter === 'lowO2') {
            return row.oxygenLevel < 92;
          }
          return true;
        })
      : data || [];

  const handleFilterToggle = (filterKey: string) => {
    setFilter((prev) => (prev === filterKey ? null : filterKey));
  };

  if (isLoading || !data) {
    return (
      <Box>
        {/* Skeleton for the summary cards */}
        <Paper sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
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
              sx={{ mt: 0.5 }}
            />
          ))}
        </Paper>
      </Box>
    );
  }

  return (
    <div>
      <PatientSummaryCard
        rows={data}
        activeFilter={filter}
        onToggleFilter={handleFilterToggle}
      />
      <PatientDashboardTable rows={filteredRows} />
    </div>
  );
};
