import { useState } from 'react';
import './ReportingFilters.css';

export interface ReportFilters {
  userid?: number;
  report_type?: string;
  component?: string;
  stid?: string;
  start_date?: string;
  end_date?: string;
}

interface ReportingFiltersProps {
  onFilterChange: (filters: ReportFilters) => void;
  onClearFilters: () => void;
}

const REPORT_TYPES = [
  'performance',
  'interaction',
  'error',
  'warning',
  'info',
  'debug',
];

export function ReportingFilters({
  onFilterChange,
  onClearFilters,
}: ReportingFiltersProps) {
  const [filters, setFilters] = useState<ReportFilters>({});

  const handleFilterChange = (
    key: keyof ReportFilters,
    value: string | number
  ) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
  };

  return (
    <div className="reporting-filters">
      <h3 className="reporting-filters__title">Filters</h3>

      <div className="reporting-filters__grid">
        <div className="reporting-filters__field">
          <label htmlFor="filter-userid">User ID</label>
          <input
            id="filter-userid"
            type="number"
            value={filters.userid || ''}
            onChange={(e) =>
              handleFilterChange('userid', parseInt(e.target.value) || '')
            }
            placeholder="Filter by user ID"
          />
        </div>

        <div className="reporting-filters__field">
          <label htmlFor="filter-report-type">Report Type</label>
          <select
            id="filter-report-type"
            value={filters.report_type || ''}
            onChange={(e) => handleFilterChange('report_type', e.target.value)}
          >
            <option value="">All Types</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="reporting-filters__field">
          <label htmlFor="filter-component">Component</label>
          <input
            id="filter-component"
            type="text"
            value={filters.component || ''}
            onChange={(e) => handleFilterChange('component', e.target.value)}
            placeholder="Filter by component"
          />
        </div>

        <div className="reporting-filters__field">
          <label htmlFor="filter-stid">Session ID (STID)</label>
          <input
            id="filter-stid"
            type="text"
            value={filters.stid || ''}
            onChange={(e) => handleFilterChange('stid', e.target.value)}
            placeholder="Filter by session ID"
          />
        </div>

        <div className="reporting-filters__field">
          <label htmlFor="filter-start-date">Start Date</label>
          <input
            id="filter-start-date"
            type="datetime-local"
            value={filters.start_date || ''}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
          />
        </div>

        <div className="reporting-filters__field">
          <label htmlFor="filter-end-date">End Date</label>
          <input
            id="filter-end-date"
            type="datetime-local"
            value={filters.end_date || ''}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
          />
        </div>
      </div>

      <div className="reporting-filters__actions">
        <button
          className="reporting-filters__clear-button"
          onClick={handleClear}
          type="button"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default ReportingFilters;
