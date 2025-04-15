import { render, screen, fireEvent } from '@testing-library/react';
import { MasterView } from '../index';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock DashboardView to simplify our test
vi.mock('../DashboardView', () => ({
  DashboardView: () => <div data-testid="dashboard-view">Dashboard View</div>,
}));

// Setup mock for useInitialPatients
vi.mock('../../../hooks/useInitialPatients', () => ({
  useInitialPatients: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
  }),
}));

describe('MasterView', () => {
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

  it('renders the component with collapsed drawer', () => {
    render(<MasterView />, { wrapper });

    // Check that the title is displayed
    expect(screen.getByText('Patient Dashbaord')).toBeInTheDocument();

    // Check that DashboardView is rendered
    expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
  });

  it('toggles the drawer when menu button is clicked', () => {
    render(<MasterView />, { wrapper });

    // Find and click the menu button
    const menuButton = screen.getByLabelText('open drawer');
    fireEvent.click(menuButton);

    // Check that 'Home' is now visible in the drawer
    expect(screen.getByText('Home')).toBeInTheDocument();

    // Close the drawer
    const closeButton = screen.getByRole('button', { name: '' }); // The close button doesn't have a name
    fireEvent.click(closeButton);
  });
});
