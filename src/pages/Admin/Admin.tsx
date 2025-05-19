import { useContext, useState } from 'react';
import { responseInterface } from '../../types/types';
import Button from '../../components/Button/Button';
import fetchData from '../../utilities/fetchData';
import postReport from '../../utilities/postReport';
import {
  ProfileContext,
  ProfileContextInterface,
} from '../../context/ProfileContext';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import './Admin.css';

const Admin = () => {
  const { myProfile } = useContext(ProfileContext) as ProfileContextInterface;

  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;

  const [myUserid] = useState(myProfile.userid || '');
  // TODO -> Refactor this so shared code is not duplicated
  const handleArchivePurchasedItemsClick = () => {
    const response = fetchData({
      task: 'archivePurchasedItems',
      myuserid: myUserid,
    });
    response &&
      response.then((data: responseInterface) => {
        if (data.error) {
          postReport({
            type: 'error',
            report: 'Failure executing fetchData for archivePurchasedItems',
            body: {
              error: data.error,
              file: 'Admin',
              // task: 'archivePurchasedItems', <- this may be a better way to do this
              origin: 'apiResponse',
            },
          });
          addNotification({
            message: `Something went wrong: ${data.error}`,
            type: 'error',
            persist: true,
          });
        } else {
          addNotification({
            message: (data.success as string) || (data.warn as string),
            type: 'success',
          });
        }
      });
  };
  const handleArchiveRemovedItemsClick = () => {
    const response = fetchData({
      task: 'archivePurchasedItems',
      myuserid: myUserid,
    });
    response &&
      response.then((data: responseInterface) => {
        if (data.error) {
          postReport({
            type: 'error',
            report: 'Failure executing fetchData for archiveRemovedItems',
            body: {
              error: data.error,
              file: 'Admin',
              // task: 'archiveRemovedItems', <- this may be a better way to do this
              origin: 'apiResponse',
            },
          });
          addNotification({
            message: `Something went wrong: ${data.error}`,
            type: 'error',
            persist: true,
          });
        } else {
          addNotification({
            message: (data.success as string) || (data.warn as string),
            type: 'success',
          });
        }
      });
  };

  return (
    <>
      <div className="element">
        <h2>Administration</h2>
      </div>
      <section>
        <Button
          onButtonClick={handleArchivePurchasedItemsClick}
          title="Remove all items from all lists where items are tagged as purchased"
          label="Archive purchased items"
        />
        <br />
        <Button
          onButtonClick={handleArchiveRemovedItemsClick}
          title="Remove all items from all lists where items are tagged as purchased"
          label="Archive removed items"
        />
      </section>
    </>
  );
};

export default Admin;
