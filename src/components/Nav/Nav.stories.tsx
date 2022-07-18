import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import Nav from './index';

export default {
  title: 'component/Nav',
  component: Nav,
} as ComponentMeta<typeof Nav>;

const Template: ComponentStory<typeof Nav> = (args) => (
  <BrowserRouter>
    <Nav {...args} />
  </BrowserRouter>
);

export const BasicUsage = Template.bind({});
BasicUsage.args = {
  cssClasses: 'test',
};
