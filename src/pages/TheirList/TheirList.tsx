import React, { useState } from 'react';
import SelectList from '../../components/SelectList';
import { useNotificationContext } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { ResponseProps, ItemsResponseProps, fetchData } from '../../util/fetchData';
import { getStatusChoicesForTheirList, getPrettyStatus } from '../../util/status';
import AddItemForm from '../../components/AddItemForm';
import '../MyList/MyList.css';

const TheirList = () => {
  const { recipient } = useParams() || '';
  const [myListOfItems, updateMyListOfItems] = useState([]);
  // Take a look at toggleDarkMode.tsx Has a useThemeContext
  const { addMessage } = useNotificationContext();
  const { tokenId } = useAuthContext();

  const updateList = (updateEvent: React.ChangeEvent<HTMLSelectElement>, itemid: string | number) => {
    const newValue = updateEvent.target.value;
    console.log('This is the updated list (This update does nothing yet): ', itemid, newValue);

    // TODO -> this needs to update the list. :)
  };

  const fetchAndUpdateList = () => {
    const cmd = 'theirListGet';
    if (recipient) {
      fetchData(cmd, tokenId, {
        theirUserId: recipient.toString(),
      })
        .then((response: ResponseProps) => {
          if (!response.items.length) {
            addMessage({
              report: 'This user has no items on their list.  Slacker.',
              type: 'info',
            });
          } else {
            updateMyListOfItems(response.items);
          }
        })
        .catch((error) => {
          addMessage({
            report: `Request to execute ${cmd} failed. \n${error}`,
            type: 'error',
          });
          throw new error();
        });
    }
  };

  const handleFormSubmit = (
    submitEvent: React.SyntheticEvent,
    formFields: { [key: string]: string | number | Blob },
  ) => {
    if (recipient) {
      const cmd = 'theirListItemAdd';
      const amendedFormFields = { ...formFields, recipient };

      fetchData(cmd, tokenId, amendedFormFields)
        .then(() => {
          addMessage({
            report: `Item has been added to ${recipient}'s list`,
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
    } else {
      addMessage({
        report: 'No intended recipient has been set. Please select one',
        type: 'error',
      });
    }
  };

  React.useEffect(() => {
    if (recipient) {
      updateMyListOfItems([]); // blank the list out to indicate something is happening.
      fetchAndUpdateList();
    } else {
      addMessage({
        report: 'Please select a user',
        type: 'warn',
      });
    }
  }, [recipient]);

  return (
    <>
      <section className="list--container">
        <h1>Edit {recipient}'s list.</h1>
        <table className="list--table">
          <thead>
            <tr className="list--header">
              <td>Item name</td>
              <td className="list--head_status">Status</td>
            </tr>
          </thead>
          <tbody className="list--body">
            {myListOfItems.map((item: ItemsResponseProps) => {
              const { item_name, itemid, item_desc, item_link, remove, buy_userid, status } = item;
              const optionChoices = getStatusChoicesForTheirList(recipient, item);

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
                    {optionChoices.length ? (
                      <SelectList options={optionChoices} onChange={updateList} selected={remove} uuid={itemid} />
                    ) : (
                      <div>
                        {getPrettyStatus(status)} by {buy_userid}
                      </div>
                    )}
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
        <AddItemForm onSubmit={handleFormSubmit} />
      </section>
    </>
  );
};

export default TheirList;
