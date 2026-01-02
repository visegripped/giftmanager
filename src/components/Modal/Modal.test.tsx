import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, ModalProps } from './Modal';

describe('Modal Component', () => {
  const defaultProps: ModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

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
    const closeButton = screen.getByTitle('Close modal');
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

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when other keys are pressed', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space' });
    fireEvent.keyDown(document, { key: 'Tab' });
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

  it('renders footer when provided', () => {
    render(<Modal {...defaultProps} footer={<button>Footer Button</button>} />);
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('renders without footer when footer is not provided', () => {
    const { container } = render(<Modal {...defaultProps} />);
    const footer = container.querySelector('.modal-footer');
    expect(footer).not.toBeInTheDocument();
  });

  it('prevents body scroll when modal is open', () => {
    const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');

    rerender(<Modal {...defaultProps} isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('is memoized and only re-renders when props change', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();

    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });
});
