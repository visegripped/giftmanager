import React, { useState } from 'react';
import SelectList from '../../components/SelectList';
import { useNotificationContext } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';
import { ResponseProps, ItemsResponseProps, fetchData } from '../../util/fetchData';
import { getStatusChoicesForMyList } from '../../util/status';
import AddItemForm from '../../components/AddItemForm';
import './MyList.css';

const MyList = () => {
  const [myListOfItems, updateMyListOfItems] = useState([]);
  // Take a look at toggleDarkMode.tsx Has a useThemeContext
  const { addMessage } = useNotificationContext();
  const { tokenId } = useAuthContext();

  const fetchAndUpdateList = () => {
    const cmd = 'myListGet';
    const formData = new FormData();
    formData.append('tokenId', tokenId);
    formData.append('cmd', cmd);
    fetchData(cmd, tokenId)
      .then((response: ResponseProps) => {
        updateMyListOfItems(response.items);
      })
      .catch((error) => {
        addMessage({
          report: `Request to execute ${cmd} failed. \n${error}`,
          type: 'error',
        });
        throw new Error();
      });
  };

  const updateItem = (updateEvent: React.ChangeEvent<HTMLSelectElement>, itemid: number) => {
    const newValue = Number(updateEvent.target.value);
    const cmd = 'myListItemRemoveUpdate';
    if (newValue === 1 || newValue === 0) {
      fetchData(cmd, tokenId, {
        remove: newValue,
        itemid,
      })
        .then(() => {
          addMessage({
            report: `Item has been ${newValue === 1 ? 'removed' : 'unremoved'} from your list`,
            type: 'success',
          });
          fetchAndUpdateList();
        })
        .catch((error) => {
          addMessage({
            report: `Request to execute ${cmd} failed. \n${error}`,
            type: 'error',
          });
          throw new Error();
        });
    }
  };

  const handleAddingItemToList = (
    submitEvent: React.SyntheticEvent,
    formFields: { [key: string]: string | number | Blob },
  ) => {
    const cmd = 'myListItemAdd';
    fetchData(cmd, tokenId, formFields)
      .then(() => {
        addMessage({
          report: 'Item has been added to your list',
          type: 'success',
        });
        fetchAndUpdateList();
      })
      .catch((error) => {
        addMessage({
          report: `Request to execute ${cmd} failed. \n${error}`,
          type: 'error',
        });
        throw new Error();
      });
  };

  React.useEffect(() => {
    fetchAndUpdateList();
  }, []);

  return (
    <>
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
                      onChange={updateItem}
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
      <br />
      <section className="list--container">
        <h1>Add to your list:</h1>
        <AddItemForm onSubmit={handleAddingItemToList} />
      </section>
    </>
  );
};

export default MyList;
