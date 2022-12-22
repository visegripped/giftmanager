import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from './index';
import { ButtonProps } from './Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'component/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

const getButtonsByPriority = (priority: ButtonProps['priority']) => {
  const themes = ['standard', 'info', 'warn', 'error', ''];
  return (
    <>
      {themes.map((theme) => {
        return (
          <Button priority={priority} theme={theme} onClick={() => null}>
            Secondary {theme}
          </Button>
        );
      })}
    </>
  );
};

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.decorators = [
  () => {
    return getButtonsByPriority('primary');
  },
];

export const Secondary = Template.bind({});
Secondary.decorators = [
  () => {
    return getButtonsByPriority('secondary');
  },
];
export const Ghost = Template.bind({});
Ghost.decorators = [
  () => {
    return getButtonsByPriority('ghost');
  },
];

export const Disabled = Template.bind({});
Disabled.args = {
  children: <>Disabled</>,
  priority: 'primary',
  disabled: true,
};
