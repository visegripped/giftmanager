import { useState, useEffect } from 'react';
import Button from '@components/Button';

const Theme = () => {

  const body = document.body;
  const theme = body.classList.value || 'theme__default';

  return (
    <>
      <section>
        <h2>This is the Theme page - handy for testing new themes.</h2>
        <h3 className="text-secondary">Currently, {theme} is being applied.</h3>
        <br /><hr /><br />
        Theme stuff to test the palette with:
        <br /><br />
        <Button label="click Theme" />
        <br /><br />
        <input type='text' defaultValue="this field has a value" />
        <br /><br />
        <textarea />
        <br /><br />
        <a href='#'>This is just  a link</a>
        <br /><br />
        <p>Paragraph tag</p>
        <br /><br />
        <div>Text not in a paragraph</div>
        <br /><br />
        <select>
          <option>Choose Theme</option>
          <option>No, choose Theme</option>
          <option>This is the one</option>
        </select><br />

      </section>
    </>
  );
};

export default Theme;
