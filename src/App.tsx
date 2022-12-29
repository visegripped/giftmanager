import React, { useState, useEffect } from 'react';
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
import { fetchData, ResponseProps, UserResponseProps } from './util/fetchData';
import { MenuItemProps } from './components/Menu/Menu';

function App() {
  const [dark, setDark] = useState(false);
  const [users, setUsers] = useState<MenuItemProps[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  // Need to upgrade the API for session storage to support TTL.
  // ex: https://www.sohamkamani.com/javascript/localstorage-with-ttl-expiry/
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

  useEffect(() => {
    if (tokenId) {
      /*
      get user detail of who is logged in.
      get full user list for nav++ 
      */
      const cmd = 'usersGet';
      fetchData(cmd, tokenId)
        .then((response: ResponseProps) => {
          const userList: MenuItemProps[] = response.users
            .map((user: UserResponseProps) => {
              return { link: `/theirlist?userid=${user.userid}`, value: `${user.firstName} ${user.lastName}` };
            })
            .sort((a, b) => a.value.localeCompare(b.value));
          setUsers(userList);
        })
        .catch((error) => {
          addMessage({
            report: `Request to execute ${cmd} failed. \n${error}`,
            type: 'error',
          });
        });
    }
  }, [tokenId]);
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
            {tokenId ? <Nav cssClasses="App-header__nav" users={users} /> : <></>}
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
