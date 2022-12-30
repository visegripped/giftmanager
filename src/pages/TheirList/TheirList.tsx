import React, { useState } from 'react';
import SelectList from '../../components/SelectList';
import { useNotificationContext } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { ResponseProps, ItemsResponseProps, fetchData } from '../../util/fetchData';
import { getStatusChoices } from '../../util/getStatusChoices';

const updateList = (updateEvent: React.ChangeEvent<HTMLSelectElement>, itemid: string | number) => {
  const newValue = updateEvent.target.value;
  console.log('This is the updated list (This update does nothing yet): ', itemid, newValue);
};

const TheirList = () => {
  const { userId } = useParams();
  console.log(` - - - - - > userId: ${userId}`);
  const [myListOfItems, updateMyListOfItems] = useState([]);
  // Take a look at toggleDarkMode.tsx Has a useThemeContext
  const { addMessage } = useNotificationContext();
  const { tokenId } = useAuthContext();
  React.useEffect(() => {
    if (userId) {
      const cmd = 'theirListGet';
      fetchData(cmd, tokenId, {
        theirUserId: userId.toString(),
      })
        .then((response: ResponseProps) => {
          updateMyListOfItems(response.items);
        })
        .catch((error) => {
          updateMyListOfItems([]);
          addMessage({
            report: `Request to execute ${cmd} failed. \n${error}`,
            type: 'error',
          });
          throw new error();
        });
    }
  }, [userId]);

  return (
    <section className="list--container">
      <h1>Here you edit {userId}'s list.</h1>
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

export default TheirList;
