# Admin Reporting Interface Guide

The Admin page includes a comprehensive reporting interface for querying and analyzing application reports.

## Accessing the Interface

1. Sign in as an admin user (userid = 1)
2. Navigate to the Admin page via the footer link
3. Scroll to the "Reporting & Analytics" section

## Features

### Statistics Dashboard

The statistics panel provides a quick overview:

- **Total Reports** - Number of reports matching current filters
- **Unique Users** - Number of distinct users
- **Unique Sessions** - Number of distinct sessions (STIDs)

Reports are broken down by type with counts for each category.

### Filtering Reports

Use the filter panel to narrow down reports:

#### Available Filters

- **User ID** - Filter by specific user
- **Report Type** - Filter by type (error, warning, info, debug, performance, interaction)
- **Component** - Filter by component name
- **Session ID (STID)** - Filter by session ID
- **Start Date** - Filter reports after this date/time
- **End Date** - Filter reports before this date/time

#### Using Filters

1. Enter values in one or more filter fields
2. Filters apply automatically as you type/select
3. Click "Clear Filters" to reset

### Results Grid

The results grid (powered by ag-grid) displays matching reports with:

#### Features:

- **Sortable columns** - Click column headers to sort
- **Filterable columns** - Use column menus for additional filtering
- **Resizable columns** - Drag column borders to resize
- **Pagination** - Navigate through large result sets
- **Row selection** - Click rows to view details

#### Default Columns:

- ID
- Timestamp (formatted for readability)
- Type (color-coded)
- Component
- Message
- User ID
- STID
- Viewport (hidden by default)
- User Agent (hidden by default)
- Page URL (hidden by default)

#### Column Visibility:

Right-click the column header area to show/hide columns.

### Report Details Modal

Click any row to view full report details:

- All report fields
- Formatted JSON data (performance metrics, metadata)
- Stack traces (for errors)
- Request/response data (for API calls)

Close the modal by:

- Clicking the × button
- Clicking outside the modal
- Pressing Escape key (if implemented)

### Export Functionality

Export reports to CSV:

1. Apply filters as needed
2. Click "Export to CSV" button
3. File downloads as `reports.csv`

CSV includes all visible columns plus key metadata.

## Common Use Cases

### View Recent Errors

1. Set Report Type filter to "Error"
2. Set Start Date to last 24 hours
3. Review results for patterns

### Analyze User Activity

1. Enter User ID
2. Set Report Type to "Interaction"
3. Review user's actions chronologically

### Performance Analysis

1. Set Report Type to "Performance"
2. Filter by Component if needed
3. Look for slow API calls or page loads

### Debug Session Issues

1. Get STID from browser's sessionStorage
2. Enter STID in Session ID filter
3. View all events in that session chronologically

### Find API Errors

1. Set Report Type to "Error"
2. Set Component to "API"
3. Review failed requests and error messages

## Tips & Tricks

### Finding Slow Requests

1. Filter by Report Type: "Performance"
2. Sort by Performance Metrics (requires custom column configuration)
3. Look for duration values > 1000ms

### Identifying Problematic Components

1. Use Statistics panel to see error counts by type
2. Filter by Report Type: "Error"
3. Group by Component (use ag-grid grouping features)

### Tracking User Journey

1. Find user's STID from any of their reports
2. Filter by that STID
3. Sort by Timestamp ascending
4. Review their complete session

### Date Range Queries

- Use datetime-local inputs for precise filtering
- Leave End Date empty for "from date onwards"
- Leave Start Date empty for "up to date"

## Grid Features

### Pagination

- Default: 50 rows per page
- Options: 10, 25, 50, 100, 200
- Use page navigation at bottom of grid

### Sorting

- Single-click: Sort ascending
- Double-click: Sort descending
- Triple-click: Remove sort

### Column Menus

Right-click column headers to access:

- Filter options
- Column visibility
- Column pinning
- Auto-size columns

## Performance Notes

- Large result sets may take a few seconds to load
- Default limit is 500 reports per query
- Use filters to reduce result set size
- Export to CSV for offline analysis

## Limitations

- Maximum 500 reports per query (adjust in code if needed)
- No real-time updates (refresh page to see new reports)
- Advanced GraphQL queries require code changes
- CSV export includes all loaded reports (respects filters)

## Future Enhancements

Consider adding:

- Real-time report updates (WebSocket)
- Custom dashboard widgets
- Scheduled report exports
- Alert configuration (email on errors)
- Chart visualizations
- Advanced GraphQL query builder UI
