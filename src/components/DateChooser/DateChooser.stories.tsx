import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DateChooser } from './DateChooser';

const meta = {
  title: 'Components/DateChooser',
  component: DateChooser,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultDate: {
      control: 'text',
      description: 'Default date value (YYYY-MM-DD format)',
    },
    label: {
      control: 'text',
      description: 'Label text for the date input',
    },
    required: {
      control: 'boolean',
      description: 'Whether the date field is required',
    },
  },
  args: {
    onDateChange: fn(),
  },
} satisfies Meta<typeof DateChooser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Select Date',
  },
};

export const WithDefaultDate: Story = {
  args: {
    label: 'Select Date',
    defaultDate: '2024-12-25',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Date',
    required: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    onDateChange: fn(),
  },
};

export const FutureDate: Story = {
  args: {
    label: 'Future Date',
    defaultDate: '2025-06-15',
  },
};
