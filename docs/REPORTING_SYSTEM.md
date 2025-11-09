# Reporting System Documentation

The GiftManager reporting system tracks errors, performance metrics, and user interactions to help improve the application.

## Overview

The reporting system consists of:

- **Frontend tracking** - Automatically captures events, errors, and performance
- **GraphQL API** - Flexible querying of report data
- **Admin interface** - Query and analyze reports via the Admin page

## Key Concepts

### Session Transaction ID (STID)

- A unique identifier for each browser session
- Generated on first page load
- Persists across page refreshes (stored in sessionStorage)
- Resets when browser is closed/reopened
- Format: UUID v4 (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Report Types

- `error` - Application errors, exceptions, failures
- `warning` - Warning messages, non-critical issues
- `info` - Informational messages
- `debug` - Debug information for development
- `performance` - Performance metrics (API calls, page load)
- `interaction` - User interactions (clicks, navigation)

## Automatic Tracking

### Page Load Performance

Automatically tracked on every page load:

- DOM content loaded time
- Full page load time
- DNS lookup time
- TCP connection time
- Request/response times
- Resource loading metrics

### API Calls

All API calls through `fetchData()` are automatically tracked:

- Request duration
- HTTP status codes
- Request parameters (excluding sensitive data)
- Response data
- Errors and failures

### User Interactions

Clicks on buttons and links are automatically tracked via delegated event listeners:

- Element type (button/link)
- Element text
- Associated component
- Custom data attributes

## Manual Reporting

### Using the useReport Hook

```typescript
import { useReport } from '@hooks/useReport';

function MyComponent() {
  const { reportError, reportInfo, reportPerformance } = useReport();

  const handleAction = async () => {
    try {
      // Your code here
      reportInfo('Action completed successfully', {
        component: 'MyComponent',
        metadata: { actionType: 'submit' }
      });
    } catch (error) {
      reportError('Action failed', error as Error, {
        component: 'MyComponent'
      });
    }
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

### Direct Report Creation

```typescript
import { reportCreate } from '@utilities/reportCreate';
import { getSTID } from '@hooks/useSessionTracking';

// Create a report directly
reportCreate({
  stid: getSTID(),
  report_type: 'info',
  component: 'MyComponent',
  message: 'Something happened',
  metadata: {
    customField: 'customValue',
  },
});
```

## Tracking Interactions with Data Attributes

Add data attributes to buttons and links to provide context:

```tsx
<button
  data-report-component="AddItemForm"
  data-report-action="add-item"
  data-report-category="user-action"
  data-report-item-id="123"
>
  Add Item
</button>
```

To disable tracking for specific elements:

```tsx
<button data-report-disabled="true">Don't Track This</button>
```

## Report Data Structure

Each report contains:

- `id` - Unique report ID
- `stid` - Session Transaction ID
- `userid` - User ID (if authenticated)
- `report_type` - Type of report
- `component` - Component that generated the report
- `message` - Human-readable message
- `timestamp` - When the report was created (millisecond precision)
- `performance_metrics` - JSON object with performance data
- `user_agent` - Browser user agent string
- `viewport_width` / `viewport_height` - Browser viewport dimensions
- `page_url` - Current page URL
- `referrer` - Referrer URL
- `request_data` - API request details
- `response_data` - API response details
- `stack_trace` - Error stack traces
- `metadata` - Additional custom data

## Best Practices

### DO:

- ✅ Use `useReport()` hook for component-level reporting
- ✅ Add `data-report-*` attributes to important UI elements
- ✅ Include relevant context in metadata
- ✅ Use appropriate report types
- ✅ Report errors with stack traces

### DON'T:

- ❌ Report personally identifiable information (PII)
- ❌ Report sensitive data (passwords, tokens, etc.)
- ❌ Create excessive reports (respect rate limits)
- ❌ Report inside tight loops
- ❌ Throw errors from reporting functions (could create loops)

## Performance Considerations

- Reports are sent asynchronously (non-blocking)
- Failed reports are logged to console, not retried
- Interaction tracking uses efficient delegated event listeners
- API tracking adds minimal overhead (~1-2ms per call)

## Privacy & Security

- No PII is automatically collected
- User IDs are only stored if user is authenticated
- Sensitive fields are excluded from request/response tracking
- Reports are only accessible to admin users
- Database credentials use environment variables

## Examples

### Track a Custom Event

```typescript
const { reportInfo } = useReport();

reportInfo('User completed onboarding', {
  component: 'Onboarding',
  metadata: {
    step: 'complete',
    duration: 120000, // milliseconds
  },
});
```

### Track Performance

```typescript
const { reportPerformance } = useReport();

const startTime = performance.now();
// ... do expensive operation
const endTime = performance.now();

reportPerformance(
  'Expensive operation completed',
  {
    duration: endTime - startTime,
    operation: 'dataProcessing',
  },
  {
    component: 'DataProcessor',
  }
);
```

### Track Errors with Context

```typescript
const { reportError } = useReport();

try {
  await riskyOperation();
} catch (error) {
  reportError('Risky operation failed', error as Error, {
    component: 'RiskyComponent',
    metadata: {
      retryCount: 3,
      lastAttempt: Date.now(),
    },
  });
}
```

## Database Schema

See `docker/mysql/init.sql` for the complete `application_reports` table schema.
