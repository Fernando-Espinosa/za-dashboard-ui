import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/test-utils';
import { PatientDashboardTable } from '..';
import { PatientRow } from '../../../hooks/useInitialPatients';

// Mock the websocket hook
vi.mock('../../../hooks/useMockWebSocket', () => ({
  useEchoWebSocket: vi.fn(),
}));

describe('PatientDashboardTable', () => {
  const mockRows: PatientRow[] = [
    {
      id: 1,
      name: 'John Smith',
      age: 42,
      room: '101A',
      bloodPressure: '120/80',
      heartRate: 72,
      oxygenLevel: 98,
      gender: 'Male',
    },
    {
      id: 2,
      name: 'Jane Doe',
      age: 36,
      room: '102A',
      bloodPressure: '115/75',
      heartRate: 68,
      oxygenLevel: 99,
      gender: 'Female',
    },
    {
      id: 3,
      name: 'Robert Johnson',
      age: 55,
      room: '103A',
      bloodPressure: '130/85',
      heartRate: 75,
      oxygenLevel: 96,
      gender: 'Male',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with correct headers', () => {
    render(<PatientDashboardTable rows={mockRows} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Room')).toBeInTheDocument();
    expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
    expect(screen.getByText('Oxygen Level')).toBeInTheDocument();
  });

  it('renders patient data correctly', () => {
    render(<PatientDashboardTable rows={mockRows} />);

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('101A')).toBeInTheDocument();
    expect(screen.getByText('120/80')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('98')).toBeInTheDocument();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('36')).toBeInTheDocument();
  });

  it('shows pagination when there are more rows than the page size', () => {
    // Generate 15 mock rows to exceed the default page size (10)
    const manyRows: PatientRow[] = Array.from({ length: 15 }, (_, index) => ({
      id: index + 1,
      name: `Patient ${index + 1}`,
      age: 30 + index,
      room: `${100 + index}A`,
      bloodPressure: '120/80',
      heartRate: 70 + index,
      oxygenLevel: 95 + (index % 5),
      gender: index % 2 === 0 ? 'Male' : 'Female',
    }));

    render(<PatientDashboardTable rows={manyRows} />);

    // Pagination should show 1-10 of 15
    expect(screen.getByText('1–10 of 15')).toBeInTheDocument();

    // First page should show Patient 1
    expect(screen.getByText('Patient 1')).toBeInTheDocument();
    // Page 2 content shouldn't be visible yet
    expect(screen.queryByText('Patient 11')).not.toBeInTheDocument();
  });

  it('handles page changes correctly', async () => {
    const user = userEvent.setup();

    // Generate 15 mock rows to exceed the default page size (10)
    const manyRows: PatientRow[] = Array.from({ length: 15 }, (_, index) => ({
      id: index + 1,
      name: `Patient ${index + 1}`,
      age: 30 + index,
      room: `${100 + index}A`,
      bloodPressure: '120/80',
      heartRate: 70 + index,
      oxygenLevel: 95 + (index % 5),
      gender: index % 2 === 0 ? 'Male' : 'Female',
    }));

    render(<PatientDashboardTable rows={manyRows} />);

    // First page should show Patient 1 but not Patient 11
    expect(screen.getByText('Patient 1')).toBeInTheDocument();
    expect(screen.queryByText('Patient 11')).not.toBeInTheDocument();

    // Click the next page button
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextPageButton);

    // Now page 2 content should be visible
    // Wait for the page change to complete
    await waitFor(() => {
      expect(screen.getByText('Patient 11')).toBeInTheDocument();
      expect(screen.queryByText('Patient 1')).not.toBeInTheDocument();
    });
  });

  it('resets pagination when rows change', () => {
    const { rerender } = render(<PatientDashboardTable rows={mockRows} />);

    // Change the rows prop
    const newRows: PatientRow[] = [
      {
        id: 4,
        name: 'New Patient',
        age: 60,
        room: '104A',
        bloodPressure: '140/90',
        heartRate: 80,
        oxygenLevel: 95,
        gender: 'Male' as const,
      },
    ];

    rerender(<PatientDashboardTable rows={newRows} />);

    // Should display the new patient
    expect(screen.getByText('New Patient')).toBeInTheDocument();
    // Old patients should not be visible
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });
});
