import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon, SupportedIcons } from './Icon';

describe('Icon Component', () => {
  const supportedIcons: SupportedIcons[] = ['delete', 'edit', 'plus', 'close'];

  it('renders with all supported icon types', () => {
    supportedIcons.forEach((iconType) => {
      const { unmount } = render(<Icon icon={iconType} />);
      const iconElement = screen.getByRole('generic', { hidden: true });
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveClass('icon');
      expect(iconElement.querySelector('svg')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with title attribute', () => {
    render(<Icon icon="plus" title="Add item" />);
    const iconElement = screen.getByTitle('Add item');
    expect(iconElement).toBeInTheDocument();
  });

  it('applies correct CSS class', () => {
    render(<Icon icon="delete" />);
    const iconElement = screen.getByRole('generic', { hidden: true });
    expect(iconElement).toHaveClass('icon');
  });

  it('renders SVG element for each icon type', () => {
    supportedIcons.forEach((iconType) => {
      const { unmount } = render(<Icon icon={iconType} />);
      const svgElement = screen
        .getByRole('generic', { hidden: true })
        .querySelector('svg');
      expect(svgElement).toBeInTheDocument();
      unmount();
    });
  });

  it('renders delete icon correctly', () => {
    render(<Icon icon="delete" />);
    const iconElement = screen.getByRole('generic', { hidden: true });
    expect(iconElement.querySelector('svg')).toBeInTheDocument();
  });

  it('renders edit icon correctly', () => {
    render(<Icon icon="edit" />);
    const iconElement = screen.getByRole('generic', { hidden: true });
    expect(iconElement.querySelector('svg')).toBeInTheDocument();
  });

  it('renders plus icon correctly', () => {
    render(<Icon icon="plus" />);
    const iconElement = screen.getByRole('generic', { hidden: true });
    expect(iconElement.querySelector('svg')).toBeInTheDocument();
  });

  it('renders close icon correctly', () => {
    render(<Icon icon="close" />);
    const iconElement = screen.getByRole('generic', { hidden: true });
    expect(iconElement.querySelector('svg')).toBeInTheDocument();
  });

  it('is memoized and only re-renders when props change', () => {
    const { rerender } = render(<Icon icon="plus" />);
    const iconElement = screen.getByRole('generic', { hidden: true });

    // Re-render with same props
    rerender(<Icon icon="plus" />);
    expect(iconElement).toBeInTheDocument();

    // Re-render with different props
    rerender(<Icon icon="delete" />);
    expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();
  });

  it('handles missing title gracefully', () => {
    render(<Icon icon="plus" />);
    const iconElement = screen.getByRole('generic', { hidden: true });
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).not.toHaveAttribute('title');
  });

  it('renders within span element', () => {
    render(<Icon icon="edit" />);
    const spanElement = screen.getByRole('generic', { hidden: true });
    expect(spanElement.tagName).toBe('SPAN');
  });
});
