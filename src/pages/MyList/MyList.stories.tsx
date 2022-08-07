import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import MyList from './index';

export default {
  title: 'page/MyList',
  component: MyList,
} as ComponentMeta<typeof MyList>;

const Template: ComponentStory<typeof MyList> = (args) => (
  <BrowserRouter>
    <MyList />
  </BrowserRouter>
);

export const BasicUsage = Template.bind({});
// BasicUsage.args = {};
