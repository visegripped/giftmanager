import React, { useState, useCallback } from 'react';
import './AddItemForm.css';
import Button from '../Button/Button';

export interface AddItemFormProps {
  onAddItemFormSubmit?: (
    name: string,
    description: string,
    link: string
  ) => void;
  legendText?: string;
}

/**
 * Primary UI component for user interaction
 */
export const AddItemForm = React.memo((props: AddItemFormProps) => {
  const { onAddItemFormSubmit = () => {}, legendText = 'Add item to list' } =
    props;

  const [addItemName, setAddItemName] = useState('');
  const [addItemDescription, setAddItemDescription] = useState('');
  const [addItemLink, setAddItemLink] = useState('');

  const handleSubmit = useCallback(
    (formSubmitEvent: React.FormEvent<HTMLFormElement>) => {
      formSubmitEvent.preventDefault();
      onAddItemFormSubmit(addItemName, addItemDescription, addItemLink);
      setAddItemName('');
      setAddItemDescription('');
      setAddItemLink('');
    },
    [addItemName, addItemDescription, addItemLink, onAddItemFormSubmit]
  );

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddItemName(event.target.value);
    },
    []
  );

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAddItemDescription(event.target.value);
    },
    []
  );

  const handleLinkChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddItemLink(event.target.value);
    },
    []
  );

  return (
    <form className="addItemForm" onSubmit={handleSubmit}>
      <fieldset className="fieldset">
        <legend className="legend">{legendText}</legend>
        <label className="label">Name</label>
        <div className="input-container">
          <input
            type="text"
            name="name"
            required
            value={addItemName}
            onChange={handleNameChange}
          />
        </div>

        <label>Link</label>
        <div className="input-container">
          <input
            type="url"
            name="link"
            value={addItemLink}
            onChange={handleLinkChange}
          />
        </div>

        <label>Description</label>
        <div className="input-container">
          <textarea
            name="description"
            value={addItemDescription}
            onChange={handleDescriptionChange}
          ></textarea>
        </div>

        <Button icon="plus" label="Add" type="submit" />
      </fieldset>
    </form>
  );
});

AddItemForm.displayName = 'AddItemForm';

export default AddItemForm;
