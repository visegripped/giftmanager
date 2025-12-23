import React, { useState, useEffect, useContext, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Modal } from '../Modal/Modal';
import Button from '../Button/Button';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import { ItemType, responseInterface } from '../../types/types';
import fetchData from '../../utilities/fetchData';
import postReport from '../../utilities/postReport';
import './PrintListModal.css';

export interface PrintListModalProps {
  isOpen: boolean;
  onClose: () => void;
  myUserid: string | number;
}

/**
 * Modal component that displays purchased items in a print-friendly format
 */
export const PrintListModal = React.memo((props: PrintListModalProps) => {
  const { isOpen, onClose, myUserid } = props;
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;

  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'My Purchased Items List',
  });

  const fetchItems = () => {
    if (!myUserid) return;

    setLoading(true);
    setError(null);

    const response = fetchData({
      task: 'getMyItemList',
      myuserid: myUserid,
    });

    response &&
      response.then((data: responseInterface) => {
        setLoading(false);
        if (data.error) {
          postReport({
            type: 'error',
            report: 'Unable to fetch item list for printing',
            body: {
              error: data.error,
              file: 'PrintListModal',
              origin: 'apiResponse',
            },
          });
          addNotification({
            message: `Something has gone wrong fetching your item list.
            Try refreshing the page.
            If the error persists, reach out to the site administrator`,
            type: 'error',
          });
          setError(data.error);
        } else {
          const fetchedItems = (data.success as ItemType[]) || [];
          // Filter to only show purchased items (not reserved)
          const purchasedItems = fetchedItems.filter(
            (item) => item.status === 'purchased'
          );
          setItems(purchasedItems);
        }
      });
  };

  useEffect(() => {
    if (isOpen && myUserid) {
      fetchItems();
    }
  }, [isOpen, myUserid]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print My List">
      {loading && <div className="print-list-modal__loading">Loading...</div>}
      {error && (
        <div className="print-list-modal__error">
          Error: {error}. Please try again.
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="print-list-modal__empty">
          You have no purchased items to print.
        </div>
      )}
      {!loading && !error && items.length > 0 && (
        <>
          <div className="print-list-modal__actions">
            <Button
              label="Print"
              onButtonClick={handlePrint}
              title="Print this list"
            />
          </div>
          <div ref={printRef} className="print-list-modal__content">
            <h2 className="print-list-modal__print-title">
              My Purchased Items
            </h2>
            <ul className="print-list-modal__list">
              {items.map((item) => (
                <li key={item.itemid} className="print-list-modal__item">
                  <div className="print-list-modal__item-name">{item.name}</div>
                  {item.description && (
                    <div className="print-list-modal__item-description">
                      {item.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Modal>
  );
});

PrintListModal.displayName = 'PrintListModal';

export default PrintListModal;
