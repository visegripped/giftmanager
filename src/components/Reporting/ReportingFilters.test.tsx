import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportingFilters } from './ReportingFilters';

describe('ReportingFilters', () => {
  it('should render all filter fields', () => {
    const handleFilterChange = vi.fn();
    const handleClearFilters = vi.fn();

    render(
      <ReportingFilters
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
    );

    expect(screen.getByLabelText('User ID')).toBeTruthy();
    expect(screen.getByLabelText('Report Type')).toBeTruthy();
    expect(screen.getByLabelText('Component')).toBeTruthy();
    expect(screen.getByLabelText('Session ID (STID)')).toBeTruthy();
    expect(screen.getByLabelText('Start Date')).toBeTruthy();
    expect(screen.getByLabelText('End Date')).toBeTruthy();
  });

  it('should call onFilterChange when filter values change', () => {
    const handleFilterChange = vi.fn();
    const handleClearFilters = vi.fn();

    render(
      <ReportingFilters
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
    );

    const userIdInput = screen.getByLabelText('User ID') as HTMLInputElement;
    fireEvent.change(userIdInput, { target: { value: '123' } });

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ userid: 123 })
    );
  });

  it('should call onClearFilters when clear button is clicked', () => {
    const handleFilterChange = vi.fn();
    const handleClearFilters = vi.fn();

    render(
      <ReportingFilters
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
    );

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(handleClearFilters).toHaveBeenCalled();
  });

  it('should update select dropdown for report type', () => {
    const handleFilterChange = vi.fn();
    const handleClearFilters = vi.fn();

    render(
      <ReportingFilters
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
    );

    const select = screen.getByLabelText('Report Type') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'error' } });

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ report_type: 'error' })
    );
  });
});
