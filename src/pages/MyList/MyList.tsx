import React, { useState } from 'react';
import SelectList from '../../components/SelectList';
import { useNotificationContext } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';
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
  msg: string;
  statusText: string;
}

const updateList = (updateEvent: React.ChangeEvent<HTMLSelectElement>, itemid: string | number) => {
  const newValue = updateEvent.target.value;
  console.log('This is the updated list: ', itemid, newValue);
  const { addMessage } = useNotificationContext();
  const cmd = 'myListUpdateStatus';

  if (newValue === '-1') {
    // do nothing. was set to 'no change'
  } else {
    fetch(`https://www.visegripped.com/family/api.php?cmd=${cmd}&status=${newValue}&itemid=${itemid}`)
      .then((response) => {
        return response.json();
      })
      .then((response: ResponseProps) => {
        if (response.type !== 'success') {
          addMessage({
            report: response.statusText,
            type: 'error',
          });
          throw new Error(response.statusText);
        }
        addMessage({
          report: 'Successfully updated list.',
          type: 'info',
        });
      })
      .catch((response) => {
        addMessage({
          report: `Request to execute ${cmd} failed.`,
          type: 'error',
        });
        throw new Error(response.statusText);
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
  // Take a look at toggleDarkMode.tsx Has a useThemeContext
  const { addMessage } = useNotificationContext();
  const { tokenId } = useAuthContext();

  React.useEffect(() => {
    const cmd = 'myListGet';
    const formData = new FormData();
    formData.append('tokenId', tokenId);
    formData.append('cmd', cmd);

    fetch(`https://www.visegripped.com/family/api.php`, {
      body: formData,
      method: 'post',
    })
      .then((response) => {
        return response.json();
      })
      .then((response: ResponseProps) => {
        if (response.type !== 'success') {
          throw new Error(response.msg); // this throw will trigger the catch.
        }
        updateMyListOfItems(response.items);
      })
      .catch((error) => {
        addMessage({
          report: `Request to execute ${cmd} failed. \n${error}`,
          type: 'error',
        });
        throw new Error();
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
