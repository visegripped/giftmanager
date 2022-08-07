import React, { useState, useEffect } from 'react';
// import { isTemplateSpan } from 'typescript';

interface ItemsProps {
  itemid: number;
  item_name: string;
  item_link?: string;
  item_desc?: string;
  remove: number;
}

interface ItemProps {
  items: ItemsProps[];
}

const [myListOfItems, setValue] = useState([]);

// const handleItemStatusChange = (changeEvent: React.ChangeEvent, props: ItemsProps) => {
//   console.log(' -> handleItemStatusChange triggered.');
//   // API request to update status on item.
// }

const MyList = () => {
  React.useEffect(() => {
    // Update the document title using the browser API
    console.log(` -> Items.length: ${myListOfItems.length}`);
  });

  return (
    <section>
      <div className="list--header">
        <div>Item</div>
        <div>Status</div>
      </div>
      <div className="list--body">
        {myListOfItems.map((item: ItemsProps) => {
          const { item_name } = item;
          return <div>{item_name}</div>;
        })}
      </div>
    </section>
  );
};

export default MyList;
