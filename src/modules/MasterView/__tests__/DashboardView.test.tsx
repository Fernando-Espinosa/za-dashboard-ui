import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardView } from '../DashboardView';
import { PatientRow } from '../../../hooks/useInitialPatients';
import * as reduxHooks from '../../../store/hooks';
import * as useInitialPatientsModule from '../../../hooks/useInitialPatients';

// Mock dependencies
vi.mock('../../../hooks/useInitialPatients', () => ({
  useInitialPatients: vi.fn(),
}));

vi.mock('../../../store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

// Mock child components
vi.mock('../PatientSummaryCard', () => ({
  default: ({ patients }: { patients: PatientRow[] }) => (
    <div data-testid="patient-summary-card">
      <p>Summary of {patients.length} patients</p>
    </div>
  ),
}));

vi.mock('../../PatientTable/PatientDashboardTable', () => ({
  default: ({ patients }: { patients: PatientRow[] }) => (
    <div data-testid="patient-dashboard-table">
      <p>Patient count: {patients.length}</p>
      {patients.map((patient) => (
        <div key={patient.id} data-testid={`patient-${patient.id}`}>
          {patient.name}
        </div>
      ))}
    </div>
  ),
}));

// Mock LoadingSkeleton
vi.mock('../../../components/LoadingSkeleton', () => ({
  default: () => <div data-testid="skeleton-container">Loading...</div>,
}));

// Mock patient data
const mockPatients: PatientRow[] = [
  {
    id: 1,
    name: 'John Smith',
    age: 65,
    room: '101',
    bloodPressure: '150/90', // high BP
    heartRate: 75,
    oxygenLevel: 96,
    gender: 'Male',
  },
  {
    id: 2,
    name: 'Jane Doe',
    age: 42,
    room: '102',
    bloodPressure: '120/80',
    heartRate: 68,
    oxygenLevel: 91, // low O2
    gender: 'Female',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    age: 55,
    room: '103',
    bloodPressure: '135/85',
    heartRate: 110, // high HR
    oxygenLevel: 97,
    gender: 'Male',
  },
];

// Mock loading state
let mockLoading = false;

// Mock useInitialPatients hook
const mockedUseInitialPatients = vi.fn().mockImplementation(() => {
  return {
    data: mockLoading ? undefined : mockPatients,
    isLoading: mockLoading,
  };
});

// Set up mocks before tests
beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();

  // Reset loading state to false by default
  mockLoading = false;

  // Set up mocks
  vi.mocked(useInitialPatientsModule.useInitialPatients).mockImplementation(
    mockedUseInitialPatients
  );

  // Default to no card filter
  vi.mocked(reduxHooks.useAppSelector).mockReturnValue(null);
});

describe('DashboardView', () => {
  it('renders loading state when data is loading', () => {
    // Set loading to true for this test
    mockLoading = true;

    render(<DashboardView />);

    // Should show skeletons
    expect(screen.getByTestId('skeleton-container')).toBeInTheDocument();
  });
});
