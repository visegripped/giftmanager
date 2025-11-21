import type { Meta, StoryObj } from '@storybook/react';
import { ReportingGrid, ReportData } from './ReportingGrid';

const meta: Meta<typeof ReportingGrid> = {
  title: 'Components/Reporting/ReportingGrid',
  component: ReportingGrid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportingGrid>;

const mockReports: ReportData[] = [
  {
    id: 1,
    stid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    userid: 1,
    report_type: 'error',
    component: 'AddItemForm',
    message: 'Failed to add item to list',
    timestamp: '2025-01-08 14:30:25.123',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    viewport_width: 1920,
    viewport_height: 1080,
    page_url: 'http://localhost:5173/#/me',
    stack_trace: 'Error: Failed to add item\n  at AddItemForm.tsx:45:12',
  },
  {
    id: 2,
    stid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    userid: 1,
    report_type: 'performance',
    component: 'API',
    message: 'API call completed: POST /api.php',
    timestamp: '2025-01-08 14:30:20.456',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    viewport_width: 1920,
    viewport_height: 1080,
    page_url: 'http://localhost:5173/#/me',
    performance_metrics: JSON.stringify({ duration: 234, status: 200 }),
  },
  {
    id: 3,
    stid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    userid: 2,
    report_type: 'interaction',
    component: 'Button',
    message: 'User interacted with button: click',
    timestamp: '2025-01-08 14:31:15.789',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    viewport_width: 1366,
    viewport_height: 768,
    page_url: 'http://localhost:5173/#/user/2',
    metadata: JSON.stringify({ elementTag: 'button', elementText: 'Add Item' }),
  },
  {
    id: 4,
    stid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    report_type: 'warning',
    component: 'AuthButton',
    message: 'Token expiring soon',
    timestamp: '2025-01-08 14:32:00.123',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    viewport_width: 375,
    viewport_height: 667,
    page_url: 'http://localhost:5173/#/me',
  },
];

export const Default: Story = {
  args: {
    reports: mockReports,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    reports: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    reports: [],
    loading: false,
  },
};

export const ErrorsOnly: Story = {
  args: {
    reports: mockReports.filter((r) => r.report_type === 'error'),
    loading: false,
  },
};

export const WithRowClick: Story = {
  args: {
    reports: mockReports,
    loading: false,
    onRowClick: (report) => {
      console.log('Row clicked:', report);
      alert(`Clicked report ${report.id}: ${report.message}`);
    },
  },
};
