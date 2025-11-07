import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { Link, useMatch } from 'react-router-dom';
import { responseInterface, UserType } from '../../types/types';
import './UserChooser.css';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import routeConstants from '../../routes/routeContstants';
import postReport from '../../utilities/postReport';
import fetchData from '../../utilities/fetchData';

// borrowed from https://blog.logrocket.com/how-create-dropdown-menu-react/

export interface UserChooserPropsInterface {
  usersList: UserType[];
}

export const getUserNameFromUsersList = (
  usersList: UserType[],
  userid: number | string
) => {
  const user = usersList.find((user) => Number(user.userid) === Number(userid));
  return user ? `${user.firstname} ${user.lastname}` : '';
};

export const UserChooser = () => {
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const paramsFromURL = useMatch('/User/:userid') || { params: { userid: '' } };
  const useridFromURL = Number(paramsFromURL.params?.userid) || '';
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  let [usersList, setUsersList] = useState([]);
  let [currentUserid, setUserid] = useState(useridFromURL);

  const fetchUsersList = useCallback(() => {
    const response = fetchData({
      task: 'getUsersList',
    });
    response &&
      response.then((data: responseInterface) => {
        if (data.success) {
          setUsersList(data.success as []);
        } else {
          postReport({
            type: 'error',
            report: 'Unable to fetch user list',
            body: {
              file: 'UserChooser',
              origin: 'apiResponse',
              error: data.error,
            },
          });
          addNotification({
            message: `Something went wrong while trying to get the list of users.
            Try refreshing your browser.  
            If the user chooser still does not appear, reach out to the site administrator.`,
            type: 'error',
            persist: true,
          });
        }
      });
    return response;
  }, [addNotification]);

  const handleUserClick = useCallback((userid: number | string) => {
    setUserid(userid);
    setOpen(false);
  }, []);

  const UserList = React.memo((props: { usersList: UserType[] }) => {
    const { usersList } = props;
    return (
      <>
        {usersList.map((user: UserType) => (
          <li key={user.userid}>
            <Link
              to={`${routeConstants.USER}/${user.userid}`}
              onClick={() => handleUserClick(user.userid)}
              className={`userlist-user ${currentUserid == user.userid ? 'userlist-user-active' : ''}`}
            >
              {/* <span className='userlist-user-avatar-container'>{user.avatar ? <img src={user.avatar} height='40' width='40' alt={`${user.lastname} avatar`} /> : ''}</span> */}
              <span>
                {user.firstname} {user.lastname}
              </span>
            </Link>
          </li>
        ))}
      </>
    );
  });

  UserList.displayName = 'UserList';

  useEffect(() => {
    //on load, only fetch the list once.
    if (!usersList.length) {
      fetchUsersList();
    }
  }, [usersList.length, fetchUsersList]);

  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div className="userchooser" ref={menuRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md text-sm border border-[#e4e4e7] h-10 px-4 py-2"
        onClick={handleToggle}
      >
        Choose user
      </button>
      {open && (
        <div className="userchooser-container">
          <ul className="userchooser-menu">
            {usersList.length ? (
              <UserList usersList={usersList} />
            ) : (
              <li>loading...</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserChooser;
