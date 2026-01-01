import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';
import Button from '../Button/Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

/**
 * Reusable Modal component following the ReportingQuery modal pattern
 */
export const Modal = React.memo((props: ModalProps) => {
  const {
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '800px',
    footer,
  } = props;

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const modalNode = (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <Button
            onButtonClick={onClose}
            aria-label="Close modal"
            type="button"
            icon="close"
          ></Button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );

  // Render in a portal so overlay covers header/footer regardless of stacking contexts
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalNode, document.body);
  }
  return modalNode;
});

Modal.displayName = 'Modal';

export default Modal;
