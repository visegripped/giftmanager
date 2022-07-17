import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import FormLineItem from './index';

export default {
  title: 'component/FormLineItem',
  component: FormLineItem,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof FormLineItem>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FormLineItem> = (args) => <FormLineItem {...args} />;

export const BasicUsage = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
BasicUsage.args = {
  label: 'Some form input',
  children: <textarea></textarea>,
};
