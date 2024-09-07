import { useState, useEffect, useContext } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import Select from 'react-select'; // https://react-select.com/home
import { UserType } from '@types/types';
import fetchData from '@utilities/fetchData';
import './UserChooser.css';
import {
  NotificationsContext,
  AddNotificationProps,
} from '@context/NotificationsContext';
import postReport from '@utilities/postReport';

export interface UserChooserPropsInterface {
  usersList: UserType[];
}

type ReactSelectType = {
  value: string;
  label: string;
};

export const getUserNameFromUsersList = (
  usersList: UserType[],
  userid: number
) => {
  // iterate thru userList
  const usersListClone = [...usersList]; // careful not to manipulate the original.
  let numberOfRemainingUsers = usersListClone.length;
  let usernameInFocus = '';
  if (numberOfRemainingUsers && userid >= 0) {
    do {
      let user = usersListClone.shift() ?? '';
      if (Number(user.userid) === Number(userid)) {
        usernameInFocus = `${user.firstname} ${user.lastname}`;
        numberOfRemainingUsers = 0; // exit.
      }
      numberOfRemainingUsers--;
    } while (1 <= numberOfRemainingUsers);
  }
  return usernameInFocus;
};

export const UserChooser = (props: UserChooserPropsInterface) => {
  const paramsFromURL = useMatch('/User/:userid') || {};
  const useridFromURL = paramsFromURL.params?.userid || '';
  const { addNotification } =
    useContext<AddNotificationProps>(NotificationsContext);
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
    setUserid(selectedUserid);
    setUsername(selectedUsername);
  };

  const fetchUsersList = () => {
    const response = fetchData({
      task: 'getUsersList',
    });
    response &&
      response.then((data: { success: []; error: string }) => {
        if (data.success) {
          setUsersList(data.success);
        } else {
          postReport({
            type: 'error',
            report: 'Unable to fetch user list',
            body: {
              origin: 'AuthButton',
              email: data.error,
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
        onChange={userChangeHandler}
        defaultValue={selectedOption}
        options={formatUsersListForSelect(usersList)}
        // styles={customStyles}
        aria-errormessage="userPickerErrors"
      />
    </div>
  );
};

export default UserChooser;
