import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Notifications from './index';
// import { IMessage } from '../../context/NotificationContext';

// const sampleMessages: IMessage[] = ;

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'component/Notifications',
  component: Notifications,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof Notifications>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Notifications> = () => <Notifications />;

export const BasicUsage = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
BasicUsage.args = {
  messages: [
    // { id: '1234-abcd-error', type: 'error', report: 'this is an error notification.' },
  ],
};
