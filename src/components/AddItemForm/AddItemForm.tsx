import { useState } from 'react';
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
export const AddItemForm = (props: AddItemFormProps) => {
  const { onAddItemFormSubmit = () => { }, legendText = 'Add item to list' } =
    props;

  const [addItemName, setAddItemName] = useState('');
  const [addItemDescription, setAddItemDescription] = useState('');
  const [addItemLink, setAddItemLink] = useState('');

  return (
    <form
      className="form"
      onSubmit={(formSubmitEvent: React.FormEvent<HTMLFormElement>) => {
        formSubmitEvent.preventDefault();
        onAddItemFormSubmit(addItemName, addItemDescription, addItemLink);
        setAddItemName('');
        setAddItemDescription('');
        setAddItemLink('');
      }}
    >
      <fieldset className="fieldset">
        <legend className="legend">{legendText}</legend>
        <label className="label">Name</label>
        <div className="input-container">
          <input
            type="text"
            name="name"
            required
            value={addItemName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setAddItemName(event.target.value);
            }}
          />
        </div>

        <label>Link</label>
        <div className="input-container">
          <input
            type="url"
            name="link"
            value={addItemLink}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setAddItemLink(event.target.value);
            }}
          />
        </div>

        <label>Description</label>
        <div className="input-container">
          <textarea
            name="description"
            value={addItemDescription}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              setAddItemDescription(event.target.value);
            }}
          ></textarea>
        </div>

        <Button icon="plus" label="Add" type="submit" />
      </fieldset>
    </form>
  );
};

export default AddItemForm;
