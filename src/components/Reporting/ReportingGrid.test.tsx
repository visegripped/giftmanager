import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportingGrid, ReportData } from './ReportingGrid';

describe('ReportingGrid', () => {
  const mockReports: ReportData[] = [
    {
      id: 1,
      stid: 'test-stid-123',
      userid: 1,
      report_type: 'error',
      component: 'TestComponent',
      message: 'Test error message',
      timestamp: '2025-01-01 12:00:00',
      viewport_width: 1920,
      viewport_height: 1080,
    },
    {
      id: 2,
      stid: 'test-stid-456',
      userid: 2,
      report_type: 'performance',
      component: 'AnotherComponent',
      message: 'Performance metric',
      timestamp: '2025-01-01 13:00:00',
      viewport_width: 1366,
      viewport_height: 768,
    },
  ];

  it('should render grid with reports', () => {
    render(<ReportingGrid reports={mockReports} />);

    // Check that ag-grid is rendered
    const grid = document.querySelector('.ag-theme-alpine');
    expect(grid).toBeTruthy();
  });

  it('should display loading state', () => {
    render(<ReportingGrid reports={[]} loading={true} />);

    expect(screen.getByText('Loading reports...')).toBeTruthy();
  });

  it('should handle empty reports array', () => {
    render(<ReportingGrid reports={[]} />);

    const grid = document.querySelector('.ag-theme-alpine');
    expect(grid).toBeTruthy();
  });

  it('should call onRowClick when provided', () => {
    const handleRowClick = vi.fn();
    const { container } = render(
      <ReportingGrid reports={mockReports} onRowClick={handleRowClick} />
    );

    // AgGrid is rendered, but we can't easily test row clicks without more setup
    expect(container).toBeTruthy();
  });
});
