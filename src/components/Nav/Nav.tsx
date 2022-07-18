import React from 'react';
import { Link } from 'react-router-dom';

interface NavProps {
  cssClasses?: string;
}

const Nav = (props: NavProps) => {
  const { cssClasses } = props;
  const className = `selectList ${cssClasses}`;
  return (
    <nav className={className} data-testid="Nav">
      <ul>
        <li>
          <Link to="/mylist">My list</Link>
        </li>
        <li>
          <Link to="/theirlist">Their list</Link>
        </li>
        <li>
          <Link to="/">Home</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
