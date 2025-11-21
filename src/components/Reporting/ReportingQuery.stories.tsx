import type { Meta, StoryObj } from '@storybook/react';
import { ReportingQuery } from './ReportingQuery';

const meta: Meta<typeof ReportingQuery> = {
  title: 'Components/Reporting/ReportingQuery',
  component: ReportingQuery,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportingQuery>;

export const Default: Story = {
  args: {
    showStats: true,
  },
};

export const WithoutStats: Story = {
  args: {
    showStats: false,
  },
};

// Note: The component will make actual GraphQL requests
// In a production Storybook setup, you'd want to mock these
