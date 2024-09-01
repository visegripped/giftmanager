import { useState, useEffect } from 'react';
import Icon from '@components/Icon';
import Button from '@components/Button';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import './Me.css';
import fetchData from '@utilities/fetchData';

/*
To do:
  Status column: 
      if item is removed, row should turn warning/error color.
      remove button needs to work
      edit button should allows changing the link and description, NOT the name.
  API response should be cleaned up to only return data that doesn't reveal anything.
  Page needs to be responsive, for smaller browsers, left col should be on top.
  Need an Add item section
    includes: name, link, description (rename note)
    updates DB
    refetches list.
    updates table.
*/

type propsInterface = {
  userid: number;
  date_added: number;
  name: string;
  note: string;
  date_received: number;
  status: null | 'nochange' | 'uncancel' | 'remove' | 'purchased' | 'reserved';
  removed: 1 | 0;
  link: string;
  giftid: number;
  groupid: number;
};

type myItemListInterface = {
  myItemList: propsInterface[];
};

type tableDataInterface = {
  data: propsInterface;
};

const Me = () => {
  const [myItemList, setMyItemList] = useState([]);

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
  };

  const Link = (props: propsInterface) => {
    const { link, name } = props;
    return (
      <a href={link} target="_blank">
        {name}
      </a>
    );
  };

  const StatusDD = (props: { data: propsInterface }) => {
    const { removed, giftid, userid } = props.data;
    console.log(' -> giftid: ', props.data.giftid);
    return (
      <>
        {removed === 1 ? (
          <Button
            icon="plus"
            onButtonClick={() => {
              updateRemoveStatus(0, giftid, userid);
            }}
          />
        ) : (
          <>
            {/* <Icon icon="edit" /> */}
            <Button
              icon="delete"
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

  // const adjustedStatus = (props: tableDataInterface) => { };

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
        <form className="form">
          <fieldset className="fieldset">
            <legend className="legend">Add item</legend>

            <label className="label">Name</label>
            <div className="input-container">
              <input type="text" name="name" />
            </div>

            <label>URL</label>
            <div className="input-container">
              <input type="url" name="link" />
            </div>

            <label>Description</label>
            <div className="input-container">
              <textarea name="description"></textarea>
            </div>

            <Button icon="plus" label="Add item" />
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
