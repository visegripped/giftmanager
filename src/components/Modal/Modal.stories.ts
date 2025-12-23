import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Modal } from './Modal';

const meta = {
  title: 'Example/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: { onClose: fn() },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Modal Title',
    children: (
      <div>
        <p>This is the modal content.</p>
        <p>You can put any content here.</p>
      </div>
    ),
  },
};

export const WithLongContent: Story = {
  args: {
    isOpen: true,
    title: 'Modal with Long Content',
    children: (
      <div>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>This is paragraph {i + 1} of a long content.</p>
        ))}
      </div>
    ),
  },
};

export const CustomWidth: Story = {
  args: {
    isOpen: true,
    title: 'Modal with Custom Width',
    maxWidth: '600px',
    children: <div>This modal has a custom max width of 600px.</div>,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    title: 'Closed Modal',
    children: <div>This modal is closed and should not be visible.</div>,
  },
};
