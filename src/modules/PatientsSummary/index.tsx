// PatientSummaryCard.tsx
import { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { PatientRow } from '../../hooks/useInitialPatients';
import {
  summaryBoxStyles,
  getCardStyles,
  typographyContainerStyles,
  getFilterIconStyles,
  filterChipStyles,
} from './PatientSummary.styles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectCardFilter,
  setCardFilter,
  CardFilterKey,
} from '../../store/filtersSlice';

type Props = {
  rows: PatientRow[];
};

export const PatientSummaryCard = ({ rows }: Props) => {
  const dispatch = useAppDispatch();
  const activeFilter = useAppSelector(selectCardFilter);

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

  // Only highBP and lowO2 are filterable now
  const isFilterable = (key: string) => key === 'highBP' || key === 'lowO2';

  const handleToggleFilter = (filterKey: string) => {
    if (isFilterable(filterKey)) {
      dispatch(
        setCardFilter(
          activeFilter === filterKey ? null : (filterKey as CardFilterKey)
        )
      );
    }
  };

  return (
    <Box sx={summaryBoxStyles}>
      <Grid container spacing={2}>
        {Object.entries(summary).map(([key, value]) => {
          const isActive = key === activeFilter;
          const isFilter = isFilterable(key);

          return (
            <Grid key={key} sx={{ gridColumn: { xs: 'span 6', md: 'span 2' } }}>
              <Card
                sx={getCardStyles(isFilter, isActive)}
                onClick={() => {
                  if (isFilter) handleToggleFilter(key);
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={typographyContainerStyles}
                  >
                    {isFilter && (
                      <FilterAltIcon
                        fontSize="small"
                        sx={getFilterIconStyles(isActive)}
                      />
                    )}
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (s) => s.toUpperCase())}
                    {isFilter && (
                      <Chip
                        size="small"
                        label="Filter"
                        sx={filterChipStyles}
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
