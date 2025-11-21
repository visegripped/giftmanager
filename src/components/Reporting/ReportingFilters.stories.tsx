import type { Meta, StoryObj } from '@storybook/react';
import { ReportingFilters } from './ReportingFilters';

const meta: Meta<typeof ReportingFilters> = {
  title: 'Components/Reporting/ReportingFilters',
  component: ReportingFilters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportingFilters>;

export const Default: Story = {
  args: {
    onFilterChange: (filters) => {
      console.log('Filters changed:', filters);
    },
    onClearFilters: () => {
      console.log('Filters cleared');
    },
  },
};

export const WithActions: Story = {
  args: {
    onFilterChange: (filters) => {
      alert(`Filters changed: ${JSON.stringify(filters, null, 2)}`);
    },
    onClearFilters: () => {
      alert('Filters cleared!');
    },
  },
};
