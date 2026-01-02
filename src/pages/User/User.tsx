import { useParams } from 'react-router-dom';
import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  ItemNoteType,
  itemStatusInterface,
  responseInterface,
} from '../../types/types';
import AddItemForm from '../../components/AddItemForm/AddItemForm';
import DeliveryDateModal from '../../components/DeliveryDateModal/DeliveryDateModal';
import Button from '../../components/Button/Button';
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the Data Grid
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import './User.css';
import { useReport } from '../../hooks/useReport';

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
  const { reportError } = useReport();

  const [notesByItemId, setNotesByItemId] = useState<
    Record<
      number,
      { loading: boolean; error: string | null; notes: ItemNoteType[] }
    >
  >({});
  const [newNoteTextByItemId, setNewNoteTextByItemId] = useState<
    Record<number, string>
  >({});
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteTextByNoteId, setEditingNoteTextByNoteId] = useState<
    Record<number, string>
  >({});
  const [showAddNoteTextarea, setShowAddNoteTextarea] = useState<
    Record<number, boolean>
  >({});
  // Refs to textarea DOM elements to read values directly without state updates
  const newNoteTextareaRefs = useRef<
    Record<number, HTMLTextAreaElement | null>
  >({});
  const editingNoteTextareaRefs = useRef<
    Record<number, HTMLTextAreaElement | null>
  >({});

  const loadNotesForItem = useCallback(
    (itemid: number) => {
      const response = fetchData({
        task: 'getItemNotes',
        myuserid: myUserid,
        itemid,
      });

      setNotesByItemId((prev) => ({
        ...prev,
        [itemid]: {
          loading: true,
          error: null,
          notes: prev[itemid]?.notes || [],
        },
      }));

      response &&
        response.then((data: responseInterface) => {
          if (data.error || data.err) {
            const message = data.error || data.err || 'Unknown error';
            reportError('Unable to fetch item notes', undefined, {
              component: 'User',
              metadata: {
                origin: 'apiResponse',
                task: 'getItemNotes',
                itemid,
                theirUserid,
                myUserid,
                error: message,
              },
            });
            setNotesByItemId((prev) => ({
              ...prev,
              [itemid]: { loading: false, error: message, notes: [] },
            }));
            return;
          }

          setNotesByItemId((prev) => ({
            ...prev,
            [itemid]: {
              loading: false,
              error: null,
              notes: (data.success as ItemNoteType[]) || [],
            },
          }));
        });
    },
    [myUserid, theirUserid, reportError]
  );

  const startEditNote = useCallback((note: ItemNoteType) => {
    setEditingNoteId(note.noteid);
    const noteText = note.note || '';
    setEditingNoteTextByNoteId((prev) => ({
      ...prev,
      [note.noteid]: noteText,
    }));
  }, []);

  const cancelEditNote = useCallback(() => {
    setEditingNoteId(null);
  }, []);

  const saveEditedNote = useCallback(
    (noteid: number, itemid: number) => {
      // Read value directly from the textarea DOM element
      const textarea = editingNoteTextareaRefs.current[noteid];
      const nextText = (textarea?.value || '').trim();
      if (!nextText) {
        addNotification({ message: 'Note cannot be empty', type: 'error' });
        return;
      }
      const response = fetchData({
        task: 'updateItemNote',
        myuserid: myUserid,
        noteid,
        note: nextText,
      });
      response &&
        response.then((data: responseInterface) => {
          if (data.error || data.err) {
            const message = data.error || data.err || 'Unknown error';
            reportError('Unable to update item note', undefined, {
              component: 'User',
              metadata: {
                origin: 'apiResponse',
                task: 'updateItemNote',
                noteid,
                itemid,
                theirUserid,
                myUserid,
                error: message,
              },
            });
            addNotification({
              message: `Something has gone wrong updating a note.
              Try refreshing the page.
              If the error persists, reach out to the site administrator`,
              type: 'error',
            });
            return;
          }
          setEditingNoteId(null);
          loadNotesForItem(itemid);
        });
    },
    [
      editingNoteTextByNoteId,
      addNotification,
      myUserid,
      theirUserid,
      reportError,
      loadNotesForItem,
    ]
  );

  const deleteNote = useCallback(
    (noteid: number, itemid: number) => {
      if (!window.confirm('Delete this note?')) {
        return;
      }
      const response = fetchData({
        task: 'deleteItemNote',
        myuserid: myUserid,
        noteid,
      });
      response &&
        response.then((data: responseInterface) => {
          if (data.error || data.err) {
            const message = data.error || data.err || 'Unknown error';
            reportError('Unable to delete item note', undefined, {
              component: 'User',
              metadata: {
                origin: 'apiResponse',
                task: 'deleteItemNote',
                noteid,
                itemid,
                theirUserid,
                myUserid,
                error: message,
              },
            });
            addNotification({
              message: `Something has gone wrong deleting a note.
              Try refreshing the page.
              If the error persists, reach out to the site administrator`,
              type: 'error',
            });
            return;
          }
          loadNotesForItem(itemid);
        });
    },
    [addNotification, myUserid, theirUserid, reportError, loadNotesForItem]
  );

  const updateStatusForTheirItem = useCallback(
    (
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
    },
    [addNotification, myUserid, theirUserid, fetchTheirItemList]
  );

  const onSelectChange = useCallback(
    (itemid: string | number, status: itemStatusInterface) => {
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
    },
    [theirItemList, updateStatusForTheirItem]
  );

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

  const NotesCell = (props: { data: ItemType }) => {
    const item = props.data;
    const itemid = Number(item.itemid);
    const notesState = notesByItemId[itemid];
    const notes = notesState?.notes || [];
    const loading = notesState?.loading;
    const error = notesState?.error;
    const isShowingAddTextarea = !!showAddNoteTextarea[itemid];
    const theirName = theirUserProfile
      ? `${theirUserProfile.firstname} ${theirUserProfile.lastname}`.trim()
      : 'the list owner';

    // Load notes on mount if not already loaded
    useEffect(() => {
      if (!notesState && itemid) {
        loadNotesForItem(itemid);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemid]);

    const handleCreateNote = () => {
      // Find the textarea element using the ref or querySelector
      let textarea = newNoteTextareaRefs.current[itemid];

      // Fallback to querySelector if ref is not available
      if (!textarea) {
        const container = document.querySelector(
          `.item-notes__add[data-itemid="${itemid}"]`
        );
        textarea = container?.querySelector('textarea') || null;
      }

      const noteText = (textarea?.value || '').trim();
      if (!noteText) {
        addNotification({ message: 'Note cannot be empty', type: 'error' });
        return;
      }
      const response = fetchData({
        task: 'createItemNote',
        myuserid: myUserid,
        itemid,
        note: noteText,
      });
      response &&
        response.then((data: responseInterface) => {
          if (data.error || data.err) {
            const message = data.error || data.err || 'Unknown error';
            reportError('Unable to create item note', undefined, {
              component: 'User',
              metadata: {
                origin: 'apiResponse',
                task: 'createItemNote',
                itemid,
                theirUserid,
                myUserid,
                error: message,
              },
            });
            addNotification({
              message: `Something has gone wrong adding a note.
              Try refreshing the page.
              If the error persists, reach out to the site administrator`,
              type: 'error',
            });
            return;
          }
          setNewNoteTextByItemId((prev) => ({ ...prev, [itemid]: '' }));
          setShowAddNoteTextarea((prev) => ({ ...prev, [itemid]: false }));
          const textarea = newNoteTextareaRefs.current[itemid];
          if (textarea) {
            textarea.value = '';
          }
          loadNotesForItem(itemid);
        });
    };

    return (
      <div className="item-notes">
        {loading && <div className="item-notes__loading">Loading…</div>}
        {error && <div className="item-notes__error">Error loading notes</div>}

        {!loading && !error && (
          <>
            {notes.length > 0 && (
              <div className="item-notes__list">
                {notes.map((note) => {
                  const isMine = String(note.userid) === String(myUserid);
                  const isEditing = editingNoteId === note.noteid;
                  return (
                    <div className="item-notes__row" key={note.noteid}>
                      <div className="item-notes__header">
                        <div className="item-notes__author">
                          {note.author_avatar ? (
                            <img
                              className="item-notes__avatar"
                              src={note.author_avatar}
                              alt=""
                            />
                          ) : (
                            <div className="item-notes__avatar item-notes__avatar--blank" />
                          )}
                          <div className="item-notes__author-name">
                            {note.author_name || `User ${note.userid}`}
                          </div>
                        </div>
                        {isMine && !isEditing && (
                          <div className="item-notes__actions">
                            <Button
                              icon="edit"
                              title="Edit note"
                              size="small"
                              onButtonClick={() => startEditNote(note)}
                            />
                            <Button
                              icon="delete"
                              title="Delete note"
                              size="small"
                              onButtonClick={() =>
                                deleteNote(note.noteid, itemid)
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="item-notes__content">
                        {isEditing ? (
                          <>
                            <textarea
                              ref={(el) => {
                                editingNoteTextareaRefs.current[note.noteid] =
                                  el;
                              }}
                              className="item-notes__textarea"
                              defaultValue={
                                editingNoteTextByNoteId[note.noteid] || ''
                              }
                              onBlur={(e) => {
                                const value = (e.target as HTMLTextAreaElement)
                                  .value;
                                setEditingNoteTextByNoteId((prev) => ({
                                  ...prev,
                                  [note.noteid]: value,
                                }));
                              }}
                            />
                            <div className="item-notes__actions">
                              <Button
                                icon="edit"
                                label="Save"
                                size="small"
                                onButtonClick={() =>
                                  saveEditedNote(note.noteid, itemid)
                                }
                              />
                              <Button
                                label="Cancel"
                                size="small"
                                onButtonClick={cancelEditNote}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="item-notes__text">{note.note}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="item-notes__add" data-itemid={itemid}>
              {!isShowingAddTextarea ? (
                <Button
                  icon="plus"
                  label="Add note"
                  size="small"
                  onButtonClick={() => {
                    setShowAddNoteTextarea((prev) => ({
                      ...prev,
                      [itemid]: true,
                    }));
                  }}
                />
              ) : (
                <>
                  <textarea
                    ref={(el) => {
                      if (el) {
                        newNoteTextareaRefs.current[itemid] = el;
                      }
                    }}
                    className="item-notes__textarea"
                    defaultValue={newNoteTextByItemId[itemid] || ''}
                    onBlur={(e) => {
                      const value = (e.target as HTMLTextAreaElement).value;
                      setNewNoteTextByItemId((prev) => ({
                        ...prev,
                        [itemid]: value,
                      }));
                    }}
                  />
                  <div className="item-notes__helper-text">
                    Notes are visible to other users but not {theirName}
                  </div>
                  <div className="item-notes__actions">
                    <Button
                      icon="plus"
                      label="Save"
                      size="small"
                      onButtonClick={handleCreateNote}
                    />
                    <Button
                      label="Cancel"
                      size="small"
                      onButtonClick={() => {
                        setShowAddNoteTextarea((prev) => ({
                          ...prev,
                          [itemid]: false,
                        }));
                        const textarea = newNoteTextareaRefs.current[itemid];
                        if (textarea) {
                          textarea.value = '';
                        }
                        setNewNoteTextByItemId((prev) => ({
                          ...prev,
                          [itemid]: '',
                        }));
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const colDefs = useMemo(
    () => [
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
        headerName: 'Notes',
        field: 'notes_count',
        cellRenderer: NotesCell,
        wrapText: true,
        autoHeight: true,
        flex: 1,
      },
      {
        field: 'removed',
        cellRenderer: StatusDD,
        headerName: 'Actions',
        width: 300,
      },
    ],
    [StatusDD, NotesCell, linkedName]
  );

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
                  key={theirUserid || 'unknown-user'}
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
