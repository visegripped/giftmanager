import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css';

export interface MenuItemProps {
  link: string;
  value: string;
}

interface MenuProps {
  items: MenuItemProps[];
}

const Menu = (props: MenuProps) => {
  const { items } = props;
  return (
    <menu data-testid="Menu">
      {items.map((item: MenuItemProps) => {
        const { link, value } = item;
        return (
          <li className="menu-item">
            <Link to={link}>{value}</Link>
          </li>
        );
      })}
    </menu>
  );
};

export default Menu;
