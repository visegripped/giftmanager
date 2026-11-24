import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  memo,
} from 'react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import Button from '../../components/Button/Button';
import ReservedPurchasedItemsModal from '../../components/ReservedPurchasedItemsModal/ReservedPurchasedItemsModal';
import PrintListModal from '../../components/PrintListModal/PrintListModal';
import {
  ItemType,
  ItemRemovedType,
  responseInterface,
} from '../../types/types';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import '@/src/utilities/agGridSetup';
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

type MeGridContext = {
  myUserid: string | number;
  onEdit: (item: ItemType) => void;
  onUpdateRemoveStatus: (
    removed: ItemRemovedType,
    itemid: number | string,
    userid: number | string
  ) => void;
};

type MeItemFormProps = {
  editingItem: ItemType | null;
  onAdd: (
    name: string,
    description: string,
    link: string
  ) => Promise<responseInterface> | undefined;
  onUpdate: (
    item: ItemType,
    description: string,
    link: string
  ) => Promise<responseInterface> | undefined;
  onCancel: () => void;
};

const ItemLink = (props: ItemType) => {
  const { link, name } = props;
  return (
    <a href={link} target="_blank">
      {name}
    </a>
  );
};

const linkedName = (props: ICellRendererParams<ItemType>) => {
  if (!props.data) {
    return null;
  }
  return <ItemLink {...props.data} />;
};

const StatusCell = (
  props: ICellRendererParams<ItemType, unknown, MeGridContext>
) => {
  const item = props.data;
  const gridContext = props.context;
  if (!item || !gridContext) {
    return null;
  }

  const { removed, itemid, userid } = item;
  const { myUserid, onEdit, onUpdateRemoveStatus } = gridContext;

  return (
    <div className="me-cell-actions">
      {removed === 1 ? (
        <Button
          icon="plus"
          title="Re-add item to my list"
          onButtonClick={() => {
            onUpdateRemoveStatus(0, itemid, userid);
          }}
        />
      ) : (
        <>
          <Button
            icon="edit"
            title="Edit item (link/description)"
            onButtonClick={() => {
              onEdit(item);
            }}
          />
          <Button
            icon="delete"
            title="Remove item from my list"
            onButtonClick={() => {
              onUpdateRemoveStatus(1, itemid, myUserid);
            }}
          />
        </>
      )}
    </div>
  );
};

const columnDefs: ColDef<ItemType>[] = [
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
    cellRenderer: StatusCell,
    headerName: 'actions',
    flex: 1.5,
  },
];

const rowClassRules = {
  'row-removed': 'data.removed >= 1',
};

const MeItemTable = memo(function MeItemTable({
  myItemList,
  gridContext,
}: {
  myItemList: ItemType[];
  gridContext: MeGridContext;
}) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <AgGridReact
        theme="legacy"
        rowData={myItemList}
        columnDefs={columnDefs}
        rowClassRules={rowClassRules}
        context={gridContext}
      />
    </div>
  );
});

const MeItemForm = memo(function MeItemForm({
  editingItem,
  onAdd,
  onUpdate,
  onCancel,
}: MeItemFormProps) {
  const [name, setName] = useState(editingItem?.name || '');
  const [description, setDescription] = useState(
    editingItem?.description || ''
  );
  const [link, setLink] = useState(editingItem?.link || '');
  const [shouldFlash, setShouldFlash] = useState(!!editingItem);

  useEffect(() => {
    if (!editingItem) {
      return;
    }
    const timer = setTimeout(() => {
      setShouldFlash(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [editingItem]);

  const handleSubmit = (formSubmitEvent: React.FormEvent<HTMLFormElement>) => {
    formSubmitEvent.preventDefault();
    if (editingItem) {
      onUpdate(editingItem, description, link);
      return;
    }

    const response = onAdd(name, description, link);
    response?.then((data) => {
      if (!data?.error && !data?.err) {
        setName('');
        setDescription('');
        setLink('');
      }
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <fieldset
        className={shouldFlash ? 'fieldset fieldset--flash' : 'fieldset'}
      >
        <legend className="legend">
          {editingItem ? 'Edit item on my list' : 'Add item to my list'}
        </legend>
        <label className="label">Name</label>
        <div className="input-container">
          <input
            type="text"
            name="name"
            required
            value={name}
            readOnly={!!editingItem}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (!editingItem) {
                setName(event.target.value);
              }
            }}
          />
        </div>

        <label>Link</label>
        <div className="input-container">
          <input
            type="url"
            name="link"
            value={link}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setLink(event.target.value);
            }}
          />
        </div>

        <label>Description</label>
        <div className="input-container">
          <textarea
            name="description"
            value={description}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              setDescription(event.target.value);
            }}
          ></textarea>
        </div>

        <div className="me-form-actions">
          <Button
            icon={editingItem ? 'edit' : 'plus'}
            label={editingItem ? 'Save' : 'Add'}
            type="submit"
          />
          {editingItem && (
            <Button label="Cancel" type="button" onButtonClick={onCancel} />
          )}
        </div>
      </fieldset>
    </form>
  );
});

const Me = () => {
  const [myItemList, setMyItemList] = useState<ItemType[]>([]);
  const [editingItem, setEditingItem] = useState<ItemType | null>(null);
  const [isReservedPurchasedModalOpen, setIsReservedPurchasedModalOpen] =
    useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const { myProfile } = useContext(ProfileContext) as ProfileContextInterface;
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  const [myUserid, setMyUserid] = useState(myProfile.userid || '');

  const cancelEdit = useCallback(() => {
    setEditingItem(null);
  }, []);

  const startEdit = useCallback((item: ItemType) => {
    setEditingItem(item);
  }, []);

  const fetchItemList = useCallback((userid: string | number) => {
    const response = fetchData({
      task: 'getMyItemList',
      myuserid: userid,
    });
    if (response) {
      response.then((data: responseInterface) => {
        setMyItemList((data.success as ItemType[]) || []);
      });
    }
  }, []);

  const updateRemoveStatus = useCallback(
    (
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
      if (response) {
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
      }
      return response;
    },
    [addNotification, fetchItemList]
  );

  const updateItemOnMyList = useCallback(
    (item: ItemType, description: string, link: string) => {
      const response = fetchData({
        task: 'updateItemOnMyList',
        itemid: item.itemid,
        myuserid: myUserid,
        description,
        link,
      });

      if (response) {
        response.then((data: responseInterface) => {
          if (data.error || data.err) {
            postReport({
              type: 'error',
              report: 'Unable to update item on my list',
              body: {
                error: data.error || data.err,
                file: 'Me',
                origin: 'apiResponse',
              },
            });
            addNotification({
              message: `Something has gone wrong updating the item on your list.
            Try refreshing the page.
            If the error persists, reach out to the site administrator`,
              type: 'error',
            });
          } else {
            fetchItemList(myUserid);
            cancelEdit();
          }
        });
      }

      return response;
    },
    [addNotification, cancelEdit, fetchItemList, myUserid]
  );

  const addItemToMyList = useCallback(
    (name: string, description: string, link: string) => {
      const response = fetchData({
        task: 'addItemToMyList',
        myuserid: myUserid,
        groupid: '1',
        name,
        description,
        link,
      });
      if (response) {
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
            fetchItemList(myUserid);
          }
        });
      }
      return response;
    },
    [addNotification, fetchItemList, myUserid]
  );

  const gridContext = useMemo<MeGridContext>(
    () => ({
      myUserid,
      onEdit: startEdit,
      onUpdateRemoveStatus: updateRemoveStatus,
    }),
    [myUserid, startEdit, updateRemoveStatus]
  );

  useEffect(() => {
    if (!myUserid && myProfile.userid) {
      setMyUserid(myProfile.userid);
    }
    //only fetch the list once.
    if (myProfile.userid && !myItemList?.length) {
      fetchItemList(myProfile.userid);
    }
    // List data is refreshed after add/save, not when the form changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile.userid]);

  return (
    <>
      <h2 className="page-heading">Welcome to your list.</h2>
      <section className="table-container ag-theme-quartz responsive-grid-container responsive-grid-columns responsive-grid-sidebar">
        <div>
          <MeItemForm
            key={editingItem ? `edit-${editingItem.itemid}` : 'add'}
            editingItem={editingItem}
            onAdd={addItemToMyList}
            onUpdate={updateItemOnMyList}
            onCancel={cancelEdit}
          />

          <div className="me-page-actions">
            <Button
              label="View items"
              onButtonClick={() => setIsReservedPurchasedModalOpen(true)}
              title="View items from other users that you have reserved or purchased"
            />
            <Button
              label="Print items"
              onButtonClick={() => setIsPrintModalOpen(true)}
              title="Print a list of your purchased items"
            />
          </div>
        </div>

        <>
          {myItemList?.length ? (
            <MeItemTable myItemList={myItemList} gridContext={gridContext} />
          ) : (
            <h3>There are no items in this your list. Please add some.</h3>
          )}
        </>
      </section>

      <ReservedPurchasedItemsModal
        isOpen={isReservedPurchasedModalOpen}
        onClose={() => setIsReservedPurchasedModalOpen(false)}
        myUserid={myUserid}
      />

      <PrintListModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        myUserid={myUserid}
      />
    </>
  );
};

export default Me;
