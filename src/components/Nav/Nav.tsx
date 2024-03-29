import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';
import Menu from '../Menu';
import { useAppContext } from '../../context/AppContext';
import { userListToMenuFormat } from '../../util/user';

interface NavProps {
  cssClasses?: string;
}

const Nav = (props: NavProps) => {
  const { cssClasses } = props;
  const [userMenuIsVisible, setUserMenuIsVisible] = useState(false);
  const { users } = useAppContext();
  const className = `${cssClasses}`;
  const toggleMenuVisibility = () => {
    setUserMenuIsVisible(false);
  };
  const handleUserClick = (clickEvent: React.MouseEvent<HTMLAnchorElement>) => {
    clickEvent.preventDefault();
    setUserMenuIsVisible(!userMenuIsVisible);
  };

  React.useEffect(() => {
    if (userMenuIsVisible) {
      // if the event is bound immediately, it gets triggered by the same click that activates the menu.
      setTimeout(() => {
        window.addEventListener('click', toggleMenuVisibility);
      }, 500);
      return () => window.removeEventListener('click', toggleMenuVisibility);
    }
  }, [userMenuIsVisible]);

  return (
    <nav className={className} data-testid="Nav">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/mylist">My list</Link>
        </li>
        <li className="nav-item">
          <Link to="/theirlist" onClick={handleUserClick}>
            Their list
          </Link>
          <div className={`nav-menu-container nav-menu-container--${userMenuIsVisible ? 'visible' : 'hidden'}`}>
            <Menu items={userListToMenuFormat(users)} />
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
