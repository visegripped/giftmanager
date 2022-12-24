import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Message } from './Notifications';

export default {
  title: 'component/Message',
  component: Message,
} as ComponentMeta<typeof Message>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Message> = (args) => <Message {...args} />;

export const BasicUsage = Template.bind({});
BasicUsage.decorators = [
  () => {
    return (
      <>
        <Message type="info" report="This is an example of the info message." />
        <Message type="standard" report="This is an example of the standard message." />
        <Message type="error" report="This is an example of the error message." />
        <Message type="warn" report="This is an example of the warn message." />
        <Message type="success" report="This is an example of the success message." />
      </>
    );
  },
];

// export const DarkUsage = Template.bind({});
// DarkUsage.decorators = [
//   () => {
//     return <div className='dark'>
//       <Message type='info' report='This is an example of the info message.' />
//       <Message type='standard' report='This is an example of the standard message.' />
//       <Message type='error' report='This is an example of the error message.' />
//       <Message type='warn' report='This is an example of the warn message.' />
//       <Message type='success' report='This is an example of the success message.' />
//     </div>
//   }
// ]
