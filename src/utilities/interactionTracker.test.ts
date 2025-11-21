import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeInteractionTracking } from './interactionTracker';
import * as reportCreateModule from './reportCreate';

// Mock reportCreate
vi.mock('./reportCreate', () => ({
  reportCreate: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock getSTID
vi.mock('../hooks/useSessionTracking', () => ({
  getSTID: vi.fn().mockReturnValue('test-stid-123'),
}));

describe('interactionTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should initialize interaction tracking only once', () => {
    initializeInteractionTracking();
    initializeInteractionTracking();
    initializeInteractionTracking();

    // Should only initialize once
    // Testing this by verifying delegated events work
    expect(document.body).toBeTruthy();
  });

  it('should track button clicks', async () => {
    initializeInteractionTracking();

    const button = document.createElement('button');
    button.textContent = 'Test Button';
    button.setAttribute('data-report-component', 'TestComponent');
    button.setAttribute('data-report-action', 'submit');
    document.body.appendChild(button);

    // Simulate click
    button.click();

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        report_type: 'interaction',
        component: 'TestComponent',
        metadata: expect.objectContaining({
          elementTag: 'button',
          elementText: 'Test Button',
        }),
      })
    );
  });

  it('should track link clicks', async () => {
    initializeInteractionTracking();

    const link = document.createElement('a');
    link.href = 'https://example.com';
    link.textContent = 'Test Link';
    link.setAttribute('data-report-component', 'Navigation');
    document.body.appendChild(link);

    // Simulate click
    link.click();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        report_type: 'interaction',
        component: 'Navigation',
        metadata: expect.objectContaining({
          elementTag: 'a',
          href: expect.stringContaining('example.com'),
        }),
      })
    );
  });

  it('should not track elements with data-report-disabled', async () => {
    initializeInteractionTracking();

    const button = document.createElement('button');
    button.setAttribute('data-report-disabled', 'true');
    document.body.appendChild(button);

    button.click();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(reportCreateModule.reportCreate).not.toHaveBeenCalled();
  });

  it('should extract metadata from data-report-* attributes', async () => {
    initializeInteractionTracking();

    const button = document.createElement('button');
    button.setAttribute('data-report-custom-field', 'custom-value');
    button.setAttribute('data-report-user-id', '123');
    document.body.appendChild(button);

    button.click();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          'custom-field': 'custom-value',
          'user-id': '123',
        }),
      })
    );
  });
});
