import React from 'react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * Reusable Modal component following the ReportingQuery modal pattern
 */
export const Modal = React.memo((props: ModalProps) => {
  const { isOpen, onClose, title, children, maxWidth = '800px' } = props;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close" type="button">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
