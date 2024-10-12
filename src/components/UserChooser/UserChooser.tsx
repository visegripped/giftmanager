import { useState, useEffect, useContext } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { responseInterface, UserType } from '../../types/types';
import './UserChooser.css';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import postReport from '../../utilities/postReport';
import fetchData from '../../utilities/fetchData';

export interface UserChooserPropsInterface {
  usersList: UserType[];
}

export const getUserNameFromUsersList = (
  usersList: UserType[],
  userid: number | string
) => {
  // iterate thru userList
  const usersListClone = [...usersList]; // careful not to manipulate the original.
  let numberOfRemainingUsers = usersListClone.length;
  let usernameInFocus = '';
  if (numberOfRemainingUsers && Number(userid) >= 0) {
    do {
      let user = usersListClone.shift() ?? {
        userid: '',
        firstname: '',
        lastname: '',
      };
      if (user.userid && Number(user.userid) === Number(userid)) {
        usernameInFocus = `${user.firstname} ${user.lastname}`;
        numberOfRemainingUsers = 0; // exit.
      }
      numberOfRemainingUsers--;
    } while (1 <= numberOfRemainingUsers);
  }
  return usernameInFocus;
};

export const UserChooser = () => {
  const paramsFromURL = useMatch('/User/:userid') || { params: { userid: '' } };
  const useridFromURL = paramsFromURL.params?.userid || '';
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  let [usersList, setUsersList] = useState([]);
  let [currentUserid, setUserid] = useState(useridFromURL);

  const navigate = useNavigate();

  const userChangeHandler = (event: any) => {
    const selectedUserid = event.target.value;
    //@ts-ignore
    setUserid(selectedUserid);
  };

  const fetchUsersList = () => {
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
  };

  useEffect(() => {
    //on load, only fetch the list once.
    if (!usersList.length) {
      fetchUsersList();
    }
  }, []);
  useEffect(() => {
    if (Number(useridFromURL) !== Number(currentUserid)) {
      navigate(`/User/${currentUserid}`);
    }
  }, [currentUserid]);

  const UserOptions = (props: { usersList: UserType[] }) => {
    const { usersList } = props;
    return (
      <>
        <option>Please choose</option>
        {usersList.map((user: UserType) => (
          <option value={user.userid} key={user.userid}>
            {' '}
            {user.firstname} {user.lastname}
          </option>
        ))}
      </>
    );
  };

  return (
    <div className="userchooser-container">
      <select
        // https://react-select.com/advanced#methods
        //@ts-ignore
        onChange={userChangeHandler}
        value={currentUserid}
        aria-errormessage="userPickerErrors"
      >
        {usersList.length ? (
          <UserOptions usersList={usersList} />
        ) : (
          <option>loading...</option>
        )}
      </select>
    </div>
  );
};

export default UserChooser;
