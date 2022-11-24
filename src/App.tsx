import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './components/Nav/';
import './App.css';

function App() {
  return (
    <>
      <header className="App-header">
        <div>GiftManager</div>
        <Nav cssClasses="App-header__nav" />
        <div className="App-header__login">Logged in as $user</div> {/* link this to their view */}
      </header>

      <main className="App-main">
        <Outlet />
      </main>
      <footer className="App-footer"></footer>
    </>
  );
}

export default App;
