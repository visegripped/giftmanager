import React, { useState } from 'react';
import SelectList from '../../components/SelectList';
import { useNotificationContext } from '../../context/NotificationContext';
import { useAppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { ResponseProps, ItemsResponseProps, fetchData } from '../../util/fetchData';
import { getStatusChoicesForTheirList, getPrettyStatus } from '../../util/status';
import AddItemForm from '../../components/AddItemForm';
import { getFullNameFromUserId } from '../../util/user';
import '../MyList/MyList.css';

const TheirList = () => {
  const { recipient } = useParams() || '';
  const [myListOfItems, updateMyListOfItems] = useState([]);
  // Take a look at toggleDarkMode.tsx Has a useThemeContext
  const { addMessage } = useNotificationContext();
  const { tokenId, userId, users } = useAppContext();
  const recipientsFullName = getFullNameFromUserId(recipient, users);

  const handleChangingItemStatus = (updateEvent: React.ChangeEvent<HTMLSelectElement>, itemid: string | number) => {
    const status = updateEvent.target.value;
    const cmd = 'theirListItemUpdate';
    if (recipient) {
      fetchData(cmd, tokenId, {
        status,
        recipient,
        itemid,
      })
        .then(() => {
          addMessage({
            report: `Item on ${recipientsFullName}'s list has been updated.`,
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
              report: `${recipientsFullName} has no items on their list.  Slacker.`,
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

  const handleAddingItemToList = (
    submitEvent: React.SyntheticEvent,
    formFields: { [key: string]: string | number | Blob },
  ) => {
    if (recipient) {
      // back end handles setting remove and status.
      const cmd = 'theirListItemAdd';
      const amendedFormFields = { ...formFields, recipient };

      fetchData(cmd, tokenId, amendedFormFields)
        .then(() => {
          addMessage({
            report: `Item has been added to ${recipientsFullName}'s list`,
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
        <h1>Edit {recipientsFullName}'s list.</h1>
        <table className="list--table">
          <thead>
            <tr className="list--header">
              <td>Item name</td>
              <td className="list--head_status">Status</td>
            </tr>
          </thead>
          <tbody className="list--body">
            {myListOfItems.map((item: ItemsResponseProps) => {
              const { item_name, itemid, item_desc, item_link, buy_userid, status } = item;
              const optionChoices = getStatusChoicesForTheirList(userId, item);

              return (
                <tr key={`${itemid}_${item_name}`} className="list--row">
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
                      <SelectList
                        options={optionChoices}
                        onChange={handleChangingItemStatus}
                        // the 'or blank' here will set zero to blank, which sets the 'selected' to the blank choice, which is desired.
                        // otherwise, the value of zero will set the 'unpurchase/unreserve' value as selected.
                        selected={status || ''}
                        uuid={itemid}
                      />
                    ) : (
                      <div>
                        {getPrettyStatus(status)} by {getFullNameFromUserId(buy_userid, users)}
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
        <AddItemForm onSubmit={handleAddingItemToList} />
      </section>
    </>
  );
};

export default TheirList;
