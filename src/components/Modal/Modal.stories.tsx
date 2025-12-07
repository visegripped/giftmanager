import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Modal } from './Modal';
import Button from '../Button/Button';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is visible',
    },
    title: {
      control: 'text',
      description: 'Modal title text',
    },
  },
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Modal Title',
    children: (
      <div>
        <p>This is the modal content. You can put any content here.</p>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    isOpen: true,
    title: 'Modal with Footer',
    children: (
      <div>
        <p>This modal includes a footer with action buttons.</p>
      </div>
    ),
    footer: (
      <>
        <Button label="Cancel" size="medium" onButtonClick={fn()} />
        <Button label="Confirm" size="medium" onButtonClick={fn()} />
      </>
    ),
  },
};

export const LongContent: Story = {
  args: {
    isOpen: true,
    title: 'Modal with Long Content',
    children: (
      <div>
        <p>
          This modal has a lot of content to demonstrate scrolling behavior.
        </p>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>
            Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
        ))}
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    title: 'Closed Modal',
    children: <div>This modal is not visible when isOpen is false.</div>,
  },
};
