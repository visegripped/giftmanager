import { useContext } from 'react';
import Button from '@components/Button';
import Notification from '@components/Notification';
import { NotificationsContext, AddNotificationProps } from '@context/NotificationsContext';
import './Theme.css';

/*
  type: string;
  message: string;
  persist?: boolean;
  clearDuration?: number;
  */

const Theme = () => {
  const body = document.body;
  const theme = body.classList.value || 'theme__default';
  const { addNotification } = useContext(NotificationsContext);

  const notify = (report: AddNotificationProps) => {
    const { type = '', message = '', persist = false, clearDuration = 10000 } = report;
    addNotification({
      type,
      message,
      persist,
      clearDuration,
    });
  };

  return (
    <>
      <div className="element">
        <h2>
          This is the Theme page - handy for testing new themes. Currently,{' '}
          {theme} is being applied.
        </h2>
      </div>

      <div className="grid">
        <section className="grid-columns">
          <h3>Copy</h3>

          <div className="element">
            <a href="#">Stand alone link</a>
          </div>
          <div className="element">
            This is a <a href="#">link</a> with some copy around it. Should be
            distinctly obvious that the word '<a href="#">link</a>' is
            clickable.
          </div>
          <div className="element text-secondary">
            Text-secondary is applied here. This <a href="#">link</a> has copy
            around it. Should be distinctly obvious that the word '
            <a href="#">link</a>' is clickable.
          </div>
          <div className="element">
            <p>This is a paragraph tag with short text.</p>
            <p>
              Slightly longer paragraph. Probably won't come up on this site.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          <div className="element">
            <h1>This is the H1</h1>
          </div>
          <div className="element">
            <h2>This is the H2</h2>
          </div>
          <div className="element">
            <h3>This is the H3</h3>
          </div>
          <div className="element">
            <h4>This is the H4</h4>
          </div>
          <div className="element">
            <h5>This is the H5</h5>
          </div>
          <div className="element">
            <h6>This is the H6</h6>
          </div>
          <div className="element"></div>
        </section>

        <section className="grid-columns">
          <h3>Form Elements</h3>

          <div className="element">
            <label htmlFor="textInput">Text input</label>
            <input name="textInput" type="text" placeholder="is this text" />
          </div>
          <div className="element">
            <label htmlFor="textArea">Text area</label>
            <textarea name="textArea"></textarea>
          </div>
          <div className="element">
            <label htmlFor="selectList">Select list</label>
            <select name="selectList">
              <option>Choose Theme</option>
              <option>No, choose Theme</option>
              <option>This is the one</option>
            </select>
          </div>
          <div className="element">
            <label htmlFor="emailInput">Email input</label>
            <input type="email" id="email" name="emailInput" />
          </div>
          <div className="element">
            <label htmlFor="emailMultipe">Email multiple</label>
            <input
              type="email"
              id="emailMultiplle"
              name="emailMultipe"
              multiple
            />
          </div>
          <div className="element">
            <label htmlFor="searchInput">Search input</label>
            <input type="search" id="search" name="searchInput" />
          </div>
          <div className="element">
            <label htmlFor="telInput">Telephone input</label>
            <input type="tel" id="tel" name="telInput" />
          </div>
          <div className="element">
            <label htmlFor="urlInput">URL input</label>
            <input type="url" id="url" name="urlInput" />
          </div>
          <div className="element">
            <label htmlFor="ageInput">Number input</label>
            <input type="number" name="ageInput" id="age" min="1" max="10" />
          </div>
          <div className="element">
            <label htmlFor="sliderInput">Slider input</label>
            <input
              type="range"
              name="sliderInput"
              id="price"
              min="50000"
              max="500000"
              step="100"
            />
            <output htmlFor="sliderInput"></output>
          </div>
          <div className="element">
            <label htmlFor="colorInput">Color input</label>
            <input type="color" name="colorInput" id="color" />
          </div>
          <div className="element">
            <fieldset>
              <legend>Legend within a fieldset</legend>
            </fieldset>
          </div>
          <div className="element">
            <label htmlFor=""></label>
          </div>
          <div className="element">
            <label htmlFor=""></label>
          </div>
        </section>

        <section className="grid-columns">
          <div className="element">
            <h3>Buttons</h3>
            <p>
              Styleguide: Capilalize only the first word in the button and
              proper nouns or abbreviations.
            </p>
          </div>
          <div className="element">
            <Button label="Click me" />
          </div>
          <div className="element">
            <Button label="Throw message - error" onClick={() => { notify({ persist: true, type: 'error', message: 'Oh no.  An error occured. What shall we do now?' }) }} />
          </div>
          <div className="element">
            <Button label="Throw message - info" onClick={() => { notify({ persist: true, type: 'info', message: 'This is to let you know we have no info.' }) }} />
          </div>
          <div className="element">
            <Button label="Throw message - success" onClick={() => { notify({ persist: true, type: 'success', message: 'success is in the eye of the beer holder.' }) }} />
          </div>
          <div className="element">
            <Button label="Throw message - warn" onClick={() => { notify({ persist: true, type: 'warn', message: 'This is just a warning... but PANIC!' }) }} />
          </div>
          <div className="element"></div>
        </section>

        <section className="grid-columns">
          <h3>Messages</h3>
          <p>
            Styleguide: Use proper sentence case for any customer facing
            messaging.
          </p>

          <div className='element'>
            <Notification type='success' message='This is the message for the success type.' persist={true} uuid='1546565465654645' />
          </div>
          <div className='element'>
            <Notification type='info' message='This is the message for the info type.' persist={true} uuid='2546565465654645' />
          </div>
          <div className='element'>
            <Notification type='warn' message='This is the message for the warn type.' persist={true} uuid='3546565465654645' />
          </div>
          <div className='element'>
            <Notification type='error' message='This is the message for the error type.' persist={true} uuid='4546565465654645' />
          </div>
        </section>
      </div>
      <section>
        <br />
      </section>
    </>
  );
};

export default Theme;
