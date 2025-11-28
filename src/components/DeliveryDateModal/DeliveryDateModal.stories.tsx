import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DeliveryDateModal } from './DeliveryDateModal';

const meta = {
  title: 'Components/DeliveryDateModal',
  component: DeliveryDateModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is visible',
    },
    itemName: {
      control: 'text',
      description: 'Name of the item for delivery date',
    },
    defaultDate: {
      control: 'text',
      description: 'Default date value (YYYY-MM-DD format)',
    },
    birthdayMonth: {
      control: 'number',
      description: 'User birthday month (1-12)',
    },
    birthdayDay: {
      control: 'number',
      description: 'User birthday day (1-31)',
    },
  },
  args: {
    onClose: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof DeliveryDateModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
  },
};

export const WithItemName: Story = {
  args: {
    isOpen: true,
    itemName: 'Nintendo Switch',
  },
};

export const WithDefaultDate: Story = {
  args: {
    isOpen: true,
    itemName: 'Gift Item',
    defaultDate: '2024-12-25',
  },
};

export const WithBirthday: Story = {
  args: {
    isOpen: true,
    itemName: 'Birthday Gift',
    birthdayMonth: 6,
    birthdayDay: 15,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    itemName: 'Hidden Modal',
  },
};

export const LongItemName: Story = {
  args: {
    isOpen: true,
    itemName: 'Very Long Item Name That Might Wrap in the Modal Title',
  },
};
