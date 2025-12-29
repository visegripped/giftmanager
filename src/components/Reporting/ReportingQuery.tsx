import { useState } from 'react';
import { getReports } from '../../utilities/graphqlClient';
import ReportingFilters, { ReportFilters } from './ReportingFilters';
import ReportingGrid, { ReportData } from './ReportingGrid';
import ReportingStats from './ReportingStats';
import Modal from '../Modal/Modal';
import './ReportingQuery.css';

interface ReportingQueryProps {
  showStats?: boolean;
}

export function ReportingQuery({ showStats = true }: ReportingQueryProps) {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const handleSearch = async (newFilters: ReportFilters) => {
    setLoading(true);
    setError(null);
    setFilters(newFilters);

    try {
      const result = await getReports(newFilters, { limit: 500 });

      if (result.errors) {
        setError('Failed to load reports');
        return;
      }

      if (result.data?.getReports) {
        setReports(result.data.getReports.reports as unknown as ReportData[]);
      }
    } catch (err) {
      setError('Failed to load reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setReports([]);
    setError(null);
  };

  const handleRowClick = (report: ReportData) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  return (
    <div className="reporting-query">
      {showStats && <ReportingStats filters={filters} />}

      <ReportingFilters
        onFilterChange={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {error && <div className="reporting-query__error">{error}</div>}

      {reports.length > 0 && (
        <div className="reporting-query__results">
          <div className="reporting-query__results-header">
            <h3>Results ({reports.length})</h3>
            <button
              onClick={() => {
                // Export to CSV
                const csv = convertToCSV(reports);
                downloadCSV(csv, 'reports.csv');
              }}
              className="reporting-query__export-button"
            >
              Export to CSV
            </button>
          </div>
          <ReportingGrid
            reports={reports}
            loading={loading}
            onRowClick={handleRowClick}
          />
        </div>
      )}

      <Modal
        isOpen={!!selectedReport}
        onClose={handleCloseModal}
        title="Report Details"
        maxWidth="900px"
      >
        {selectedReport && (
          <div className="reporting-query__detail-grid">
            <div className="reporting-query__detail-row">
              <strong>ID:</strong>
              <span>{selectedReport.id}</span>
            </div>
            <div className="reporting-query__detail-row">
              <strong>Type:</strong>
              <span
                className={`reporting-query__type--${selectedReport.report_type}`}
              >
                {selectedReport.report_type}
              </span>
            </div>
            <div className="reporting-query__detail-row">
              <strong>Timestamp:</strong>
              <span>{new Date(selectedReport.timestamp).toLocaleString()}</span>
            </div>
            <div className="reporting-query__detail-row">
              <strong>Component:</strong>
              <span>{selectedReport.component || 'N/A'}</span>
            </div>
            <div className="reporting-query__detail-row">
              <strong>User ID:</strong>
              <span>{selectedReport.userid || 'N/A'}</span>
            </div>
            <div className="reporting-query__detail-row">
              <strong>Session ID:</strong>
              <span>{selectedReport.stid}</span>
            </div>
            {selectedReport.message && (
              <div className="reporting-query__detail-row reporting-query__detail-row--full">
                <strong>Message:</strong>
                <p>{selectedReport.message}</p>
              </div>
            )}
            {selectedReport.page_url && (
              <div className="reporting-query__detail-row reporting-query__detail-row--full">
                <strong>Page URL:</strong>
                <p>{selectedReport.page_url}</p>
              </div>
            )}
            {selectedReport.stack_trace && (
              <div className="reporting-query__detail-row reporting-query__detail-row--full">
                <strong>Stack Trace:</strong>
                <pre>{selectedReport.stack_trace}</pre>
              </div>
            )}
            {selectedReport.performance_metrics && (
              <div className="reporting-query__detail-row reporting-query__detail-row--full">
                <strong>Performance Metrics:</strong>
                <pre>
                  {JSON.stringify(
                    JSON.parse(selectedReport.performance_metrics),
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
            {selectedReport.metadata && (
              <div className="reporting-query__detail-row reporting-query__detail-row--full">
                <strong>Metadata:</strong>
                <pre>
                  {JSON.stringify(JSON.parse(selectedReport.metadata), null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// Helper functions
function convertToCSV(data: ReportData[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Type',
    'Component',
    'Message',
    'User ID',
    'STID',
    'Page URL',
  ];

  const rows = data.map((report) => [
    report.id,
    report.timestamp,
    report.report_type,
    report.component || '',
    report.message || '',
    report.userid || '',
    report.stid,
    report.page_url || '',
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  return csv;
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default ReportingQuery;
