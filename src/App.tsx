import React, { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './components/Nav/';
import { NotificationProvider, NotificationContext, IMessage } from './context/NotificationContext';
import './App.css';
import ThemeContext from './context/ThemeContext';
import ToggleDarkMode from './components/ToggleDarkMode';

function App() {
  const { messages } = useContext(NotificationContext);
  const [dark, setDark] = useState(false);
  const toggleDark = () => {
    setDark(!dark);
  };

  useEffect(() => {
    console.log(' -> messages: ', messages);
  }, [messages]);
  return (
    <div className={`App-container ${dark ? 'dark' : 'none'}`}>
      <NotificationProvider>
        <header className="App-header">
          <div>GiftManager</div>
          <Nav cssClasses="App-header__nav" />
          <div className="App-header__login">Logged in as $user</div> {/* link this to their view */}
        </header>

        <main className="App-main">
          <div>
            {messages.map((message: IMessage) => {
              console.log(' -> found at least 1 message');
              return <div>{message.report}</div>;
            })}
          </div>
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
      </NotificationProvider>
    </div>
  );
}

export default App;
