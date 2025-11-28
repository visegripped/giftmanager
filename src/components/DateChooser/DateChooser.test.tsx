import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateChooser, calculateNearestGiftDate } from './DateChooser';

describe('DateChooser', () => {
  const mockOnDateChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with label', () => {
    render(<DateChooser onDateChange={mockOnDateChange} label="Select Date" />);
    expect(screen.getByText('Select Date')).toBeInTheDocument();
  });

  it('renders required indicator when required is true', () => {
    render(
      <DateChooser
        onDateChange={mockOnDateChange}
        label="Select Date"
        required={true}
      />
    );
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
  });

  it('calls onDateChange when date is selected', () => {
    render(<DateChooser onDateChange={mockOnDateChange} label="Select Date" />);
    const input = screen.getByLabelText('Select Date');
    fireEvent.change(input, { target: { value: '2024-12-25' } });
    expect(mockOnDateChange).toHaveBeenCalledWith('2024-12-25');
  });

  it('uses defaultDate when provided', () => {
    render(
      <DateChooser
        onDateChange={mockOnDateChange}
        defaultDate="2024-12-25"
        label="Select Date"
      />
    );
    const input = screen.getByLabelText('Select Date') as HTMLInputElement;
    expect(input.value).toBe('2024-12-25');
  });

  it('updates when defaultDate changes', () => {
    const { rerender } = render(
      <DateChooser
        onDateChange={mockOnDateChange}
        defaultDate="2024-12-25"
        label="Select Date"
      />
    );
    const input = screen.getByLabelText('Select Date') as HTMLInputElement;
    expect(input.value).toBe('2024-12-25');

    rerender(
      <DateChooser
        onDateChange={mockOnDateChange}
        defaultDate="2025-01-01"
        label="Select Date"
      />
    );
    expect(input.value).toBe('2025-01-01');
  });

  it('has required attribute when required is true', () => {
    const { container } = render(
      <DateChooser
        onDateChange={mockOnDateChange}
        label="Select Date"
        required={true}
      />
    );
    const input = container.querySelector(
      '#date-chooser-input'
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.hasAttribute('required')).toBe(true);
    expect(input.getAttribute('required')).not.toBeNull();
  });

  it('does not have required attribute when required is false', () => {
    render(
      <DateChooser
        onDateChange={mockOnDateChange}
        label="Select Date"
        required={false}
      />
    );
    const input = screen.getByLabelText('Select Date') as HTMLInputElement;
    expect(input.required).toBe(false);
  });

  it('calls onDateChange with empty string when date is cleared', () => {
    render(
      <DateChooser
        onDateChange={mockOnDateChange}
        defaultDate="2024-12-25"
        label="Select Date"
      />
    );
    const input = screen.getByLabelText('Select Date');
    fireEvent.change(input, { target: { value: '' } });
    expect(mockOnDateChange).toHaveBeenCalledWith('');
  });
});

describe('calculateNearestGiftDate', () => {
  const mockDate = (year: number, month: number, day: number) => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(year, month - 1, day); // month is 0-indexed in Date constructor
        } else {
          super(...args);
        }
      }
    } as any;
    // Also mock Date.now()
    const date = new Date(year, month - 1, day);
    global.Date.now = () => date.getTime();
  };

  const restoreDate = () => {
    global.Date = Date;
  };

  it('returns Christmas when no birthday is provided', () => {
    const result = calculateNearestGiftDate(null, null);
    expect(result).toMatch(/^\d{4}-12-25$/);
  });

  it('returns next Christmas when current date is before December 25', () => {
    mockDate(2024, 3, 15); // March 15, 2024
    const result = calculateNearestGiftDate(null, null);
    expect(result).toBe('2024-12-25');
    restoreDate();
  });

  it('returns next year Christmas when current date is after December 25', () => {
    mockDate(2024, 12, 26); // December 26, 2024
    const result = calculateNearestGiftDate(null, null);
    expect(result).toBe('2025-12-25');
    restoreDate();
  });

  it('returns birthday when it is sooner than Christmas', () => {
    mockDate(2024, 3, 15); // March 15, 2024
    const result = calculateNearestGiftDate(6, 10); // June 10
    expect(result).toBe('2024-06-10');
    restoreDate();
  });

  it('returns Christmas when it is sooner than birthday', () => {
    mockDate(2024, 11, 15); // November 15, 2024
    const result = calculateNearestGiftDate(6, 10); // June 10
    expect(result).toBe('2024-12-25');
    restoreDate();
  });

  it('returns next year birthday when birthday has passed and is sooner than next Christmas', () => {
    // Mock date to be after Christmas (December 26, 2024)
    // In this case, next Christmas is 2025-12-25, and next birthday is 2025-06-10
    // So the birthday should be returned since it's sooner
    mockDate(2024, 12, 26); // December 26, 2024
    const result = calculateNearestGiftDate(6, 10); // June 10
    // Next Christmas: 2025-12-25, Next Birthday: 2025-06-10
    // Birthday is sooner, so should return 2025-06-10
    expect(result).toBe('2025-06-10');
    restoreDate();
  });
});
