import { useState, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Box,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ArrowDropUp, ArrowDropDown, Clear } from '@mui/icons-material';
import { PATIENT_DASHBOARD_MESSAGES as Messages } from './userFacingMessages';
import { PatientRow } from '../../hooks/useInitialPatients';
import { useEchoWebSocket } from '../../hooks/useMockWebSocket';
import {
  highlightStyle,
  realTimeColumnStyle,
  tableStyle,
} from './PatientDashboard.styles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectBPFilter,
  selectO2Filter,
  selectHRFilter,
  selectAgeFilter,
  setBPFilter,
  setO2Filter,
  setHRFilter,
  setAgeFilter,
} from '../../store/filtersSlice';

const PAGE_SIZE = 10;

type Props = {
  rows: PatientRow[];
};

type SortDirection = 'asc' | 'desc';
type SortField = keyof PatientRow | null;
type Filters = Partial<Record<keyof PatientRow, string>>;
type BPCategory = 'all' | 'low' | 'normal' | 'high';
type O2Category = 'all' | 'low' | 'normal' | 'high';
type HRCategory = 'all' | 'low' | 'normal' | 'high';
type AgeRangeCategory = 'all' | 'under18' | '18to30' | '30to50' | 'over50';

export const PatientDashboardTable = ({ rows }: Props) => {
  const { TABLE } = Messages;
  const [page, setPage] = useState(0);
  const [highlightMap, setHighlightMap] = useState<Record<string, string[]>>(
    {}
  );
  const [sortField, setSortField] = useState<SortField>('age');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Filters>({});

  const dispatch = useAppDispatch();
  const bpFilter = useAppSelector(selectBPFilter);
  const o2Filter = useAppSelector(selectO2Filter);
  const hrFilter = useAppSelector(selectHRFilter);
  const ageFilter = useAppSelector(selectAgeFilter);

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [rows, filters, bpFilter, o2Filter, hrFilter, ageFilter]);

  const handleSort = (field: keyof PatientRow) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (field: keyof PatientRow, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilter = (field: keyof PatientRow) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };

  // Function to categorize blood pressure
  const getBPCategory = (bp: string): BPCategory => {
    const [systolic, diastolic] = bp.split('/').map(Number);

    if (systolic < 110 || diastolic < 70) return 'low';
    if (systolic > 130 || diastolic > 85) return 'high';
    return 'normal';
  };

  // Function to categorize oxygen level
  const getO2Category = (o2Level: number): O2Category => {
    if (o2Level < 92) return 'low';
    if (o2Level > 98) return 'high';
    return 'normal';
  };

  // Function to categorize heart rate
  const getHRCategory = (heartRate: number): HRCategory => {
    if (heartRate < 60) return 'low';
    if (heartRate > 100) return 'high';
    return 'normal';
  };

  // Function to categorize age
  const getAgeCategory = (age: number): AgeRangeCategory => {
    if (age < 18) return 'under18';
    if (age >= 18 && age <= 30) return '18to30';
    if (age > 30 && age <= 50) return '30to50';
    return 'over50';
  };

  // Apply filters to rows
  const filteredRows = rows.filter((row) => {
    // Apply blood pressure category filter
    if (bpFilter !== 'all' && getBPCategory(row.bloodPressure) !== bpFilter) {
      return false;
    }

    // Apply oxygen level category filter
    if (o2Filter !== 'all' && getO2Category(row.oxygenLevel) !== o2Filter) {
      return false;
    }

    // Apply heart rate category filter
    if (hrFilter !== 'all' && getHRCategory(row.heartRate) !== hrFilter) {
      return false;
    }

    // Apply age range filter
    if (ageFilter !== 'all' && getAgeCategory(row.age) !== ageFilter) {
      return false;
    }

    // Apply other text filters
    return Object.entries(filters).every(([field, value]) => {
      if (!value) return true;
      if (field === 'bloodPressure') return true; // Skip text filtering for BP, using category filter instead
      if (field === 'oxygenLevel') return true; // Skip text filtering for O2, using category filter instead
      if (field === 'heartRate') return true; // Skip text filtering for HR, using category filter instead
      if (field === 'age') return true; // Skip text filtering for age, using category filter instead

      const fieldValue = String(row[field as keyof PatientRow]).toLowerCase();
      return fieldValue.includes(value.toLowerCase());
    });
  });

  // Apply sorting to filtered rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (sortField === 'bloodPressure') {
        // Special handling for blood pressure (compare systolic)
        const aSystolic = parseInt(aValue.split('/')[0]);
        const bSystolic = parseInt(bValue.split('/')[0]);
        return sortDirection === 'asc'
          ? aSystolic - bSystolic
          : bSystolic - aSystolic;
      }
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Fallback for numeric values
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const currentPageRows = sortedRows.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const updateVitals = useCallback(
    (vitals: Partial<PatientRow> & { name: string }) => {
      rows.forEach((row) => {
        if (row.name !== vitals.name) return;

        const changedFields: string[] = [];
        if (vitals.bloodPressure && row.bloodPressure !== vitals.bloodPressure)
          changedFields.push('bloodPressure');
        if (vitals.heartRate && row.heartRate !== vitals.heartRate)
          changedFields.push('heartRate');
        if (vitals.oxygenLevel && row.oxygenLevel !== vitals.oxygenLevel)
          changedFields.push('oxygenLevel');

        if (changedFields.length > 0) {
          setHighlightMap((prev) => ({
            ...prev,
            [row.name]: changedFields,
          }));
          setTimeout(() => {
            setHighlightMap((prev) => ({
              ...prev,
              [row.name]: [],
            }));
          }, 1000);
        }
      });
    },
    [rows]
  );

  const patientNames = rows.map((r) => r.name);
  useEchoWebSocket(patientNames, updateVitals);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const isHighlighted = (name: string, field: keyof PatientRow) =>
    highlightMap[name]?.includes(field);

  const renderSortIcon = (field: keyof PatientRow) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />;
  };

  const handleBPFilterChange = (category: BPCategory) => {
    dispatch(setBPFilter(category));
  };

  const handleO2FilterChange = (category: O2Category) => {
    dispatch(setO2Filter(category));
  };

  const handleHRFilterChange = (category: HRCategory) => {
    dispatch(setHRFilter(category));
  };

  const handleAgeFilterChange = (category: AgeRangeCategory) => {
    dispatch(setAgeFilter(category));
  };

  const renderColumnHeader = (
    field: keyof PatientRow,
    label: string,
    align: 'left' | 'right' = 'left',
    additionalStyle = {}
  ) => {
    // Special case for blood pressure column
    if (field === 'bloodPressure') {
      return (
        <TableCell align={align} sx={additionalStyle}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleSort(field)}
            >
              {label}
              {renderSortIcon(field)}
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel id="bp-filter-label">BP Filter</InputLabel>
              <Select
                labelId="bp-filter-label"
                value={bpFilter}
                label="BP Filter"
                onChange={(e) =>
                  handleBPFilterChange(e.target.value as BPCategory)
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </TableCell>
      );
    }

    // Special case for oxygen level column
    if (field === 'oxygenLevel') {
      return (
        <TableCell align={align} sx={additionalStyle}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleSort(field)}
            >
              {label}
              {renderSortIcon(field)}
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel id="o2-filter-label">O2 Filter</InputLabel>
              <Select
                labelId="o2-filter-label"
                value={o2Filter}
                label="O2 Filter"
                onChange={(e) =>
                  handleO2FilterChange(e.target.value as O2Category)
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </TableCell>
      );
    }

    // Special case for heart rate column
    if (field === 'heartRate') {
      return (
        <TableCell align={align} sx={additionalStyle}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleSort(field)}
            >
              {label}
              {renderSortIcon(field)}
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel id="hr-filter-label">HR Filter</InputLabel>
              <Select
                labelId="hr-filter-label"
                value={hrFilter}
                label="HR Filter"
                onChange={(e) =>
                  handleHRFilterChange(e.target.value as HRCategory)
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="low">Low (&lt;60)</MenuItem>
                <MenuItem value="normal">Normal (60-100)</MenuItem>
                <MenuItem value="high">High (&gt;100)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </TableCell>
      );
    }

    // Special case for age column
    if (field === 'age') {
      return (
        <TableCell align={align} sx={additionalStyle}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleSort(field)}
            >
              {label}
              {renderSortIcon(field)}
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel id="age-filter-label">Age Range</InputLabel>
              <Select
                labelId="age-filter-label"
                value={ageFilter}
                label="Age Range"
                onChange={(e) =>
                  handleAgeFilterChange(e.target.value as AgeRangeCategory)
                }
              >
                <MenuItem value="all">All Ages</MenuItem>
                <MenuItem value="under18">&lt;18</MenuItem>
                <MenuItem value="18to30">18-30</MenuItem>
                <MenuItem value="30to50">30-50</MenuItem>
                <MenuItem value="over50">&gt;50</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </TableCell>
      );
    }

    // Regular column header with text filter
    return (
      <TableCell align={align} sx={additionalStyle}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => handleSort(field)}
          >
            {label}
            {renderSortIcon(field)}
          </Box>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Filter..."
            value={filters[field] || ''}
            onChange={(e) => handleFilterChange(field, e.target.value)}
            InputProps={{
              endAdornment: filters[field] && (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => clearFilter(field)}
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </TableCell>
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={tableStyle} aria-label={TABLE.ARIA_LABEL}>
        <TableHead>
          <TableRow>
            {renderColumnHeader('name', TABLE.HEADERS.NAME)}
            {renderColumnHeader('age', TABLE.HEADERS.AGE, 'right')}
            {renderColumnHeader('room', TABLE.HEADERS.ROOM, 'right')}
            {renderColumnHeader(
              'bloodPressure',
              TABLE.HEADERS.BLOOD_PRESSURE,
              'right',
              realTimeColumnStyle
            )}
            {renderColumnHeader(
              'heartRate',
              TABLE.HEADERS.HEART_RATE,
              'right',
              realTimeColumnStyle
            )}
            {renderColumnHeader(
              'oxygenLevel',
              TABLE.HEADERS.OXYGEN_LEVEL,
              'right',
              realTimeColumnStyle
            )}
          </TableRow>
        </TableHead>
        {filteredRows.length > 0 ? (
          <TableBody>
            {currentPageRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">{row.age}</TableCell>
                <TableCell align="right">{row.room}</TableCell>
                <TableCell
                  align="right"
                  sx={
                    isHighlighted(row.name, 'bloodPressure')
                      ? highlightStyle
                      : realTimeColumnStyle
                  }
                >
                  {row.bloodPressure}
                </TableCell>
                <TableCell
                  align="right"
                  sx={
                    isHighlighted(row.name, 'heartRate')
                      ? highlightStyle
                      : realTimeColumnStyle
                  }
                >
                  {row.heartRate}
                </TableCell>
                <TableCell
                  align="right"
                  sx={
                    isHighlighted(row.name, 'oxygenLevel')
                      ? highlightStyle
                      : realTimeColumnStyle
                  }
                >
                  {row.oxygenLevel}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        ) : (
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                No results found. Please adjust your filters.
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      </Table>

      <TablePagination
        component="div"
        count={sortedRows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={PAGE_SIZE}
        rowsPerPageOptions={[PAGE_SIZE]}
      />
    </TableContainer>
  );
};
