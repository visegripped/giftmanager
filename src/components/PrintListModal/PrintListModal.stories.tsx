import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PrintListModal } from './PrintListModal';
import { NotificationsProvider } from '../../context/NotificationsContext';

const meta = {
  title: 'Example/PrintListModal',
  component: PrintListModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: { onClose: fn() },
  decorators: [
    (Story) => (
      <NotificationsProvider>
        <Story />
      </NotificationsProvider>
    ),
  ],
} satisfies Meta<typeof PrintListModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    myUserid: '1',
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    myUserid: '1',
  },
};
