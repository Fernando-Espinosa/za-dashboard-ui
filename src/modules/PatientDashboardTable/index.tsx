import React, { useState, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import { PATIENT_DASHBOARD_MESSAGES as Messages } from './userFacingMessages';
import { PatientRow } from '../../hooks/useInitialPatients';
import { useEchoWebSocket } from '../../hooks/useMockWebSocket';

const PAGE_SIZE = 10;

type Props = {
  rows: PatientRow[];
  loading?: boolean;
};

export const PatientDashboardTable = ({ rows, loading = false }: Props) => {
  const { TABLE } = Messages;
  const [page, setPage] = useState(0);
  const [highlightMap, setHighlightMap] = useState<Record<string, string[]>>(
    {}
  );

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [rows]);

  const currentPageRows = rows.slice(
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

  const highlightStyle = {
    transition: 'background-color 0.3s ease',
    backgroundColor: '#fff9c4',
  };

  const realTimeColumnStyle = {
    backgroundColor: '#f1f8ff',
  };

  if (loading) return <CircularProgress />;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label={TABLE.ARIA_LABEL}>
        <TableHead>
          <TableRow>
            <TableCell>{TABLE.HEADERS.NAME}</TableCell>
            <TableCell align="right">{TABLE.HEADERS.AGE}</TableCell>
            <TableCell align="right">{TABLE.HEADERS.ROOM}</TableCell>
            <TableCell align="right" sx={realTimeColumnStyle}>
              {TABLE.HEADERS.BLOOD_PRESSURE}
            </TableCell>
            <TableCell align="right" sx={realTimeColumnStyle}>
              {TABLE.HEADERS.HEART_RATE}
            </TableCell>
            <TableCell align="right" sx={realTimeColumnStyle}>
              {TABLE.HEADERS.OXYGEN_LEVEL}
            </TableCell>
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
        count={rows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={PAGE_SIZE}
        rowsPerPageOptions={[PAGE_SIZE]}
      />
    </TableContainer>
  );
};
