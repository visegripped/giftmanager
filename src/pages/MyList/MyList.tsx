import React, { useState } from 'react';
import SelectList from '../../components/SelectList';
import { useNotificationContext } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';
import { ResponseProps, ItemsResponseProps } from '../../util/fetchData';
import { getStatusChoicesForMyList } from '../../util/status';
import './MyList.css';

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
      <h1>Edit your list:</h1>
      <table className="list--table">
        <thead>
          <tr className="list--header">
            <td>Item name</td>
            <td className="list--head_status">Status</td>
          </tr>
        </thead>
        <tbody className="list--body">
          {myListOfItems.map((item: ItemsResponseProps) => {
            const { item_name, itemid, item_desc, item_link, remove } = item;
            return (
              <tr key={`${itemid}_${item_name}`} className={remove === 1 ? 'list--row-removed' : 'list--row'}>
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
                    options={getStatusChoicesForMyList(remove)}
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
