import { useState, useEffect } from 'react';
// import Button from '@components/Button';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import './Me.css';
import fetchData from '@utilities/fetchData';

type propsInterface = {
  userid: string | undefined;
  date_added: number;
  name: string;
  note: string;
  date_received: number;
  status: null | 'nochange' | 'uncancel' | 'remove';
  link: string;
  giftid: number;
  groupid: number;
  qty: number;
};

type myItemListInterface = {
  myItemList: propsInterface[];
}


type linkedNameInterface = {
  name: string;
  link: string;
};
type adjustedStatusInterface = {
  status: string;
  removed: number;
};

const linkedName = (props: linkedNameInterface) => {
  const { link, name } = props;
  return name;
  if (!link) {
    return name;
  }
  return `<a href='${link}' target='_blank'>${name}</a>`;
};

const adjustedStatus = (props: adjustedStatusInterface) => {
  const { status, removed } = props;
  let newStatus = status;
  if (removed === 1 && status === 'purchased') {
    return 'cancelled';
  }
  return newStatus;
};

const Table = (props: myItemListInterface) => {
  const { myItemList } = props;
  const [colDefs] = useState([
    { field: 'name', sortable: true, }, // cellRenderer: linkedName
    { field: 'note', flex: 2 },
    { field: 'status', cellRenderer: adjustedStatus },
    { field: 'date', sort: 'asc' },
  ]);

  return (
    <>
      <AgGridReact
        rowData={myItemList}
        columnDefs={colDefs}
        style={{ width: '100%', height: '100%' }}
      />
    </>
  );
};

const Me = () => {
  const [myItemList, setMyItemList] = useState([]);

  // const [userProfile] = useState({}); //, setUserProfile

  useEffect(() => {
    const response = fetchData({
      task: 'getMyList',
      myuserid: 1,
      userid: 1,
    });
    response &&
      response.then((data) => {
        setMyItemList(data.success);
      });
  }, []);

  return (
    <>
      <section className="table-container ag-theme-quartz">
        <h2>This is the Me page - view my list.</h2>
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
