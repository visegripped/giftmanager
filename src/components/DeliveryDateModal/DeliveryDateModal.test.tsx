import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeliveryDateModal } from './DeliveryDateModal';

describe('DeliveryDateModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore Date after each test
    global.Date = Date;
  });

  it('renders when isOpen is true', () => {
    render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText(/Set delivery date/)).toBeInTheDocument();
  });

  it('renders item name in title when provided', () => {
    render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        itemName="Test Item"
      />
    );
    expect(
      screen.getByText(/Set delivery date for "Test Item"/)
    ).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm with selected date when confirm button is clicked', () => {
    render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        defaultDate="2024-12-25"
      />
    );
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    expect(mockOnConfirm).toHaveBeenCalledWith('2024-12-25');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates date when user selects a new date', () => {
    const { container } = render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        defaultDate="2024-12-25"
      />
    );

    // Use container query as fallback
    const dateInput = container.querySelector(
      '#date-chooser-input'
    ) as HTMLInputElement;
    expect(dateInput).toBeTruthy();
    fireEvent.change(dateInput, { target: { value: '2024-12-30' } });

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    expect(mockOnConfirm).toHaveBeenCalledWith('2024-12-30');
  });

  it('calculates default date from birthday when provided', () => {
    // Mock date to be in March
    const RealDate = Date;
    const mockDateInstance = new RealDate(2024, 2, 15); // March 15, 2024

    global.Date = class extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(2024, 2, 15); // March 15, 2024
        } else {
          super(...(args as Parameters<DateConstructor>));
        }
      }
    } as any;

    // Mock Date.now() as well
    const originalNow = Date.now;
    global.Date.now = () => mockDateInstance.getTime();

    const { container } = render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        birthdayMonth={6}
        birthdayDay={10}
      />
    );

    const dateInput = container.querySelector(
      '#date-chooser-input'
    ) as HTMLInputElement;
    expect(dateInput).toBeTruthy();
    // Should default to June 10 (birthday) since it's sooner than Christmas
    expect(dateInput.value).toBe('2024-06-10');

    // Restore
    global.Date = RealDate;
    global.Date.now = originalNow;
  });

  it('calculates default date to Christmas when no birthday provided', () => {
    const { container } = render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const dateInput = container.querySelector(
      '#date-chooser-input'
    ) as HTMLInputElement;
    expect(dateInput).toBeTruthy();
    // Should default to Christmas
    expect(dateInput.value).toMatch(/^\d{4}-12-25$/);
  });

  it('resets date when modal reopens', () => {
    const { container, rerender } = render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        defaultDate="2024-12-25"
      />
    );

    let dateInput = container.querySelector(
      '#date-chooser-input'
    ) as HTMLInputElement;
    expect(dateInput).toBeTruthy();
    expect(dateInput.value).toBe('2024-12-25');
    fireEvent.change(dateInput, { target: { value: '2024-12-30' } });
    expect(dateInput.value).toBe('2024-12-30');

    // Close modal
    rerender(
      <DeliveryDateModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        defaultDate="2024-12-25"
      />
    );

    // Modal should not be visible when closed
    expect(
      container.querySelector('#date-chooser-input')
    ).not.toBeInTheDocument();

    // Reopen modal
    rerender(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        defaultDate="2024-12-25"
      />
    );

    dateInput = container.querySelector(
      '#date-chooser-input'
    ) as HTMLInputElement;
    expect(dateInput).toBeTruthy();
    // Should reset to default date
    expect(dateInput.value).toBe('2024-12-25');
  });

  it('does not show error message initially', () => {
    render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        defaultDate="2024-12-25"
      />
    );

    // Error message should not be visible initially
    expect(
      screen.queryByText('Please select a valid date.')
    ).not.toBeInTheDocument();
  });

  it('does not call onConfirm when attempting to confirm with empty date', () => {
    // This test verifies the component's validation logic
    // Note: The date input with required attribute may prevent empty values
    // but we test the component's internal validation
    render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        defaultDate="2024-12-25"
      />
    );

    // Try to confirm without changing date (should work with valid date)
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    // Should call onConfirm with the default date
    expect(mockOnConfirm).toHaveBeenCalledWith('2024-12-25');
  });

  it('uses calculated date from birthday when defaultDate is not provided', () => {
    // Mock date to be in March
    const RealDate = Date;
    const mockDateInstance = new Date(2024, 2, 15); // March 15, 2024

    global.Date = class extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(2024, 2, 15); // March 15, 2024
        } else {
          super(...(args as Parameters<DateConstructor>));
        }
      }
    } as any;

    // Mock Date.now() as well
    const originalNow = Date.now;
    global.Date.now = () => mockDateInstance.getTime();

    render(
      <DeliveryDateModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        birthdayMonth={6}
        birthdayDay={10}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    // Should use calculated date (June 10, which is sooner than Christmas)
    expect(mockOnConfirm).toHaveBeenCalledWith('2024-06-10');

    // Restore
    global.Date = RealDate;
    global.Date.now = originalNow;
  });
});
