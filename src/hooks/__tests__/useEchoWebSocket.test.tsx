import { renderHook } from '@testing-library/react';
import { useEchoWebSocket, RealTimeVitals } from '../useMockWebSocket';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Define message event type
interface MessageEvent {
  data: string;
}

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((err: Event) => void) | null = null;
  readyState = 0;

  // Add additional properties required by WebSocket interface
  url = 'wss://ws.postman-echo.com/raw';
  protocol = '';
  extensions = '';
  bufferedAmount = 0;
  binaryType: BinaryType = 'blob';

  send = vi.fn();
  close = vi.fn();
}

// Create a global WebSocket mock
vi.stubGlobal('WebSocket', MockWebSocket);

describe('useEchoWebSocket', () => {
  const patients = ['John Doe', 'Jane Smith'];
  const onVitalsUpdate = vi.fn();
  let ws: MockWebSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    onVitalsUpdate.mockClear();

    // Save the most recently created WebSocket instance
    vi.spyOn(global, 'WebSocket').mockImplementation((_url: string | URL) => {
      ws = new MockWebSocket();
      return ws as unknown as WebSocket;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should connect to WebSocket and handle messages', () => {
    // Render the hook
    renderHook(() => useEchoWebSocket(patients, onVitalsUpdate, 3000));

    // Verify WebSocket was created with correct URL
    expect(global.WebSocket).toHaveBeenCalledWith(
      'wss://ws.postman-echo.com/raw'
    );

    // Simulate WebSocket connection open
    if (ws.onopen) ws.onopen();

    // After connection, should start sending messages in intervals
    vi.advanceTimersByTime(3000);
    expect(ws.send).toHaveBeenCalled();

    // Extract the sent data to verify format
    const sentData = JSON.parse(ws.send.mock.calls[0][0]);
    expect(sentData).toHaveProperty('name');
    expect(sentData).toHaveProperty('heartRate');
    expect(sentData).toHaveProperty('bloodPressure');
    expect(sentData).toHaveProperty('oxygenLevel');

    // Now test receiving a message
    const testVitals: RealTimeVitals = {
      name: 'Test Patient',
      heartRate: 80,
      bloodPressure: '120/80',
      oxygenLevel: 98,
    };

    if (ws.onmessage) {
      ws.onmessage({ data: JSON.stringify(testVitals) });
    }

    // Check if the callback was called with correct data
    expect(onVitalsUpdate).toHaveBeenCalledWith(testVitals);
  });

  it('should clean up on unmount', () => {
    // Render the hook with a function to unmount it
    const { unmount } = renderHook(() =>
      useEchoWebSocket(patients, onVitalsUpdate)
    );

    // Simulate WebSocket connection open
    if (ws.onopen) ws.onopen();

    // Unmount the component
    unmount();

    // Verify the WebSocket was closed
    expect(ws.close).toHaveBeenCalled();
  });
});
