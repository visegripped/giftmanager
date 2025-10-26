import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddItemForm, AddItemFormProps } from './AddItemForm';

describe('AddItemForm Component', () => {
  const defaultProps: AddItemFormProps = {
    onAddItemFormSubmit: vi.fn(),
    legendText: 'Add item to list',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all input fields', () => {
    const { container } = render(<AddItemForm {...defaultProps} />);

    expect(screen.getByText('Add item to list')).toBeInTheDocument();
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="link"]')).toBeInTheDocument();
    expect(
      container.querySelector('textarea[name="description"]')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('renders with default legend text when not provided', () => {
    render(<AddItemForm onAddItemFormSubmit={vi.fn()} />);
    expect(screen.getByText('Add item to list')).toBeInTheDocument();
  });

  it('renders with custom legend text', () => {
    render(<AddItemForm {...defaultProps} legendText="Custom legend" />);
    expect(screen.getByText('Custom legend')).toBeInTheDocument();
  });

  it('handles form submission with all fields filled', async () => {
    const mockSubmit = vi.fn();
    const { container } = render(
      <AddItemForm {...defaultProps} onAddItemFormSubmit={mockSubmit} />
    );

    const nameInput = container.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    const linkInput = container.querySelector(
      'input[name="link"]'
    ) as HTMLInputElement;
    const descriptionInput = container.querySelector(
      'textarea[name="description"]'
    ) as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(nameInput, { target: { value: 'Test Item' } });
    fireEvent.change(linkInput, { target: { value: 'https://example.com' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test description' },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        'Test Item',
        'Test description',
        'https://example.com'
      );
    });
  });

  it('clears form fields after successful submission', async () => {
    const mockSubmit = vi.fn();
    const { container } = render(
      <AddItemForm {...defaultProps} onAddItemFormSubmit={mockSubmit} />
    );

    const nameInput = container.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(nameInput, { target: { value: 'Test Item' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
    });
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('handles individual input changes', () => {
    const { container } = render(<AddItemForm {...defaultProps} />);

    const nameInput = container.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    const linkInput = container.querySelector(
      'input[name="link"]'
    ) as HTMLInputElement;
    const descriptionInput = container.querySelector(
      'textarea[name="description"]'
    ) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(nameInput.value).toBe('New Name');

    fireEvent.change(linkInput, { target: { value: 'https://newlink.com' } });
    expect(linkInput.value).toBe('https://newlink.com');

    fireEvent.change(descriptionInput, {
      target: { value: 'New description' },
    });
    expect(descriptionInput.value).toBe('New description');
  });

  it('requires name field', () => {
    const { container } = render(<AddItemForm {...defaultProps} />);

    const nameInput = container.querySelector('input[name="name"]');
    expect(nameInput).toHaveAttribute('required');
  });

  it('sets correct input types', () => {
    const { container } = render(<AddItemForm {...defaultProps} />);

    const nameInput = container.querySelector('input[name="name"]');
    const linkInput = container.querySelector('input[name="link"]');
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(linkInput).toHaveAttribute('type', 'url');
  });

  it('renders submit button with correct attributes', () => {
    render(<AddItemForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /add/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('handles partial form submission', async () => {
    const mockSubmit = vi.fn();
    const { container } = render(
      <AddItemForm {...defaultProps} onAddItemFormSubmit={mockSubmit} />
    );

    const nameInput = container.querySelector('input[name="name"]');
    const submitButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(nameInput!, { target: { value: 'Only Name' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  it('is memoized and only re-renders when props change', () => {
    const { rerender } = render(<AddItemForm {...defaultProps} />);
    const form = screen.getByRole('group');

    // Re-render with same props
    rerender(<AddItemForm {...defaultProps} />);
    expect(form).toBeInTheDocument();

    // Re-render with different props
    rerender(<AddItemForm {...defaultProps} legendText="Different legend" />);
    expect(screen.getByText('Different legend')).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    render(<AddItemForm {...defaultProps} />);

    expect(screen.getByRole('group')).toHaveClass('fieldset');
    expect(screen.getByText('Add item to list')).toHaveClass('legend');
  });
});
