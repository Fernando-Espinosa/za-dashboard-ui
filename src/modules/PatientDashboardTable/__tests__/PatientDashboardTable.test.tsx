import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/test-utils';
import { PatientDashboardTable } from '..';
import { PatientRow } from '../../../hooks/useInitialPatients';
import * as reduxHooks from '../../../store/hooks';
import * as filtersSlice from '../../../store/filtersSlice';

// Mock the websocket hook
vi.mock('../../../hooks/useMockWebSocket', () => ({
  useEchoWebSocket: vi.fn(),
}));

// Mock the Redux hooks
vi.mock('../../../store/hooks', async () => {
  const actual = await vi.importActual('../../../store/hooks');
  return {
    ...actual,
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
  };
});

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
    {
      id: 4,
      name: 'Samantha Brown',
      age: 16,
      room: '104A',
      bloodPressure: '110/70',
      heartRate: 55, // Low heart rate
      oxygenLevel: 91, // Low oxygen
      gender: 'Female',
    },
    {
      id: 5,
      name: 'Michael Wilson',
      age: 62,
      room: '105A',
      bloodPressure: '145/95', // High blood pressure
      heartRate: 105, // High heart rate
      oxygenLevel: 94,
      gender: 'Male',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for Redux selectors - all filters set to 'all'
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      // This is a simplified approach to mock different selector calls
      if (selector === filtersSlice.selectBPFilter) return 'all';
      if (selector === filtersSlice.selectO2Filter) return 'all';
      if (selector === filtersSlice.selectHRFilter) return 'all';
      if (selector === filtersSlice.selectAgeFilter) return 'all';
      return 'all'; // Default case
    });

    // Mock dispatch function
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(vi.fn());
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

  it('renders filter dropdown menus', () => {
    render(<PatientDashboardTable rows={mockRows} />);

    // BP filter dropdown
    expect(screen.getByLabelText('BP Filter')).toBeInTheDocument();
    // O2 filter dropdown
    expect(screen.getByLabelText('O2 Filter')).toBeInTheDocument();
    // HR filter dropdown
    expect(screen.getByLabelText('HR Filter')).toBeInTheDocument();
    // Age range filter dropdown
    expect(screen.getByLabelText('Age Range')).toBeInTheDocument();
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
        gender: 'Male',
      },
    ];

    rerender(<PatientDashboardTable rows={newRows} />);

    // Should display the new patient
    expect(screen.getByText('New Patient')).toBeInTheDocument();
    // Old patients should not be visible
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });

  it('dispatches setBPFilter when blood pressure filter is changed', async () => {
    const user = userEvent.setup();
    const mockDispatch = vi.fn();
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
    const mockSetBPFilter = vi.spyOn(filtersSlice, 'setBPFilter');

    render(<PatientDashboardTable rows={mockRows} />);

    // Open the BP filter dropdown
    const bpFilterSelect = screen.getByLabelText('BP Filter');
    await user.click(bpFilterSelect);

    // Select 'High' option
    const highOption = screen.getByText('High');
    await user.click(highOption);

    // Check that setBPFilter was dispatched with 'high'
    expect(mockSetBPFilter).toHaveBeenCalledWith('high');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('dispatches setO2Filter when oxygen filter is changed', async () => {
    const user = userEvent.setup();
    const mockDispatch = vi.fn();
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
    const mockSetO2Filter = vi.spyOn(filtersSlice, 'setO2Filter');

    render(<PatientDashboardTable rows={mockRows} />);

    // Open the O2 filter dropdown
    const o2FilterSelect = screen.getByLabelText('O2 Filter');
    await user.click(o2FilterSelect);

    // Select 'Low' option
    const lowOption = screen.getByText('Low');
    await user.click(lowOption);

    // Check that setO2Filter was dispatched with 'low'
    expect(mockSetO2Filter).toHaveBeenCalledWith('low');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('dispatches setHRFilter when heart rate filter is changed', async () => {
    const user = userEvent.setup();
    const mockDispatch = vi.fn();
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
    const mockSetHRFilter = vi.spyOn(filtersSlice, 'setHRFilter');

    render(<PatientDashboardTable rows={mockRows} />);

    // Open the HR filter dropdown
    const hrFilterSelect = screen.getByLabelText('HR Filter');
    await user.click(hrFilterSelect);

    // Select 'High' option - using a more specific selector since there are multiple 'High' options
    const highOptions = screen.getAllByText(/High/);
    const hrHighOption = highOptions.find((option) =>
      option.textContent?.includes('>100')
    );
    if (hrHighOption) {
      await user.click(hrHighOption);
    }

    // Check that setHRFilter was dispatched with 'high'
    expect(mockSetHRFilter).toHaveBeenCalledWith('high');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('dispatches setAgeFilter when age filter is changed', async () => {
    const user = userEvent.setup();
    const mockDispatch = vi.fn();
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
    const mockSetAgeFilter = vi.spyOn(filtersSlice, 'setAgeFilter');

    render(<PatientDashboardTable rows={mockRows} />);

    // Open the Age filter dropdown
    const ageFilterSelect = screen.getByLabelText('Age Range');
    await user.click(ageFilterSelect);

    // Select 'Under 18' option
    const under18Option = screen.getByText(/<18/);
    await user.click(under18Option);

    // Check that setAgeFilter was dispatched with 'under18'
    expect(mockSetAgeFilter).toHaveBeenCalledWith('under18');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('filters rows based on blood pressure categories', () => {
    // Mock BP filter to be 'high'
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === filtersSlice.selectBPFilter) return 'high';
      return 'all'; // All other filters are 'all'
    });

    render(<PatientDashboardTable rows={mockRows} />);

    // Only Michael Wilson has high blood pressure (145/95)
    expect(screen.getByText('Michael Wilson')).toBeInTheDocument();
    // Other patients should not be visible
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });

  it('filters rows based on oxygen level categories', () => {
    // Mock O2 filter to be 'low'
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === filtersSlice.selectO2Filter) return 'low';
      return 'all'; // All other filters are 'all'
    });

    render(<PatientDashboardTable rows={mockRows} />);

    // Only Samantha Brown has low oxygen (91)
    expect(screen.getByText('Samantha Brown')).toBeInTheDocument();
    // Other patients should not be visible
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Michael Wilson')).not.toBeInTheDocument();
  });

  it('filters rows based on heart rate categories', () => {
    // Mock HR filter to be 'high'
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === filtersSlice.selectHRFilter) return 'high';
      return 'all'; // All other filters are 'all'
    });

    render(<PatientDashboardTable rows={mockRows} />);

    // Only Michael Wilson has high heart rate (105)
    expect(screen.getByText('Michael Wilson')).toBeInTheDocument();
    // Other patients should not be visible
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Samantha Brown')).not.toBeInTheDocument();
  });

  it('filters rows based on age categories', () => {
    // Mock Age filter to be 'under18'
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === filtersSlice.selectAgeFilter) return 'under18';
      return 'all'; // All other filters are 'all'
    });

    render(<PatientDashboardTable rows={mockRows} />);

    // Only Samantha Brown is under 18 (16)
    expect(screen.getByText('Samantha Brown')).toBeInTheDocument();
    // Other patients should not be visible
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Michael Wilson')).not.toBeInTheDocument();
  });
});
