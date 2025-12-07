import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';
import {
  DateChooser,
  calculateNearestGiftDate,
} from '../DateChooser/DateChooser';
import Button from '../Button/Button';
import './DeliveryDateModal.css';

export interface DeliveryDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  defaultDate?: string;
  itemName?: string;
  birthdayMonth?: number | null;
  birthdayDay?: number | null;
}

/**
 * Modal for selecting delivery date when marking item as purchased
 */
export const DeliveryDateModal = React.memo((props: DeliveryDateModalProps) => {
  const {
    isOpen,
    onClose,
    onConfirm,
    defaultDate,
    itemName,
    birthdayMonth,
    birthdayDay,
  } = props;

  // Calculate default date if not provided
  const calculatedDefaultDate =
    defaultDate ||
    calculateNearestGiftDate(birthdayMonth || null, birthdayDay || null);

  const [selectedDate, setSelectedDate] = useState<string>(
    calculatedDefaultDate
  );
  const [isValid, setIsValid] = useState<boolean>(true);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDate(calculatedDefaultDate);
      setIsValid(true);
    }
  }, [isOpen, calculatedDefaultDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setIsValid(!!date);
  };

  const handleConfirm = () => {
    if (selectedDate && isValid) {
      onConfirm(selectedDate);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        itemName ? `Set delivery date for "${itemName}"` : 'Set delivery date'
      }
      footer={
        <>
          <Button label="Cancel" size="medium" onButtonClick={handleCancel} />
          <Button
            label="Confirm"
            size="medium"
            onButtonClick={handleConfirm}
            type="submit"
          />
        </>
      }
    >
      <div className="delivery-date-modal-content">
        <p className="delivery-date-modal-description">
          Please select the expected delivery date for this item.
        </p>
        <DateChooser
          defaultDate={calculatedDefaultDate}
          onDateChange={handleDateChange}
          label="Expected delivery date"
          required={true}
        />
        {!isValid && (
          <p className="delivery-date-modal-error">
            Please select a valid date.
          </p>
        )}
      </div>
    </Modal>
  );
});

DeliveryDateModal.displayName = 'DeliveryDateModal';

export default DeliveryDateModal;
