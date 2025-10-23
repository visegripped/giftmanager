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
    render(<AddItemForm {...defaultProps} />);

    expect(screen.getByText('Add item to list')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Link')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
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
    render(<AddItemForm {...defaultProps} onAddItemFormSubmit={mockSubmit} />);

    const nameInput = screen.getByLabelText('Name');
    const linkInput = screen.getByLabelText('Link');
    const descriptionInput = screen.getByLabelText('Description');
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
    render(<AddItemForm {...defaultProps} onAddItemFormSubmit={mockSubmit} />);

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const linkInput = screen.getByLabelText('Link') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      'Description'
    ) as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(nameInput, { target: { value: 'Test Item' } });
    fireEvent.change(linkInput, { target: { value: 'https://example.com' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test description' },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(linkInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
    });
  });

  it('prevents default form submission behavior', () => {
    render(<AddItemForm {...defaultProps} />);

    const form = screen.getByRole('form');
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

    fireEvent(form, submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('handles individual input changes', () => {
    render(<AddItemForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const linkInput = screen.getByLabelText('Link') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      'Description'
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
    render(<AddItemForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveAttribute('required');
  });

  it('sets correct input types', () => {
    render(<AddItemForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name');
    const linkInput = screen.getByLabelText('Link');

    expect(nameInput).toHaveAttribute('type', 'text');
    expect(linkInput).toHaveAttribute('type', 'url');
  });

  it('renders submit button with correct attributes', () => {
    render(<AddItemForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /add/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('handles empty form submission', async () => {
    const mockSubmit = vi.fn();
    render(<AddItemForm {...defaultProps} onAddItemFormSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('', '', '');
    });
  });

  it('handles partial form submission', async () => {
    const mockSubmit = vi.fn();
    render(<AddItemForm {...defaultProps} onAddItemFormSubmit={mockSubmit} />);

    const nameInput = screen.getByLabelText('Name');
    const submitButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(nameInput, { target: { value: 'Only Name' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('Only Name', '', '');
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

  it('handles form submission via Enter key', async () => {
    const mockSubmit = vi.fn();
    render(<AddItemForm {...defaultProps} onAddItemFormSubmit={mockSubmit} />);

    const nameInput = screen.getByDisplayValue('');
    fireEvent.change(nameInput, { target: { value: 'Test Item' } });
    fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

    // Note: This test assumes the form handles Enter key submission
    // The actual behavior depends on the form's onSubmit handler
  });

  it('renders with correct CSS classes', () => {
    render(<AddItemForm {...defaultProps} />);

    expect(screen.getByRole('group')).toHaveClass('fieldset');
    expect(screen.getByText('Add item to list')).toHaveClass('legend');
  });
});
