import { useState, useEffect, useContext } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import Select from 'react-select'; // https://react-select.com/home
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

type ReactSelectType = {
  value: string | number;
  label: string;
};

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
      let user = usersListClone.shift() ?? { userid: '', firstname: '', lastname: '' };
      if (user.userid && (Number(user.userid) === Number(userid))) {
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
  const { addNotification } = useContext(NotificationsContext) as NotificationContextProps;
  let [usersList, setUsersList] = useState([]);
  let [currentUserid, setUserid] = useState(useridFromURL);
  const usernameFromUsersList = getUserNameFromUsersList(
    usersList,
    useridFromURL
  );
  let [currentUsername, setUsername] = useState(usernameFromUsersList);

  const navigate = useNavigate();
  const selectedOption = {
    value: currentUserid, //should be the selected user
    label: currentUsername, //should be the selected userid
  };

  const userChangeHandler = (event: ReactSelectType) => {
    const selectedUserid = event.value;
    const selectedUsername = event.label;
    //@ts-ignore
    setUserid(selectedUserid);
    setUsername(selectedUsername);
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

  const formatUsersListForSelect = (theUsers: UserType[] = []) => {
    const formattedUsers = [] as ReactSelectType[];
    theUsers.forEach((theUser) => {
      const option = {
        value: theUser.userid,
        label: `${theUser.firstname} ${theUser.lastname} ${theUser.userid}`,
      };
      formattedUsers.push(option);
    });
    return formattedUsers;
  };

  useEffect(() => {
    //on load, only fetch the list once.
    if (!usersList.length) {
      fetchUsersList();
    }
  }, []);
  useEffect(() => {
    //on load, only fetch the list once.
    if (Number(useridFromURL) !== Number(currentUserid)) {
      navigate(`/User/${currentUserid}`);
    }
  }, [currentUserid]);

  return (
    <div className="userchooser-container">
      <Select
        // https://react-select.com/advanced#methods
        //@ts-ignore
        onChange={userChangeHandler}
        defaultValue={selectedOption}
        //@ts-ignore
        options={formatUsersListForSelect(usersList)}
        // styles={customStyles}
        aria-errormessage="userPickerErrors"
      />
    </div>
  );
};

export default UserChooser;
