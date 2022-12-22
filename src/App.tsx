import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './components/Nav/';
import { NotificationContext, IMessage } from './context/NotificationContext';
import Notifications from './components/Notifications';
import './App.css';
import ThemeContext from './context/ThemeContext';
import ToggleDarkMode from './components/ToggleDarkMode';
import { v4 as getUUID } from 'uuid';

function App() {
  const [dark, setDark] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const toggleDark = () => {
    setDark(!dark);
  };
  const addMessage = (message: IMessage) => {
    console.log(' -> addMessage was triggered', message);
    message.id = getUUID();
    messages.push(message);
    console.log(' -> message: ', message);
    setMessages(messages);
  };

  return (
    <div className={`App-container ${dark ? 'dark' : 'none'}`}>
      <NotificationContext.Provider
        value={{
          messages,
          addMessage,
        }}
      >
        <header className="App-header">
          <div>GiftManager</div>
          <Nav cssClasses="App-header__nav" />
          <div className="App-header__login">Logged in as $user</div> {/* link this to their view */}
        </header>

        <main className="App-main">
          <Notifications />
          <Outlet />
        </main>
        <ThemeContext.Provider
          value={{
            dark,
            toggleDark,
          }}
        >
          <footer className="App-footer">
            <ToggleDarkMode />
          </footer>
        </ThemeContext.Provider>
      </NotificationContext.Provider>
    </div>
  );
}

export default App;
