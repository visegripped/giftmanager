/**
 * Interaction Tracker
 * Uses delegated event listeners to track all button and link interactions
 */

import { reportCreate, ReportInput } from './reportCreate';
import { getSTID } from '../hooks/useSessionTracking';

let interactionTrackerInitialized = false;

interface InteractionData {
  element: HTMLElement;
  event: MouseEvent;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Extract component name from element
 * Checks data attributes and class names
 */
function getComponentName(element: HTMLElement): string | undefined {
  // Check data attributes first
  const dataComponent = element.getAttribute('data-report-component');
  if (dataComponent) {
    return dataComponent;
  }

  // Check for React component class names (common patterns)
  const className = element.className;
  if (typeof className === 'string') {
    // Match patterns like "Button_button__xyz" or "ComponentName"
    const match = className.match(/([A-Z][a-zA-Z0-9]+)_/);
    if (match) {
      return match[1];
    }
  }

  // Check parent elements for component context
  let current: HTMLElement | null = element.parentElement;
  let depth = 0;
  while (current && depth < 3) {
    const parentComponent = current.getAttribute('data-report-component');
    if (parentComponent) {
      return parentComponent;
    }
    current = current.parentElement;
    depth++;
  }

  return undefined;
}

/**
 * Extract action name from element
 */
function getActionName(element: HTMLElement): string | undefined {
  // Check data attributes
  const dataAction = element.getAttribute('data-report-action');
  if (dataAction) {
    return dataAction;
  }

  // Infer from element type and attributes
  if (element.tagName === 'BUTTON') {
    const type = (element as HTMLButtonElement).type;
    return type || 'click';
  }

  if (element.tagName === 'A') {
    return 'navigation';
  }

  return 'click';
}

/**
 * Extract metadata from element data attributes
 */
function getMetadata(element: HTMLElement): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  // Get all data-report-* attributes
  Array.from(element.attributes).forEach((attr) => {
    if (
      attr.name.startsWith('data-report-') &&
      attr.name !== 'data-report-component' &&
      attr.name !== 'data-report-action'
    ) {
      const key = attr.name.replace('data-report-', '');
      metadata[key] = attr.value;
    }
  });

  // Add element information
  metadata.elementTag = element.tagName.toLowerCase();
  metadata.elementText = element.textContent?.trim().substring(0, 100); // Limit text length
  metadata.elementId = element.id || undefined;
  metadata.elementClass = element.className || undefined;

  // For links, add href
  if (element.tagName === 'A') {
    const href = (element as HTMLAnchorElement).href;
    if (href) {
      metadata.href = href;
    }
  }

  // For buttons, add type
  if (element.tagName === 'BUTTON') {
    const type = (element as HTMLButtonElement).type;
    if (type) {
      metadata.buttonType = type;
    }
  }

  return metadata;
}

/**
 * Handle interaction event
 */
async function handleInteraction(data: InteractionData): Promise<void> {
  const { element, event, component, action, metadata } = data;

  const stid = getSTID();
  if (!stid) {
    return; // Can't track without STID
  }

  // Get userid from localStorage if available
  // TODO: Get from user context when available
  const userid = undefined;

  const reportInput: ReportInput = {
    stid,
    userid,
    report_type: 'interaction',
    component: component || getComponentName(element),
    message: `User interacted with ${element.tagName.toLowerCase()}: ${action || 'click'}`,
    metadata: {
      ...getMetadata(element),
      ...metadata,
      eventType: event.type,
      timestamp: new Date().toISOString(),
    },
  };

  // Don't await - fire and forget to avoid blocking UI
  reportCreate(reportInput).catch((error) => {
    console.error('Failed to report interaction:', error);
  });
}

/**
 * Initialize interaction tracking with delegated event listeners
 */
export function initializeInteractionTracking(): void {
  if (interactionTrackerInitialized) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  // Single delegated event listener on document body
  document.body.addEventListener(
    'click',
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Only track buttons and links
      if (!target || (target.tagName !== 'BUTTON' && target.tagName !== 'A')) {
        return;
      }

      // Don't track if explicitly disabled
      if (target.hasAttribute('data-report-disabled')) {
        return;
      }

      // Handle the interaction
      handleInteraction({
        element: target,
        event,
      });
    },
    true // Use capture phase to catch events early
  );

  interactionTrackerInitialized = true;
}

/**
 * Disable interaction tracking (for testing or special cases)
 */
export function disableInteractionTracking(): void {
  // Note: Once event listeners are added, they can't be easily removed
  // This is a placeholder for future implementation if needed
  interactionTrackerInitialized = false;
}

export default initializeInteractionTracking;
