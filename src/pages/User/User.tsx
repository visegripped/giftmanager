import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import postReport from '../../utilities/postReport';
import fetchData from '../../utilities/fetchData';
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

const linkedName = (props: tableDataInterface) => {
  //@ts-ignore
  return <Link {...props.data} />;
};

const Table = (props: theirItemListInterface) => {
  const { theirItemList, theirUserid, myUserid, fetchTheirItemList } = props;
  const [statusSelectValue, setStatusSelectValue] = useState('no change');
  const onSelectChange = (
    itemid: string | number,
    status: itemStatusInterface
  ) => {
    updateStatusForTheirItem(itemid, status);
  };
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  const updateStatusForTheirItem = (
    itemid: string | number,
    status: itemStatusInterface
  ) => {
    const response = fetchData({
      task: 'updateStatusForTheirItem',
      itemid,
      status,
      myuserid: myUserid,
      theiruserid: theirUserid,
    });
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

  const StatusDD = (props: { data: ItemType }) => {
    const { itemid } = props.data;
    return (
      <>
        <select
          value={statusSelectValue}
          onChange={(event) => {
            const status = event.target.value;
            setStatusSelectValue(status);
            onSelectChange(itemid, status as itemStatusInterface);
          }}
        >
          <option value="no change">No change/reset</option>
          <option value="reserved">Flag as reserved</option>
          <option value="purchased">Flag as purchased</option>
        </select>
      </>
    );
  };

  const [colDefs] = useState([
    { field: 'name', sortable: true, cellRenderer: linkedName, sort: 'asc' },
    { field: 'description', flex: 2 },
    {
      field: 'removed',
      cellRenderer: StatusDD,
      headerName: 'actions',
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
      task: 'updateStatusForTheirItem',
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
            report: 'Unable to remove/re-add item from item list',
            body: {
              error: data.error,
              file: 'Me',
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

  useEffect(() => {
    if (!myUserid && myProfile.userid) {
      setMyUserid(myProfile.userid);
    }
  }, [myProfile.userid]);

  useEffect(() => {
    if (theirUserid) {
      fetchTheirUserProfile(theirUserid);
    }
    if (theirUserid) {
      fetchTheirItemList(theirUserid);
    }
  }, [theirUserid]);

  return (
    <>
      <h2>
        Welcome to {theirUserProfile?.firstname} {theirUserProfile?.lastname}'s
        list
      </h2>
      <section className="table-container ag-theme-quartz responsive-grid-container responsive-grid-columns responsive-grid-sidebar">
        <AddItemForm
          legendText={`Add to  ${theirUserProfile?.firstname}'s list`}
          onAddItemFormSubmit={onSubmit}
        />
        <>
          {theirItemList?.length ? (
            <Table
              fetchTheirItemList={fetchTheirItemList}
              theirItemList={theirItemList}
              myUserid={myUserid}
              theirUserid={theirUserid || ''}
            />
          ) : (
            <h3>
              There are no items in {theirUserProfile?.firstname}'s list.{' '}
            </h3>
          )}
        </>
      </section>
    </>
  );
};

export default PageContent;
