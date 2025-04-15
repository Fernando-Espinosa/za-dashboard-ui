import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { PatientSummaryCard } from '..';
import { PatientRow } from '../../../hooks/useInitialPatients';
import * as reduxHooks from '../../../store/hooks';
import * as filtersSlice from '../../../store/filtersSlice';

// Mock the hooks
vi.mock('../../../store/hooks', async () => {
  const actual = await vi.importActual('../../../store/hooks');
  return {
    ...actual,
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
  };
});

describe('PatientSummaryCard', () => {
  // Sample data for testing
  const mockRows: PatientRow[] = [
    {
      id: 1,
      name: 'John Smith',
      age: 42,
      room: '101',
      bloodPressure: '145/95', // High BP
      heartRate: 72,
      oxygenLevel: 98,
      gender: 'Male',
    },
    {
      id: 2,
      name: 'Jane Doe',
      age: 36,
      room: '102',
      bloodPressure: '120/80', // Normal BP
      heartRate: 68,
      oxygenLevel: 91, // Low O2
      gender: 'Female',
    },
    {
      id: 3,
      name: 'Alice Johnson',
      age: 28,
      room: '103',
      bloodPressure: '110/70', // Normal BP
      heartRate: 75,
      oxygenLevel: 97,
      gender: 'Female',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useAppSelector to return null for cardFilter (no active filter)
    vi.mocked(reduxHooks.useAppSelector).mockReturnValue(null);
    // Mock dispatch
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(vi.fn());
  });

  it('renders summary cards with correct values', () => {
    render(<PatientSummaryCard rows={mockRows} />);

    // Total should be 3
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getAllByText('3')[0]).toBeInTheDocument();

    // Gender counts
    expect(screen.getByText('Males')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(3); // There are multiple "1"s in the document
    expect(screen.getByText('Females')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Filterable counts
    expect(
      screen.getByText(
        (content) =>
          content.includes('High') &&
          content.includes('B') &&
          content.includes('P')
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (content) => content.includes('Low') && content.includes('O2')
      )
    ).toBeInTheDocument();
  });

  it('shows filter indicators on filterable cards only', () => {
    render(<PatientSummaryCard rows={mockRows} />);

    // Count filter chips - should only be on highBP and lowO2 cards
    const filterChips = screen.getAllByText('Filter');
    expect(filterChips).toHaveLength(2);

    // Verify other cards don't have filter chips
    expect(screen.queryAllByText('Filter')).toHaveLength(2);
  });

  it('dispatches setCardFilter when clicking on filterable card', () => {
    const mockDispatch = vi.fn();
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
    const mockSetCardFilter = vi.spyOn(filtersSlice, 'setCardFilter');

    render(<PatientSummaryCard rows={mockRows} />);

    // Find the High BP card and click it
    const highBPText = screen.getByText(
      (content) =>
        content.includes('High') &&
        content.includes('B') &&
        content.includes('P')
    );
    const highBPCard = highBPText.closest('.MuiCard-root');
    if (highBPCard) {
      fireEvent.click(highBPCard);
    }

    // Check that setCardFilter was called with 'highBP'
    expect(mockSetCardFilter).toHaveBeenCalledWith('highBP');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('highlights the active filter card', () => {
    // Mock an active filter
    vi.mocked(reduxHooks.useAppSelector).mockReturnValue('highBP');

    render(<PatientSummaryCard rows={mockRows} />);

    // Look for chips within the document with the 'primary' color class
    const chipElements = document.querySelectorAll('.MuiChip-colorPrimary');
    expect(chipElements.length).toBeGreaterThan(0);
  });

  it('dispatches null when clicking an already active filter', () => {
    const mockDispatch = vi.fn();
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
    vi.mocked(reduxHooks.useAppSelector).mockReturnValue('highBP');
    const mockSetCardFilter = vi.spyOn(filtersSlice, 'setCardFilter');

    render(<PatientSummaryCard rows={mockRows} />);

    // Find the already active High BP card and click it
    const highBPText = screen.getByText(
      (content) =>
        content.includes('High') &&
        content.includes('B') &&
        content.includes('P')
    );
    const highBPCard = highBPText.closest('.MuiCard-root');
    if (highBPCard) {
      fireEvent.click(highBPCard);
    }

    // Check that setCardFilter was called with null (to deactivate)
    expect(mockSetCardFilter).toHaveBeenCalledWith(null);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('does not dispatch when clicking non-filterable cards', () => {
    const mockDispatch = vi.fn();
    vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);

    render(<PatientSummaryCard rows={mockRows} />);

    // Find the Males card (which is not filterable) and click it
    const malesText = screen.getByText('Males');
    const malesCard = malesText.closest('.MuiCard-root');
    if (malesCard) {
      fireEvent.click(malesCard);
    }

    // Dispatch should not have been called
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
