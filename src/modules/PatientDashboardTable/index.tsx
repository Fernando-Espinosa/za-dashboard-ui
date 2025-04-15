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

const PAGE_SIZE = 10;

type Props = {
  rows: PatientRow[];
};

type SortDirection = 'asc' | 'desc';
type SortField = keyof PatientRow | null;
type Filters = Partial<Record<keyof PatientRow, string>>;
type BPCategory = 'all' | 'low' | 'normal' | 'high';

export const PatientDashboardTable = ({ rows }: Props) => {
  const { TABLE } = Messages;
  const [page, setPage] = useState(0);
  const [highlightMap, setHighlightMap] = useState<Record<string, string[]>>(
    {}
  );
  const [sortField, setSortField] = useState<SortField>('age');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Filters>({});
  const [bpFilter, setBpFilter] = useState<BPCategory>('all');

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [rows, filters, bpFilter]);

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

  // Apply filters to rows
  const filteredRows = rows.filter((row) => {
    // Apply blood pressure category filter
    if (bpFilter !== 'all' && getBPCategory(row.bloodPressure) !== bpFilter) {
      return false;
    }

    // Apply other text filters
    return Object.entries(filters).every(([field, value]) => {
      if (!value) return true;
      if (field === 'bloodPressure') return true; // Skip text filtering for BP, using category filter instead

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

  const patientNames = currentPageRows.map((r) => r.name);
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
    setBpFilter(category);
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
