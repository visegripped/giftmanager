import { useContext, useState } from 'react';
import { responseInterface } from '../../types/types';
import Button from '../../components/Button/Button';
import fetchData from '../../utilities/fetchData';
import postReport from '../../utilities/postReport';
import ReportingQuery from '../../components/Reporting/ReportingQuery';
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

  // Check if user is admin (userid === 1)
  const isAdmin = String(myProfile.userid) === '1';

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
      task: 'archiveRemovedItems',
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
      {isAdmin ? (
        <>
          <section>
            <h3>Database Management</h3>
            <Button
              onButtonClick={handleArchivePurchasedItemsClick}
              title="Remove all items from all lists where items are tagged as purchased"
              label="Archive purchased items"
            />
            <br />
            <Button
              onButtonClick={handleArchiveRemovedItemsClick}
              title="Archive all items from all lists where items are tagged as removed"
              label="Archive removed items"
            />
          </section>

          <section className="admin__reporting-section">
            <h3>Reporting & Analytics</h3>
            <ReportingQuery showStats={true} />
          </section>
        </>
      ) : (
        <section>
          <p>You do not have permission to access this page.</p>
        </section>
      )}
    </>
  );
};

export default Admin;
