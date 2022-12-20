import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ToggleDarkMode from './index';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'component/ToggleDarkMode',
  component: ToggleDarkMode,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof ToggleDarkMode>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ToggleDarkMode> = (args) => <ToggleDarkMode />;

export const BasicUsage = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
BasicUsage.args = {
  options: [
    { value: 'someting', label: 'something' },
    { value: 'sometingElse', label: 'something else' },
    { value: 'sometingMore', label: 'something more' },
  ],
  onChange: (event: object, uuid: string | number) => {
    console.log(' -> uuid: ', uuid);
  },
};
