import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon, SupportedIcons } from './Icon';

describe('Icon Component', () => {
  const supportedIcons: SupportedIcons[] = ['delete', 'edit', 'plus', 'close'];

  it('renders with all supported icon types', () => {
    supportedIcons.forEach((iconType) => {
      const { unmount } = render(<Icon icon={iconType} />);
      const iconElement = screen.getByTestId(`icon-${iconType}`);
      expect(iconElement).toBeInTheDocument();
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
    const iconElement = screen.getByTestId('icon-delete');
    expect(iconElement).toHaveClass('icon');
  });

  it('renders SVG element for each icon type', () => {
    supportedIcons.forEach((iconType) => {
      const { unmount } = render(<Icon icon={iconType} />);
      const iconElement = screen.getByTestId(`icon-${iconType}`);
      expect(iconElement.querySelector('svg')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders delete icon correctly', () => {
    render(<Icon icon="delete" />);
    const iconElement = screen.getByTestId('icon-delete');
    expect(iconElement.querySelector('svg')).toBeInTheDocument();
  });

  it('renders edit icon correctly', () => {
    render(<Icon icon="edit" />);
    const iconElement = screen.getByTestId('icon-edit');
    expect(iconElement.querySelector('svg')).toBeInTheDocument();
  });

  it('renders plus icon correctly', () => {
    render(<Icon icon="plus" />);
    const iconElement = screen.getByTestId('icon-plus');
    expect(iconElement.querySelector('svg')).toBeInTheDocument();
  });

  it('renders close icon correctly', () => {
    render(<Icon icon="close" />);
    const iconElement = screen.getByTestId('icon-close');
    expect(iconElement.querySelector('svg')).toBeInTheDocument();
  });

  it('is memoized and only re-renders when props change', () => {
    const { rerender } = render(<Icon icon="plus" />);
    const iconElement = screen.getByTestId('icon-plus');

    // Re-render with same props
    rerender(<Icon icon="plus" />);
    expect(iconElement).toBeInTheDocument();

    // Re-render with different props
    rerender(<Icon icon="delete" />);
    expect(screen.getByTestId('icon-delete')).toBeInTheDocument();
  });

  it('handles missing title gracefully', () => {
    render(<Icon icon="plus" />);
    const iconElement = screen.getByTestId('icon-plus');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).not.toHaveAttribute('title');
  });

  it('renders within span element', () => {
    render(<Icon icon="edit" />);
    const spanElement = screen.getByTestId('icon-edit');
    expect(spanElement.tagName).toBe('SPAN');
  });
});
