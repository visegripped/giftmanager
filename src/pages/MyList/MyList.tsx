import React, { useState } from 'react';
import SelectList from '../../components/SelectList';
// import { isTemplateSpan } from 'typescript';
import './MyList.css';

interface ItemsProps {
  itemid: number;
  item_name: string;
  item_link?: string;
  item_desc?: string;
  remove: number;
}

interface ResponseProps {
  items: [];
  type: string;
  statusText: string;
}

const updateList = (updateEvent: React.ChangeEvent<HTMLSelectElement>, itemid: string | number) => {
  const newValue = updateEvent.target.value;
  console.log('This is the updated list: ', itemid, newValue);
  if (newValue === '-1') {
    // do nothing. was set to 'no change'
  } else {
    fetch(`https://www.visegripped.com/family/api.php?cmd=myListUpdateStatus&status=${newValue}&itemid=${itemid}`)
      .then((response) => {
        return response.json();
      })
      .then((response: ResponseProps) => {
        console.log(' -> API response: ', response);
        if (response.type !== 'success') {
          throw new Error(response.statusText);
        }
        // report a successfully updated status change.
      })
      .catch((response) => {
        throw new Error(response.statusText);
        // need to log this to the server someplace.
      });
  }
};

const getStatusChoices = (itemRemoved: number) => {
  const statusChoices = [
    {
      label: 'no change',
      value: -1,
    },
  ];

  if (itemRemoved === 0) {
    statusChoices.push({
      label: 'cancelled',
      value: 1,
    });
  } else {
    statusChoices.push({
      label: 'uncancel',
      value: 0,
    });
  }

  return statusChoices;
};

const MyList = () => {
  const [myListOfItems, updateMyListOfItems] = useState([]);
  // const [myListOfItems] = useState([]);

  React.useEffect(() => {
    fetch('https://www.visegripped.com/family/api.php?cmd=myListGet')
      .then((response) => {
        return response.json();
      })
      .then((response: ResponseProps) => {
        console.log(' -> API response: ', response);
        if (response.type !== 'success') {
          throw new Error(response.statusText);
        }
        updateMyListOfItems(response.items);
      })
      .catch((response) => {
        throw new Error(response.statusText);
        // need to log this to the server someplace.
      });
  }, []);

  return (
    <section className="list--container">
      <table className="list--table">
        <thead>
          <tr className="list--header">
            <td>Item name</td>
            <td className="list--head_status">Status</td>
          </tr>
        </thead>
        <tbody className="list--body">
          {myListOfItems.map((item: ItemsProps) => {
            const { item_name, itemid, item_desc, item_link, remove } = item;
            return (
              <tr key={`${itemid}_${item_name}`}>
                <td>
                  {item_link ? (
                    <a href="${item_link}" target="_blank">
                      {item_name}
                    </a>
                  ) : (
                    item_name
                  )}
                  <div className="list--item_desc">{item_desc}</div>
                </td>
                <td className="list--body_status">
                  <SelectList
                    options={getStatusChoices(remove)}
                    onChange={updateList}
                    selected={remove}
                    uuid={itemid}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

export default MyList;
