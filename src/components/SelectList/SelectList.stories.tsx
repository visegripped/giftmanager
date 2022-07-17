
import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import SelectList from './index';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'component/SelectList',
  component: SelectList,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof SelectList>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SelectList> = (args) => <SelectList {...args} />;

export const BasicUsage = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
BasicUsage.args = {
  options : [],
  onSelect: () => {}
};
