import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import postReport from '../../utilities/postReport';
import fetchData from '../../utilities/fetchData';
import Me from '../Me/Me';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import {
  ProfileContext,
  ProfileContextInterface,
} from '../../context/ProfileContext';
import {
  UserType,
  ItemType,
  itemStatusInterface,
  responseInterface,
} from '../../types/types';
import AddItemForm from '../../components/AddItemForm/AddItemForm';
import DeliveryDateModal from '../../components/DeliveryDateModal/DeliveryDateModal';
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import './User.css';

type theirItemListInterface = {
  theirItemList: ItemType[];
  myUserid: string;
  theirUserid: string;
  fetchTheirItemList: (a?: string) => void;
};

type tableDataInterface = {
  data: ItemType;
};

const Link = (props: { link: string; name: string }) => {
  const { link = '', name = '' } = props;
  return (
    <a href={link} target="_blank">
      {name}
    </a>
  );
};

export const dropdownShouldBeDisabled = (
  addedByUserId: number,
  userId: number,
  myUserId: number,
  status: string | null,
  statusUserId: number
) => {
  if (addedByUserId !== userId) {
    return true; /* items was added to list by another user. Should always be purchased and unchangeable */
  }
  if (status !== 'no change' && statusUserId !== myUserId) {
    return true; /* item is reserved or purchased by another user.  */
  }
  return false;
};

const linkedName = (props: tableDataInterface) => {
  //@ts-ignore
  return props.data.link ? <Link {...props.data} /> : props.data.name;
};

const Table = (
  props: theirItemListInterface & { theirUserProfile: UserType }
) => {
  const {
    theirItemList,
    theirUserid,
    myUserid,
    fetchTheirItemList,
    theirUserProfile,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    itemid: string | number;
    status: itemStatusInterface;
    itemName: string;
  } | null>(null);

  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;

  const onSelectChange = (
    itemid: string | number,
    status: itemStatusInterface
  ) => {
    // If status is "purchased", show modal first
    if (status === 'purchased') {
      const item = theirItemList.find((i) => i.itemid === itemid);
      setPendingStatusUpdate({
        itemid,
        status,
        itemName: item?.name || 'Item',
      });
      setIsModalOpen(true);
    } else {
      // For other statuses (like "reserved"), proceed immediately
      updateStatusForTheirItem(itemid, status);
    }
  };

  const updateStatusForTheirItem = (
    itemid: string | number,
    status: itemStatusInterface,
    dateReceived?: string
  ) => {
    const requestConfig: any = {
      task: 'updateStatusForTheirItem',
      itemid,
      status,
      myuserid: myUserid,
      theiruserid: theirUserid,
      groupid: '1',
    };

    // Add date_received if status is purchased
    if (status === 'purchased' && dateReceived) {
      requestConfig.date_received = dateReceived;
    }

    const response = fetchData(requestConfig);
    response &&
      response.then((data: responseInterface) => {
        if (data.error) {
          postReport({
            type: 'error',
            report: 'Unable to remove/re-add item from item list',
            body: {
              error: data.error,
              file: 'User',
              origin: 'apiResponse',
            },
          });
          addNotification({
            message: `Something has gone wrong with removing the item from your list.
            Try refreshing the page.
            If the error persists, reach out to the site administrator`,
            type: 'error',
          });
        } else {
          fetchTheirItemList(theirUserid);
        }
      });
    return response;
  };

  const handleDateConfirm = (date: string) => {
    if (pendingStatusUpdate) {
      updateStatusForTheirItem(
        pendingStatusUpdate.itemid,
        pendingStatusUpdate.status,
        date
      );
      setPendingStatusUpdate(null);
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingStatusUpdate(null);
  };

  const StatusDD = (props: { data: ItemType }) => {
    const {
      itemid,
      status,
      userid,
      added_by_userid,
      status_userid,
      status_username,
    } = props.data;

    return (
      <>
        <select
          defaultValue={status as string}
          disabled={dropdownShouldBeDisabled(
            added_by_userid,
            userid,
            Number(myUserid),
            status,
            status_userid
          )}
          onChange={(event) => {
            const status = event.target.value;
            onSelectChange(itemid, status as itemStatusInterface);
          }}
        >
          <option value="no change">No change/reset</option>
          <option value="reserved">
            Reserved {status_username ? ` by ${status_username}` : ''}
          </option>
          <option value="purchased">
            Purchased
            {status_username ? ` by ${status_username}` : ''}
          </option>
        </select>
      </>
    );
  };

  const [colDefs] = useState([
    {
      field: 'name',
      sortable: true,
      cellRenderer: linkedName,
      sort: 'asc',
      wrapText: true,
      autoHeight: true,
    },
    { field: 'description', wrapText: true, autoHeight: true, flex: 1 },
    {
      field: 'removed',
      cellRenderer: StatusDD,
      headerName: 'Actions',
      width: 300,
    },
  ]);

  const rowClassRules = {
    'row-removed': 'data.removed >= 1',
  };

  return (
    <>
      <AgGridReact
        rowData={theirItemList}
        // @ts-ignore
        columnDefs={colDefs}
        rowClassRules={rowClassRules}
        style={{ width: '100%', height: '100%' }}
      />
      {isModalOpen && pendingStatusUpdate && (
        <DeliveryDateModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleDateConfirm}
          itemName={pendingStatusUpdate.itemName}
          birthdayMonth={theirUserProfile?.birthday_month || null}
          birthdayDay={theirUserProfile?.birthday_day || null}
        />
      )}
    </>
  );
};

const PageContent = () => {
  let { userid: theirUserid } = useParams() || '';
  const emptyUserProfile = {
    userid: '',
    firstname: '',
    lastname: '',
    groupid: '',
    created: '',
    email: '',
    avatar: '',
  };
  const { myProfile } = useContext(ProfileContext) as ProfileContextInterface;
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;

  const [myUserid, setMyUserid] = useState(myProfile.userid || '');
  const [theirUserProfile, setTheirUserProfile] =
    useState<UserType>(emptyUserProfile);
  const [theirItemList, setTheirItemList] = useState<ItemType[]>([]);

  const fetchTheirUserProfile = (theirUserid: string) => {
    if (theirUserid) {
      const response = fetchData({
        task: 'getUserProfileByUserId',
        userid: theirUserid,
      });
      response &&
        response.then((data: responseInterface) => {
          if (data.error) {
            postReport({
              type: 'error',
              report: 'Unable to fetch user profile',
              body: {
                error: data.error,
                origin: 'apiResponse',
                file: 'User',
              },
            });
            addNotification({
              message: `Something has gone wrong getting this user's profile.
            Try refreshing the page.
            If the error persists, reach out to the site administrator`,
              type: 'error',
            });
          } else {
            const up =
              data.success && data.success[0]
                ? data.success[0]
                : emptyUserProfile;
            setTheirUserProfile(up as UserType);
          }
        });
    }
  };

  const fetchTheirItemList = (theirUserid: string = '') => {
    if (theirUserid) {
      const response = fetchData({
        task: 'getTheirItemList',
        theiruserid: theirUserid,
      });
      response &&
        response.then((data: responseInterface) => {
          if (data.error) {
            postReport({
              type: 'error',
              report: `Unable to fetch item list`,
              body: {
                error: data.error,
                file: 'User',
                origin: 'apiResponse',
              },
            });
            addNotification({
              message: `Something has gone wrong getting this user's profile.
            Try refreshing the page.
            If the error persists, reach out to the site administrator`,
              type: 'error',
            });
          } else {
            setTheirItemList(data.success as []);
          }
        });
    } else {
      postReport({
        type: 'error',
        report: `Unable to fetch item list`,
        body: {
          error: 'no userid was passed in to fetchTheirItemList',
          file: 'User',
          origin: 'apiResponse',
        },
      });
      addNotification({
        message: `Something has gone wrong getting this user's profile.
            Try refreshing the page.
            If the error persists, reach out to the site administrator`,
        type: 'error',
      });
    }
  };

  const onSubmit = (
    name: string,
    description: string = '',
    link: string = ''
  ) => {
    const response = fetchData({
      task: 'addItemToTheirList',
      groupid: '1',
      myuserid: myUserid,
      theiruserid: theirUserid,
      name,
      description,
      link,
    });
    response &&
      response.then((data: responseInterface) => {
        if (data.error) {
          postReport({
            type: 'error',
            report: 'Unable to add item to users list',
            body: {
              error: data.error,
              file: 'User',
              origin: 'apiResponse',
            },
          });
          addNotification({
            message: `Something has gone wrong with adding an item to this users list.
            Try refreshing the page.
            If the error persists, reach out to the site administrator`,
            type: 'error',
          });
        } else {
          fetchTheirItemList(theirUserid);
        }
      });
    return response;
  };

  useEffect(() => {
    if (!myUserid && myProfile.userid) {
      setMyUserid(myProfile.userid);
    }
  }, [myProfile.userid]);

  useEffect(() => {
    console.log(`User useEffect detected a userId change to ${theirUserid}`);
    if (theirUserid) {
      fetchTheirUserProfile(theirUserid);
    }
    if (theirUserid) {
      fetchTheirItemList(theirUserid);
    }
  }, [theirUserid]);

  return (
    <>
      {myUserid == theirUserid ? (
        <Me />
      ) : (
        <>
          <h2>
            Welcome to {theirUserProfile?.firstname}{' '}
            {theirUserProfile?.lastname}'s list
          </h2>
          <section className="table-container ag-theme-quartz responsive-grid-container responsive-grid-columns responsive-grid-sidebar">
            <AddItemForm
              legendText={`Add to  ${theirUserProfile?.firstname}'s list`}
              onAddItemFormSubmit={onSubmit}
            />
            <>
              {theirItemList?.length && myUserid ? (
                <Table
                  fetchTheirItemList={fetchTheirItemList}
                  theirItemList={theirItemList}
                  myUserid={myUserid}
                  theirUserid={theirUserid || ''}
                  theirUserProfile={theirUserProfile}
                />
              ) : (
                <h3>
                  There are no items in {theirUserProfile?.firstname}'s list.{' '}
                </h3>
              )}
            </>
          </section>
        </>
      )}
    </>
  );
};

export default PageContent;
