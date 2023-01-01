import React from 'react';
import FormLineItem from '../FormLineItem';
import Button from '../Button';
import './AddItemForm.css';
interface AddItemFormProps {
  onSubmit(changeEvent: object, formFields: { [key: string]: string | number | Blob }): void;
}

const AddItemForm = (props: AddItemFormProps) => {
  const { onSubmit } = props;
  const doNothing = () => {
    console.log('doing nothing.');
  };
  const onSubmitHandler = (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    const { target } = submitEvent;
    let formFields: { [key: string]: string | number | Blob } = {};
    if (target) {
      const data = new FormData(target as HTMLFormElement);
      formFields = Object.fromEntries(data.entries());
    }
    onSubmit(submitEvent, formFields);
  };

  return (
    <form data-testid="AddItemForm" onSubmit={onSubmitHandler}>
      <fieldset className="addItem-fieldset">
        <FormLineItem label="Gift: ">
          <input type="text" name="item_name" required />
        </FormLineItem>

        <FormLineItem label="URL: ">
          <input type="text" name="item_url" />
        </FormLineItem>

        <FormLineItem label="Description: ">
          <textarea name="item_description" />
        </FormLineItem>
      </fieldset>
      <div className="addItem-submit">
        <Button type="submit" theme="standard" onClick={doNothing}>
          Submit
        </Button>
      </div>
    </form>
  );
};

export default AddItemForm;
