import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    const backdrop = screen.getByText('Test Modal').closest('.modal');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when modal content is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    const content = screen.getByText('Test Content');
    fireEvent.click(content);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        footer={<button>Footer Button</button>}
      >
        <div>Test Content</div>
      </Modal>
    );
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('prevents body scroll when modal is open', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('unset');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('unset');
  });

  it('does not call onClose when other keys are pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space' });
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders without footer when footer is not provided', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    );
    const footer = container.querySelector('.modal-footer');
    expect(footer).not.toBeInTheDocument();
  });
});
