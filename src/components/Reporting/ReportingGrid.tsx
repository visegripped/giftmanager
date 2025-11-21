import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ReportingGrid.css';

export interface ReportData {
  id: number;
  stid: string;
  userid?: number;
  report_type: string;
  component?: string;
  message?: string;
  timestamp: string;
  performance_metrics?: string;
  user_agent?: string;
  viewport_width?: number;
  viewport_height?: number;
  page_url?: string;
  referrer?: string;
  request_data?: string;
  response_data?: string;
  stack_trace?: string;
  metadata?: string;
}

interface ReportingGridProps {
  reports: ReportData[];
  loading?: boolean;
  onRowClick?: (report: ReportData) => void;
}

export function ReportingGrid({
  reports,
  loading = false,
  onRowClick,
}: ReportingGridProps) {
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'ID',
        field: 'id',
        width: 80,
        filter: 'agNumberColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Timestamp',
        field: 'timestamp',
        width: 180,
        filter: 'agDateColumnFilter',
        sortable: true,
        valueFormatter: (params) => {
          if (!params.value) return '';
          return new Date(params.value).toLocaleString();
        },
      },
      {
        headerName: 'Type',
        field: 'report_type',
        width: 120,
        filter: 'agSetColumnFilter',
        sortable: true,
        cellStyle: (params) => {
          const type = params.value;
          if (type === 'error') return { color: '#d32f2f', fontWeight: 'bold' };
          if (type === 'warning')
            return { color: '#f57c00', fontWeight: 'normal' };
          if (type === 'performance')
            return { color: '#1976d2', fontWeight: 'normal' };
          if (type === 'interaction')
            return { color: '#388e3c', fontWeight: 'normal' };
          return { color: 'inherit', fontWeight: 'normal' };
        },
      },
      {
        headerName: 'Component',
        field: 'component',
        width: 150,
        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Message',
        field: 'message',
        width: 300,
        filter: 'agTextColumnFilter',
        sortable: true,
        wrapText: true,
        autoHeight: true,
      },
      {
        headerName: 'User ID',
        field: 'userid',
        width: 100,
        filter: 'agNumberColumnFilter',
        sortable: true,
      },
      {
        headerName: 'STID',
        field: 'stid',
        width: 120,
        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'User Agent',
        field: 'user_agent',
        width: 200,
        filter: 'agTextColumnFilter',
        sortable: true,
        hide: true,
      },
      {
        headerName: 'Viewport',
        field: 'viewport_width',
        width: 120,
        filter: false,
        sortable: false,
        valueFormatter: (params) => {
          if (!params.data.viewport_width || !params.data.viewport_height)
            return '';
          return `${params.data.viewport_width}x${params.data.viewport_height}`;
        },
      },
      {
        headerName: 'Page URL',
        field: 'page_url',
        width: 250,
        filter: 'agTextColumnFilter',
        sortable: true,
        hide: true,
      },
    ],
    []
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

  const gridOptions: GridOptions = useMemo(
    () => ({
      pagination: true,
      paginationPageSize: 50,
      paginationPageSizeSelector: [10, 25, 50, 100, 200],
      domLayout: 'autoHeight',
      animateRows: true,
      enableCellTextSelection: true,
      onRowClicked: (event) => {
        if (onRowClick && event.data) {
          onRowClick(event.data);
        }
      },
    }),
    [onRowClick]
  );

  return (
    <div className="reporting-grid ag-theme-alpine" style={{ width: '100%' }}>
      {loading && (
        <div className="reporting-grid__loading">Loading reports...</div>
      )}
      <AgGridReact
        rowData={reports}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        gridOptions={gridOptions}
      />
    </div>
  );
}

export default ReportingGrid;
