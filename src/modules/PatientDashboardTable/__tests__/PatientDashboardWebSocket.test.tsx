import { describe, it, expect, vi } from 'vitest';
import { render } from '../../../test/test-utils';
import { PatientDashboardTable } from '..';
import { PatientRow } from '../../../hooks/useInitialPatients';
import { useEchoWebSocket } from '../../../hooks/useMockWebSocket';

// Mock the websocket hook
vi.mock('../../../hooks/useMockWebSocket', () => ({
  useEchoWebSocket: vi.fn(),
}));

describe('PatientDashboardTable WebSocket Integration', () => {
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
  ];

  it('should call useEchoWebSocket with the correct parameters', () => {
    render(<PatientDashboardTable rows={mockRows} />);

    // Check if the websocket hook was called with the correct patient names
    expect(useEchoWebSocket).toHaveBeenCalledTimes(1);
    expect(useEchoWebSocket).toHaveBeenCalledWith(
      ['John Smith', 'Jane Doe'],
      expect.any(Function)
    );
  });

  it('should update websocket subscription when rows change', () => {
    const { rerender } = render(<PatientDashboardTable rows={mockRows} />);

    // Clear previous calls before re-rendering
    vi.clearAllMocks();

    // Update with new data
    const newRows: PatientRow[] = [
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

    rerender(<PatientDashboardTable rows={newRows} />);

    // Should call the hook with the new patient names
    expect(useEchoWebSocket).toHaveBeenCalledTimes(1);
    expect(useEchoWebSocket).toHaveBeenCalledWith(
      ['Robert Johnson'],
      expect.any(Function)
    );
  });
});
