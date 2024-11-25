import { useState, useEffect, useContext } from 'react';
import Button from '../../components/Button/Button';
import {
  ItemType,
  ItemRemovedType,
  responseInterface,
} from '../../types/types';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import './Me.css';
import fetchData from '../../utilities/fetchData';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import {
  ProfileContext,
  ProfileContextInterface,
} from '../../context/ProfileContext';
import postReport from '../../utilities/postReport';

/*
To do:
  Status column: 
      edit button should allows changing the link and description, NOT the name.
  API response should be cleaned up to only return data that doesn't reveal anything.
*/

type myItemListInterface = {
  myItemList: ItemType[];
};

type tableDataInterface = {
  data: ItemType;
};

const Me = () => {
  const [myItemList, setMyItemList] = useState([]);
  const [addItemName, setAddItemName] = useState('');
  const [addItemDescription, setAddItemDescription] = useState('');
  const [addItemLink, setAddItemLink] = useState('');
  const { myProfile } = useContext(ProfileContext) as ProfileContextInterface;
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  const [myUserid, setMyUserid] = useState(myProfile.userid || '');

  const updateRemoveStatus = (
    removed: ItemRemovedType,
    itemid: number | string,
    userid: number | string
  ) => {
    const response = fetchData({
      task: 'updateRemovedStatusForMyItem',
      itemid,
      myuserid: userid,
      removed,
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
          fetchItemList(userid);
        }
      });
    return response;
  };

  const Link = (props: ItemType) => {
    const { link, name } = props;
    return (
      <a href={link} target="_blank">
        {name}
      </a>
    );
  };

  const StatusDD = (props: { data: ItemType }) => {
    const { removed, itemid, userid } = props.data;
    return (
      <>
        {removed === 1 ? (
          <Button
            icon="plus"
            title="Re-add item to my list"
            onButtonClick={() => {
              updateRemoveStatus(0, itemid, userid);
            }}
          />
        ) : (
          <>
            {/* <Icon icon="edit" /> */}
            <Button
              icon="delete"
              title="Remove item from my list"
              onButtonClick={() => {
                updateRemoveStatus(1, itemid, myUserid);
              }}
            />
          </>
        )}
      </>
    );
  };

  const linkedName = (props: tableDataInterface) => {
    // @ts-ignore
    return <Link {...props.data} />;
  };

  const Table = (props: myItemListInterface) => {
    const { myItemList } = props;
    const [colDefs] = useState([
      {
        field: 'name',
        sortable: true,
        cellRenderer: linkedName,
        sort: 'asc',
        wrapText: true,
        autoHeight: true,
        flex: 4,
      },
      { field: 'description', flex: 5, wrapText: true, autoHeight: true },
      {
        field: 'removed',
        cellRenderer: StatusDD,
        headerName: 'actions',
        flex: 1,
        resizeable: false,
      },
    ]);

    const rowClassRules = {
      'row-removed': 'data.removed >= 1',
    };

    return (
      <>
        <AgGridReact
          rowData={myItemList}
          // @ts-ignore
          columnDefs={colDefs}
          rowClassRules={rowClassRules}
          style={{ width: '100%', height: '100%' }}
        />
      </>
    );
  };

  const fetchItemList = (userid: string | number) => {
    const response = fetchData({
      task: 'getMyItemList',
      myuserid: userid,
    });
    response &&
      response.then((data: responseInterface) => {
        setMyItemList(data.success as []);
      });
  };
  // const [userProfile] = useState({ }); //, setUserProfile

  const addItemToMyList = (name: string, description: string, link: string) => {
    const response = fetchData({
      task: 'addItemToMyList',
      myuserid: myUserid,
      groupid: '1',
      name,
      description,
      link,
    });
    response &&
      response.then((data: responseInterface) => {
        if (data.error) {
          postReport({
            type: 'error',
            report: 'Unable to add item to item list',
            body: {
              error: data.error,
              file: 'Me',
              origin: 'apiResponse',
            },
          });
          addNotification({
            message: `Something has gone wrong with adding the item to your list.
            Try refreshing the page.
            If the error persists, reach out to the site administrator`,
            type: 'error',
          });
        } else {
          setAddItemName('');
          setAddItemDescription('');
          setAddItemLink('');
          fetchItemList(myUserid);
        }
      });
    return response;
  };

  useEffect(() => {
    if (!myUserid && myProfile.userid) {
      setMyUserid(myProfile.userid);
    }
    //only fetch the list once.
    if (myProfile.userid && !myItemList?.length) {
      fetchItemList(myProfile.userid);
    }
  }, [myProfile.userid]);

  return (
    <>
      <h2 className="page-heading">Welcome to your list.</h2>
      <section className="table-container ag-theme-quartz responsive-grid-container responsive-grid-columns responsive-grid-sidebar">
        <form
          className="form"
          onSubmit={(formSubmitEvent: React.FormEvent<HTMLFormElement>) => {
            formSubmitEvent.preventDefault();
            addItemToMyList(addItemName, addItemDescription, addItemLink);
          }}
        >
          <fieldset className="fieldset">
            <legend className="legend">Add item to my list</legend>
            <label className="label">Name</label>
            <div className="input-container">
              <input
                type="text"
                name="name"
                required
                value={addItemName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setAddItemName(event.target.value);
                }}
              />
            </div>

            <label>Link</label>
            <div className="input-container">
              <input
                type="url"
                name="link"
                value={addItemLink}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setAddItemLink(event.target.value);
                }}
              />
            </div>

            <label>Description</label>
            <div className="input-container">
              <textarea
                name="description"
                value={addItemDescription}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setAddItemDescription(event.target.value);
                }}
              ></textarea>
            </div>

            <Button icon="plus" label="Add" type="submit" />
          </fieldset>
        </form>

        <>
          {myItemList?.length ? (
            <Table myItemList={myItemList} />
          ) : (
            <h3>There are no items in this your list. Please add some.</h3>
          )}
        </>
      </section>
    </>
  );
};

export default Me;
