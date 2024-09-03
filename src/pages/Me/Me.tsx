import { useState, useEffect } from 'react';
import Icon from '@components/Icon';
import Button from '@components/Button';
import { UserType } from '@types/types';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import './Me.css';
import fetchData from '@utilities/fetchData';

/*
To do:
  Status column: 
      edit button should allows changing the link and description, NOT the name.
  API response should be cleaned up to only return data that doesn't reveal anything.
*/

type myItemListInterface = {
  myItemList: UserType[];
};

type tableDataInterface = {
  data: UserType;
};

const Me = () => {
  const [myItemList, setMyItemList] = useState([]);
  const [addItemName, setAddItemName] = useState('');
  const [addItemDescription, setAddItemDescription] = useState('');
  const [addItemLink, setAddItemLink] = useState('');

  const updateRemoveStatus = (
    removed: number,
    giftid: number,
    userid: number
  ) => {
    const response = fetchData({
      task: 'updateRemovedStatusForMyItem',
      giftid,
      myuserid: 1, // TODO -> fix this
      userid,
      removed,
    });
    response &&
      response.then((data: { success: string; error: string }) => {
        if (data.success) {
          fetchItemList();
        } else {
          //TODO - log this.
          console.log(data.error);
        }
      });
    return response;
  };

  const Link = (props: UserType) => {
    const { link, name } = props;
    return (
      <a href={link} target="_blank">
        {name}
      </a>
    );
  };

  const StatusDD = (props: { data: UserType }) => {
    const { removed, giftid, userid } = props.data;
    return (
      <>
        {removed === 1 ? (
          <Button
            icon="plus"
            title="Re-add item to my list"
            onButtonClick={() => {
              updateRemoveStatus(0, giftid, userid);
            }}
          />
        ) : (
          <>
            {/* <Icon icon="edit" /> */}
            <Button
              icon="delete"
              title="Remove item from my list"
              onButtonClick={() => {
                updateRemoveStatus(1, giftid, userid);
              }}
            />
          </>
        )}
      </>
    );
  };

  const linkedName = (props: tableDataInterface) => {
    return <Link {...props.data} />;
  };

  // change status title to actions: add a remove button.
  const Table = (props: myItemListInterface) => {
    const { myItemList } = props;
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
          rowData={myItemList}
          columnDefs={colDefs}
          rowClassRules={rowClassRules}
          style={{ width: '100%', height: '100%' }}
        />
      </>
    );
  };

  const fetchItemList = () => {
    const response = fetchData({
      task: 'getMyList',
      myuserid: 1,
      userid: 1,
    });
    response &&
      response.then((data: { success: [] }) => {
        setMyItemList(data.success);
      });
  };
  // const [userProfile] = useState({ }); //, setUserProfile

  const addItemToMyList = (name: string, description: string, link: string) => {
    const response = fetchData({
      task: 'addItemToMyOwnList',
      userid: 1, // TODO -> fix this so it is not hard coded
      added_by_userid: 1,
      groupid: 1,
      name,
      description,
      link,
    });
    response &&
      response.then((data: { success: string; error: string }) => {
        if (data.success) {
          setAddItemName('');
          setAddItemDescription('');
          setAddItemLink('');
          fetchItemList();
        } else {
          //TODO -> log this.
          console.log(data.error);
        }
      });
    return response;
  };

  useEffect(() => {
    //on load, only fetch the list once.
    if (!myItemList.length) {
      fetchItemList();
    }
  }, []);

  return (
    <>
      <h2 className="page-heading">YOURNAME's List</h2>
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
                defaultValue={addItemLink}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setAddItemLink(event.target.value);
                }}
              />
            </div>

            <label>Description</label>
            <div className="input-container">
              <textarea
                name="description"
                defaultValue={addItemDescription}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setAddItemDescription(event.target.value);
                }}
              ></textarea>
            </div>

            <Button icon="plus" label="Add" type="submit" />
          </fieldset>
        </form>

        <>
          {myItemList.length ? (
            <Table myItemList={myItemList} />
          ) : (
            <h3>Fetching data...</h3>
          )}
        </>
      </section>
    </>
  );
};

export default Me;
