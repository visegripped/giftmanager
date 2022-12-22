import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from './index';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'component/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  text: 'Primary button',
  priority: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  text: 'Secondary button',
  priority: 'secondary',
};

export const Ghost = Template.bind({});
Ghost.args = {
  text: 'Ghost button',
  priority: 'ghost',
};

export const Disabled = Template.bind({});
Disabled.args = {
  text: 'Disabled button',
  priority: 'primary',
  disabled: true,
};

export const Error = Template.bind({});
Disabled.args = {
  text: 'Error button',
  priority: 'error',
  disabled: false,
};
