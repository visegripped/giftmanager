// import React, { ReactComponent } from 'react';
import './Icon.css';
import Delete from '@assets/icon-delete.svg?react'; //https://aronschueler.de/blog/2024/04/25/fix-no-exported-member-'reactcomponent'-when-importing-svg-in-react-and-vite/
// import iconEdit from '@assets/icon-edit.svg';
// import iconPlus from '@assets/icon-plus.svg';
// import iconClose from '@assets/icon-close.svg';

export interface IconProps {
  icon: 'delete' | 'edit' | 'plus' | 'close';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  title?: string;
}
//https://blog.logrocket.com/how-to-use-svgs-react/
// export const capitalizeFirstLetter = (word: string = '') => {
//   return word.charAt(0).toUpperCase() + word.slice(1)
// }

/**
 * Primary UI component for user interaction
 * https://blog.logrocket.com/how-to-use-svgs-react/
 */
export const Icon = ({
  size = 'medium',
  color = '#666',
  icon,
  title = '',
}: IconProps) => {
  console.log('stuff', icon, size, color, title);
  return <Delete />;
};

export default Icon;
