import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import AddItemForm from './index';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'component/AddItemForm',
  component: AddItemForm,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof AddItemForm>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AddItemForm> = (args) => <AddItemForm {...args} />;

export const BasicUsage = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
BasicUsage.args = {
  onSubmit: (event: object) => {
    console.log(' Form submitted ');
  },
};

// export const UserList = Template.bind({});
// // More on args: https://storybook.js.org/docs/react/writing-stories/args
// BasicUsage.args = {
//   options: userListResponse.users,
//   onChange: (event: object, props: object) => {
//     console.log(' -> props: ', props);
//   },
// };
