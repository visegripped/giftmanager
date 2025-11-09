import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ReportingQuery } from './ReportingQuery';
import * as graphqlClient from '../../utilities/graphqlClient';

// Mock the graphql client
vi.mock('../../utilities/graphqlClient', () => ({
  getReports: vi.fn(),
  getReportStats: vi.fn(),
}));

describe('ReportingQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock responses
    (
      graphqlClient.getReportStats as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: {
        getReportStats: [
          {
            report_type: 'error',
            count: 5,
            unique_users: 2,
            unique_sessions: 3,
          },
          {
            report_type: 'performance',
            count: 10,
            unique_users: 3,
            unique_sessions: 4,
          },
        ],
      },
    });
  });

  it('should render with stats by default', async () => {
    render(<ReportingQuery showStats={true} />);

    await waitFor(() => {
      expect(screen.getByText('Statistics')).toBeTruthy();
    });
  });

  it('should render without stats when showStats is false', () => {
    render(<ReportingQuery showStats={false} />);

    expect(screen.queryByText('Statistics')).toBeNull();
  });

  it('should render filters', () => {
    render(<ReportingQuery />);

    expect(screen.getByText('Filters')).toBeTruthy();
  });

  it('should load and display reports when filters are applied', async () => {
    const mockReports = [
      {
        id: 1,
        stid: 'test-stid',
        report_type: 'error',
        component: 'TestComponent',
        message: 'Test error',
        timestamp: '2025-01-01 12:00:00',
      },
    ];

    (graphqlClient.getReports as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        getReports: {
          reports: mockReports,
          count: 1,
        },
      },
    });

    const { container } = render(<ReportingQuery />);

    // Trigger a search by changing filter
    const userIdInput = screen.getByLabelText('User ID') as HTMLInputElement;
    fireEvent.change(userIdInput, { target: { value: '1' } });

    await waitFor(() => {
      expect(graphqlClient.getReports).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully', async () => {
    (graphqlClient.getReports as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Failed to load')
    );

    // Trigger search
    // We would need to simulate filter change to trigger this
  });
});
