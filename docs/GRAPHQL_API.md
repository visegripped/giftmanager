# GraphQL Reporting API Reference

The reporting API uses GraphQL to provide flexible querying capabilities.

## Endpoint

**URL**: `http://localhost/reporting.php` (local) or `https://gm.visegripped.com/reporting.php` (production)

**Method**: POST

**Content-Type**: application/json

## Authentication

Currently, the reporting API does not require authentication for mutations (creating reports). Queries should be restricted to admin users (implement authentication as needed).

## Schema Overview

### Types

#### Report

```graphql
type Report {
  id: Int
  stid: String
  userid: Int
  report_type: ReportType
  component: String
  message: String
  timestamp: String
  performance_metrics: String # JSON string
  user_agent: String
  viewport_width: Int
  viewport_height: Int
  page_url: String
  referrer: String
  request_data: String # JSON string
  response_data: String # JSON string
  stack_trace: String
  metadata: String # JSON string
}
```

#### ReportType Enum

```graphql
enum ReportType {
  PERFORMANCE
  INTERACTION
  ERROR
  WARNING
  INFO
  DEBUG
}
```

## Queries

### getReports

Fetch reports with optional filtering and pagination.

**Signature**:

```graphql
getReports(
  filter: ReportFilter
  pagination: Pagination
): ReportsResponse
```

**Example**:

```graphql
query GetReports {
  getReports(
    filter: {
      report_type: ERROR
      start_date: "2025-01-01 00:00:00"
      end_date: "2025-01-31 23:59:59"
    }
    pagination: { limit: 50, offset: 0 }
  ) {
    reports {
      id
      timestamp
      report_type
      component
      message
      userid
    }
    count
  }
}
```

**Filter Fields**:

- `userid` (Int) - Filter by user ID
- `report_type` (ReportType) - Filter by report type
- `component` (String) - Filter by component name
- `stid` (String) - Filter by Session Transaction ID
- `start_date` (String) - Start date in format "YYYY-MM-DD HH:MM:SS"
- `end_date` (String) - End date in format "YYYY-MM-DD HH:MM:SS"

**Pagination Fields**:

- `limit` (Int) - Maximum results to return (default: 100)
- `offset` (Int) - Number of results to skip (default: 0)

### getReportStats

Get aggregated statistics about reports.

**Signature**:

```graphql
getReportStats(
  filter: ReportFilter
): [ReportStats]
```

**Example**:

```graphql
query GetStats {
  getReportStats(filter: { start_date: "2025-01-01 00:00:00" }) {
    report_type
    count
    unique_users
    unique_sessions
  }
}
```

**Returns**: Array of statistics grouped by report_type

## Mutations

### createReport

Create a new report entry.

**Signature**:

```graphql
createReport(
  input: ReportInput!
): Report
```

**Example**:

```graphql
mutation CreateReport {
  createReport(
    input: {
      stid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      userid: 1
      report_type: ERROR
      component: "MyComponent"
      message: "An error occurred"
      stack_trace: "Error: Something went wrong\n  at MyComponent..."
      metadata: "{\"customField\":\"value\"}"
    }
  ) {
    id
    timestamp
    report_type
    message
  }
}
```

**Required Fields**:

- `stid` (String!) - Session Transaction ID
- `report_type` (ReportType!) - Type of report

**Optional Fields**:

- `userid` (Int) - User ID
- `component` (String) - Component name
- `message` (String) - Report message
- `performance_metrics` (String) - JSON string with metrics
- `user_agent` (String) - Browser user agent
- `viewport_width` (Int) - Viewport width
- `viewport_height` (Int) - Viewport height
- `page_url` (String) - Current page URL
- `referrer` (String) - Referrer URL
- `request_data` (String) - JSON string with request data
- `response_data` (String) - JSON string with response data
- `stack_trace` (String) - Error stack trace
- `metadata` (String) - JSON string with additional data

## Making Requests

### Using curl

```bash
curl -X POST http://localhost/reporting.php \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getReportStats { report_type count } }"
  }'
```

### Using JavaScript

```javascript
const query = `
  query GetReports($filter: ReportFilter) {
    getReports(filter: $filter) {
      reports {
        id
        timestamp
        message
      }
      count
    }
  }
`;

const variables = {
  filter: {
    report_type: 'ERROR',
    userid: 1,
  },
};

const response = await fetch('http://localhost/reporting.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query, variables }),
});

const result = await response.json();
console.log(result.data.getReports);
```

### Using the graphqlClient Utility

```typescript
import { getReports, getReportStats } from '@utilities/graphqlClient';

// Get reports
const reports = await getReports(
  { report_type: 'error', userid: 1 },
  { limit: 50, offset: 0 }
);

// Get statistics
const stats = await getReportStats({ start_date: '2025-01-01 00:00:00' });
```

## Response Format

### Successful Response

```json
{
  "data": {
    "getReports": {
      "reports": [...],
      "count": 42
    }
  }
}
```

### Error Response

```json
{
  "errors": [
    {
      "message": "Error message here",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["getReports"]
    }
  ]
}
```

## Advanced Queries

### Get Performance Metrics for a Component

```graphql
query ComponentPerformance {
  getReports(
    filter: {
      report_type: PERFORMANCE
      component: "API"
      start_date: "2025-01-01 00:00:00"
    }
    pagination: { limit: 100 }
  ) {
    reports {
      timestamp
      performance_metrics
      message
    }
  }
}
```

### Get All Events for a Session

```graphql
query SessionEvents {
  getReports(
    filter: { stid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }
    pagination: { limit: 1000 }
  ) {
    reports {
      timestamp
      report_type
      component
      message
    }
  }
}
```

### Error Analysis

```graphql
query ErrorAnalysis {
  getReportStats(
    filter: { report_type: ERROR, start_date: "2025-01-01 00:00:00" }
  ) {
    report_type
    count
    unique_users
    unique_sessions
  }
}
```

## Rate Limiting

Consider implementing rate limiting for production:

- Limit reports per session
- Limit reports per user
- Implement throttling for high-frequency events

## Monitoring

Monitor the reporting system itself:

- Check database size regularly
- Implement data retention policies
- Monitor query performance
- Set up alerts for excessive error reports

## Future Enhancements

Planned improvements:

- Authentication/authorization for queries
- Subscriptions for real-time updates
- More aggregation queries (averages, percentiles)
- Custom report types
- Batch mutations
- Data retention policies
