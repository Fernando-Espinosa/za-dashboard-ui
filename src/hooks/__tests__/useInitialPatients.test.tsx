import { renderHook } from '@testing-library/react';
import { useInitialPatients } from '../useInitialPatients';
import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the axios module
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('useInitialPatients', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('should fetch and transform patient data', async () => {
    // Mock axios response
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
      ],
    });

    // Render the hook
    const { result } = renderHook(() => useInitialPatients(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the query to complete
    await vi.waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify API was called correctly
    expect(axios.get).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/posts'
    );

    // Check the transformed data structure
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toHaveProperty('id', 1);
    expect(result.current.data?.[0]).toHaveProperty('name');
    expect(result.current.data?.[0]).toHaveProperty('age');
    expect(result.current.data?.[0]).toHaveProperty('room');
    expect(result.current.data?.[0]).toHaveProperty('bloodPressure');
    expect(result.current.data?.[0]).toHaveProperty('heartRate');
    expect(result.current.data?.[0]).toHaveProperty('oxygenLevel');
    expect(result.current.data?.[0]).toHaveProperty('gender');
  });

  it('should handle error states', async () => {
    // Mock axios error
    (axios.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    // Render the hook
    const { result } = renderHook(() => useInitialPatients(), { wrapper });

    // Wait for the query to fail
    await vi.waitFor(() => expect(result.current.isError).toBe(true));

    // Check error state
    expect(result.current.error).toBeDefined();
  });
});
