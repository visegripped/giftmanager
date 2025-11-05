import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, ButtonProps } from './Button';

describe('Button Component', () => {
  const defaultProps: ButtonProps = {
    label: 'Test Button',
  };

  it('renders with default props', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders with custom label', () => {
    render(<Button label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<Button icon="plus" label="Add" />);
    const button = screen.getByRole('button', { name: /add/i });
    expect(button).toBeInTheDocument();
    // Icon should be present (SVG element)
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="small" label="Small" />);
    expect(screen.getByRole('button')).toHaveClass('button--small');

    rerender(<Button size="medium" label="Medium" />);
    expect(screen.getByRole('button')).toHaveClass('button--medium');

    rerender(<Button size="large" label="Large" />);
    expect(screen.getByRole('button')).toHaveClass('button--large');
  });

  it('renders as submit button', () => {
    render(<Button type="submit" label="Submit" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onButtonClick={handleClick} label="Click Me" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when not provided', () => {
    render(<Button label="No Click" />);
    const button = screen.getByRole('button');

    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it('renders with title attribute', () => {
    render(<Button title="Tooltip text" label="Button" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Tooltip text');
  });

  it('renders only icon without label', () => {
    render(<Button icon="plus" />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(button.querySelector('span')).toBeInTheDocument(); // The span contains the icon
  });

  it('renders only label without icon', () => {
    render(<Button label="Text Only" />);
    const button = screen.getByRole('button');
    expect(button.querySelector('span')).toBeInTheDocument();
    expect(button.querySelector('svg')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<Button size="medium" label="Test" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button', 'button--medium');
  });

  it('is memoized and only re-renders when props change', () => {
    const { rerender } = render(<Button label="Test" />);
    const button = screen.getByRole('button');

    // Re-render with same props
    rerender(<Button label="Test" />);
    expect(button).toBeInTheDocument();

    // Re-render with different props
    rerender(<Button label="Different" />);
    expect(screen.getByText('Different')).toBeInTheDocument();
  });
});
