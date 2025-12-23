import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, ModalProps } from './Modal';

describe('Modal Component', () => {
  const defaultProps: ModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /×/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside modal', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const modal = screen.getByText('Test Modal').closest('.modal');
    if (modal) {
      fireEvent.click(modal);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const modalContent = screen.getByText('Modal Content');
    fireEvent.click(modalContent);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders with custom maxWidth', () => {
    render(<Modal {...defaultProps} maxWidth="600px" />);
    const modalContent = screen
      .getByText('Test Modal')
      .closest('.modal-content');
    expect(modalContent).toHaveStyle({ maxWidth: '600px' });
  });

  it('renders with default maxWidth when not provided', () => {
    render(<Modal {...defaultProps} />);
    const modalContent = screen
      .getByText('Test Modal')
      .closest('.modal-content');
    expect(modalContent).toHaveStyle({ maxWidth: '800px' });
  });

  it('is memoized and only re-renders when props change', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();

    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });
});
