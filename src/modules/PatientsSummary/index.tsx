// PatientSummaryCard.tsx
import { useMemo } from 'react';
import { PatientRow } from '@/hooks/useInitialPatients';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';

type Props = {
  rows: PatientRow[];
  activeFilter: string | null;
  onToggleFilter: (filterKey: string) => void;
};

export const PatientSummaryCard = ({
  rows,
  activeFilter,
  onToggleFilter,
}: Props) => {
  const summary = useMemo(() => {
    const total = rows.length;
    const males = rows.filter((p) => p.gender === 'Male').length;
    const females = rows.filter((p) => p.gender === 'Female').length;

    const highBloodPressure = rows.filter((p) => {
      const [sys, dia] = p.bloodPressure.split('/').map(Number);
      return sys > 140 || dia > 90;
    }).length;

    const lowOxygen = rows.filter((p) => p.oxygenLevel < 92).length;

    const avgHeartRate = Math.round(
      rows.reduce((sum, p) => sum + p.heartRate, 0) / total
    );

    return {
      total,
      males,
      females,
      avgHeartRate,
      highBP: highBloodPressure,
      lowO2: lowOxygen,
    };
  }, [rows]);

  const isFilterable = (key: string) => key === 'highBP' || key === 'lowO2';

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {Object.entries(summary).map(([key, value]) => {
          const isActive = key === activeFilter;
          return (
            <Grid item xs={6} md={2} key={key}>
              <Card
                sx={{
                  cursor: isFilterable(key) ? 'pointer' : 'default',
                  border: isActive ? '2px solid #1976d2' : '1px solid #ccc',
                  backgroundColor: isActive ? '#e3f2fd' : 'white',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  if (isFilterable(key)) onToggleFilter(key);
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (s) => s.toUpperCase())}
                  </Typography>
                  <Typography variant="h5">{value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
