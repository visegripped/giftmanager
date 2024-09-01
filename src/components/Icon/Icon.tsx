// import React, { ReactComponent } from 'react';
import './Icon.css';
import IconDelete from '@assets/icon-delete.svg'; //https://aronschueler.de/blog/2024/04/25/fix-no-exported-member-'reactcomponent'-when-importing-svg-in-react-and-vite/
import IconEdit from '@assets/icon-edit.svg';
import IconPlus from '@assets/icon-plus.svg';
import IconClose from '@assets/icon-close.svg';

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
export const Icon = (props: IconProps) => {
  const { icon } = props;
  const icons = {
    delete: <IconDelete {...props} />,
    edit: <IconEdit {...props} />,
    plus: <IconPlus {...props} />,
    close: <IconClose {...props} />,
  }
  return icons[icon];
};

export default Icon;
