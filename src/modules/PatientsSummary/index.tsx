import { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { PatientRow } from '../../hooks/useInitialPatients';

type Props = {
  rows: PatientRow[];
};

export const PatientSummaryCard = ({ rows }: Props) => {
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
      highBloodPressure,
      lowOxygen,
      avgHeartRate,
    };
  }, [rows]);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {Object.entries(summary).map(([key, value]) => (
          <Grid item xs={6} md={2} key={key}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  {key.replace(/([A-Z])/g, ' $1')}
                </Typography>
                <Typography variant="h5">{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
