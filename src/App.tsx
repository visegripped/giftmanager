import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './components/Nav/';
import { NotificationContext, IMessage } from './context/NotificationContext';
import ThemeContext from './context/ThemeContext';
import AuthContext, { IAuthUpdate } from './context/AuthContext';
import Notifications from './components/Notifications';
import './App.css';
import ToggleDarkMode from './components/ToggleDarkMode';
import AuthButton from './components/AuthButton';
import { v4 as getUUID } from 'uuid';

function App() {
  const [dark, setDark] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const tokenId = sessionStorage.getItem('tokenId') || '';
  const userId = sessionStorage.getItem('userId') || '';
  const [Auth, setAuth] = useState({
    tokenId,
    userId,
  });

  const toggleDark = () => {
    setDark(!dark);
  };
  const addMessage = (message: IMessage) => {
    message.id = getUUID();
    const updatedMessages = [...messages]; // clone and push or the state change doesn't work right.
    updatedMessages.push(message);
    setMessages(updatedMessages);
  };

  const removeMessage = (id: string) => {
    const reducedMessages = messages.filter((el) => el.id !== id);
    setMessages(reducedMessages);
  };

  const updateAuth = (valObj: IAuthUpdate) => {
    const updatedAuth = {
      ...Auth,
      ...valObj,
    };
    setAuth(updatedAuth);
  };

  return (
    <div className={`App-container ${dark ? 'dark' : 'none'}`}>
      <NotificationContext.Provider
        value={{
          messages,
          addMessage,
          removeMessage,
        }}
      >
        <AuthContext.Provider
          value={{
            tokenId,
            userId,
            setAuth: updateAuth,
          }}
        >
          <header className="App-header">
            <div>GiftManager</div>
            {tokenId ? <Nav cssClasses="App-header__nav" /> : <></>}
            <div className="App-header__login">
              <AuthButton />
            </div>{' '}
            {/* link this to their view */}
          </header>

          <main className="App-main">
            <Notifications />
            {tokenId ? (
              <Outlet />
            ) : (
              <>
                <h1>Welcome. Please log in to continue</h1>
                <br />
                <AuthButton />
              </>
            )}
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
        </AuthContext.Provider>
      </NotificationContext.Provider>
    </div>
  );
}

export default App;
