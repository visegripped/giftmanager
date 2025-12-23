import React, { useState, useEffect, useContext } from 'react';
import { Modal } from '../Modal/Modal';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import {
  ItemType,
  responseInterface,
  itemStatusInterface,
} from '../../types/types';
import fetchData from '../../utilities/fetchData';
import postReport from '../../utilities/postReport';
import './ReservedPurchasedItemsModal.css';

export interface ReservedPurchasedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  myUserid: string | number;
}

/**
 * Modal component that displays items from other users that the current user has reserved or purchased
 */
export const ReservedPurchasedItemsModal = React.memo(
  (props: ReservedPurchasedItemsModalProps) => {
    const { isOpen, onClose, myUserid } = props;
    const { addNotification } = useContext(
      NotificationsContext
    ) as NotificationContextProps;

    const [items, setItems] = useState<ItemType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = () => {
      if (!myUserid) return;

      setLoading(true);
      setError(null);

      const response = fetchData({
        task: 'getMyReservedPurchasedItems',
        myuserid: myUserid,
      });

      response &&
        response.then((data: responseInterface) => {
          setLoading(false);
          if (data.error) {
            postReport({
              type: 'error',
              report: 'Unable to fetch reserved/purchased items',
              body: {
                error: data.error,
                file: 'ReservedPurchasedItemsModal',
                origin: 'apiResponse',
              },
            });
            addNotification({
              message: `Something has gone wrong fetching your reserved/purchased items.
              Try refreshing the page.
              If the error persists, reach out to the site administrator`,
              type: 'error',
            });
            setError(data.error);
          } else {
            const fetchedItems = (data.success as ItemType[]) || [];
            // Filter out items with status "no change" or null
            const filteredItems = fetchedItems.filter(
              (item) => item.status && item.status !== 'no change'
            );
            setItems(filteredItems);
          }
        });
    };

    useEffect(() => {
      if (isOpen && myUserid) {
        fetchItems();
      }
    }, [isOpen, myUserid]);

    const handleStatusChange = (
      itemid: string | number,
      theiruserid: string | number,
      status: itemStatusInterface | 'no change'
    ) => {
      const response = fetchData({
        task: 'updateStatusForTheirItem',
        itemid,
        status: status as string,
        myuserid: myUserid,
        theiruserid: theiruserid,
        groupid: '1',
      });

      response &&
        response.then((data: responseInterface) => {
          if (data.error) {
            postReport({
              type: 'error',
              report: 'Unable to update item status',
              body: {
                error: data.error,
                file: 'ReservedPurchasedItemsModal',
                origin: 'apiResponse',
              },
            });
            addNotification({
              message: `Something has gone wrong updating the item status.
              Try refreshing the page.
              If the error persists, reach out to the site administrator`,
              type: 'error',
            });
          } else {
            // Refresh the list after update
            fetchItems();
          }
        });
    };

    const handleSelectChange = (
      item: ItemType,
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const newStatus = event.target.value;
      if (newStatus === 'no change') {
        // Update to "no change" which will remove it from the list
        handleStatusChange(item.itemid, item.userid, 'no change');
      } else {
        handleStatusChange(
          item.itemid,
          item.userid,
          newStatus as itemStatusInterface
        );
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="View Reserved/Purchased Items"
      >
        {loading && (
          <div className="reserved-purchased-modal__loading">Loading...</div>
        )}
        {error && (
          <div className="reserved-purchased-modal__error">
            Error: {error}. Please try again.
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="reserved-purchased-modal__empty">
            You have no reserved or purchased items from other users.
          </div>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="reserved-purchased-modal__list">
            <table className="reserved-purchased-modal__table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.itemid}>
                    <td>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td>{item.owner_name || 'Unknown'}</td>
                    <td>
                      <select
                        value={item.status || 'no change'}
                        onChange={(e) => handleSelectChange(item, e)}
                        className="reserved-purchased-modal__select"
                      >
                        <option value="no change">No change/reset</option>
                        <option value="reserved">Reserved</option>
                        <option value="purchased">Purchased</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    );
  }
);

ReservedPurchasedItemsModal.displayName = 'ReservedPurchasedItemsModal';

export default ReservedPurchasedItemsModal;
