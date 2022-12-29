import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';
import Menu from '../Menu';
import { MenuItemProps } from '../Menu/Menu';

interface NavProps {
  users: MenuItemProps[];
  cssClasses?: string;
}

const Nav = (props: NavProps) => {
  const { cssClasses, users } = props;
  const className = `${cssClasses}`;
  return (
    <nav className={className} data-testid="Nav">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/mylist">My list</Link>
        </li>
        <li className="nav-item">
          <Link to="/theirlist">Their list</Link>
          <Menu items={users} />
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
