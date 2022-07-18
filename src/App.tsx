import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './components/Nav/';
import './App.css';

function App() {
  return (
    <>
      <header className="App-header">
        <div>Logged in as $user</div> {/* link this to their view */}
        <Nav cssClasses="" />
      </header>
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </>
  );
}

export default App;
