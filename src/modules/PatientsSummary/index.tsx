// PatientSummaryCard.tsx
import { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { PatientRow } from '../../hooks/useInitialPatients';

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
          const isFilter = isFilterable(key);

          return (
            <Grid item xs={6} md={2} key={key}>
              <Card
                sx={{
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
                }}
                onClick={() => {
                  if (isFilter) onToggleFilter(key);
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isFilter && (
                      <FilterAltIcon
                        fontSize="small"
                        sx={{
                          color: isActive ? '#1976d2' : '#757575',
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (s) => s.toUpperCase())}
                    {isFilter && (
                      <Chip
                        size="small"
                        label="Filter"
                        sx={{
                          height: '16px',
                          fontSize: '10px',
                          ml: 'auto',
                        }}
                        color={isActive ? 'primary' : 'default'}
                      />
                    )}
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
