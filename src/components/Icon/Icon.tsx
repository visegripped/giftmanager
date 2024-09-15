import './Icon.css';
import IconDelete from '../../assets/icon-delete.svg';
import IconEdit from '../../assets/icon-edit.svg';
import IconPlus from '../../assets/icon-plus.svg';
import IconClose from '../../assets/icon-close.svg';

export type SupportedIcons = 'delete' | 'edit' | 'plus' | 'close';

export interface IconProps {
  icon: SupportedIcons;
  title?: string;
}

export const Icon = (props: IconProps) => {
  const { icon, title } = props;
  const icons = {
    delete: <IconDelete />,
    edit: <IconEdit />,
    plus: <IconPlus />,
    close: <IconClose />,
  };
  return (
    <span className={`icon`} title={title}>
      {icons[icon]}
    </span>
  );
};

export default Icon;
