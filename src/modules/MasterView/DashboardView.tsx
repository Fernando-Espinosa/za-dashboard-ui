import { useState } from 'react';

import { CircularProgress } from '@mui/material';
import { useInitialPatients, PatientRow } from '../../hooks/useInitialPatients';
import { PatientDashboardTable } from '../PatientDashboardTable';
import { PatientSummaryCard } from '../PatientsSummary';

export const DashboardView = () => {
  const { data, isLoading } = useInitialPatients();
  const [filter, setFilter] = useState<string | null>(null);

  if (isLoading || !data) return <CircularProgress />;

  const filteredRows: PatientRow[] = filter
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
    : data;

  const handleFilterToggle = (filterKey: string) => {
    setFilter((prev) => (prev === filterKey ? null : filterKey));
  };

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
