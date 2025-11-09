import type { Meta, StoryObj } from '@storybook/react';
import { ReportingStats } from './ReportingStats';

const meta: Meta<typeof ReportingStats> = {
  title: 'Components/Reporting/ReportingStats',
  component: ReportingStats,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportingStats>;

// Mock the graphqlClient
const mockGetReportStats = () => {
  return Promise.resolve({
    data: {
      getReportStats: [
        {
          report_type: 'error',
          count: 45,
          unique_users: 12,
          unique_sessions: 28,
        },
        {
          report_type: 'warning',
          count: 23,
          unique_users: 8,
          unique_sessions: 15,
        },
        {
          report_type: 'performance',
          count: 156,
          unique_users: 15,
          unique_sessions: 42,
        },
        {
          report_type: 'interaction',
          count: 892,
          unique_users: 15,
          unique_sessions: 42,
        },
        {
          report_type: 'info',
          count: 67,
          unique_users: 10,
          unique_sessions: 25,
        },
      ],
    },
  });
};

// Note: In a real story, we'd need to mock the graphqlClient module
// For now, this is a visual reference

export const Default: Story = {
  args: {
    filters: {},
  },
};

export const WithFilters: Story = {
  args: {
    filters: {
      start_date: '2025-01-01 00:00:00',
      end_date: '2025-01-08 23:59:59',
    },
  },
};

export const SingleUser: Story = {
  args: {
    filters: {
      userid: 1,
    },
  },
};
