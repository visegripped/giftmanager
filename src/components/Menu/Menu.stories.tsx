import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import Menu from './index';

export default {
  title: 'component/Menu',
  component: Menu,
} as ComponentMeta<typeof Menu>;

const Template: ComponentStory<typeof Menu> = (args) => (
  <BrowserRouter>
    <Menu {...args} />
  </BrowserRouter>
);

export const BasicUsage = Template.bind({});
BasicUsage.args = {
  items: [
    {
      link: '#nowhere',
      value: 'something',
    },
    {
      link: '#nowhere',
      value: 'something else',
    },
  ],
};
