import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

interface NavProps {
  cssClasses?: string;
}

const Nav = (props: NavProps) => {
  const { cssClasses } = props;
  const className = `${cssClasses}`;
  return (
    <nav className={className} data-testid="Nav">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/mylist">My list</Link>
        </li>
        <li className="nav-item">
          <Link to="/theirlist">Their list</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
