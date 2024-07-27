// import { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
// import Button from '@components/Button';
import routeConstants from '@routes/routeContstants';
import { Me, User, Error404 } from '@pages/';
import present from './assets/present-optimized.svg';

function App() {
  let currentDate = new Date();

  return (
    <Router>
      <header>
        <h1 className="logo">
          <img src={present} className="logo" alt="Vite logo" />{' '}
          <Link to={routeConstants.ME}>GiftManager</Link>
        </h1>

        <nav className="navbar">
          <Link to={routeConstants.USER}>user</Link> chooser
        </nav>

        <div className="auth">login to go here</div>
      </header>

      <main>
        <Routes>
          <Route path={routeConstants.HOME} Component={Me} />
          <Route path={routeConstants.ME} Component={Me} />
          <Route path={routeConstants.USER} Component={User} />
          <Route path={`${routeConstants.User}/:userId`} Component={User} />
          <Route Component={Error404} />
        </Routes>
      </main>

      <footer>
        <div>
          &copy; Copyright 2018 - {currentDate.getFullYear()}. All rights
          reserved.
        </div>
        <div>theme. This will need a chooser.</div>
      </footer>
    </Router>
  );
}

export default App;
