import { CircularProgress } from '@mui/material';
import { useInitialPatients } from '../../hooks/useInitialPatients';
import { PatientDashboardTable } from '../PatientDashboard';
import { PatientSummaryCard } from '../PatientsSummary';
import { DashboardViewContainer } from './MasterView.styles';

export const DashboardView = () => {
  const { data, isLoading } = useInitialPatients();

  if (isLoading) return <CircularProgress />;
  return (
    <DashboardViewContainer>
      <PatientDashboardTable />
      <PatientSummaryCard rows={data!} />
    </DashboardViewContainer>
  );
};
