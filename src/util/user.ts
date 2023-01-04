import { UserResponseProps } from './fetchData';
import { MenuItemProps } from '../components/Menu/Menu';

export const getFullNameFromUserId = (userId: string | number | undefined, users: UserResponseProps[]) => {
  let fullname = '';
  for (const user of users) {
    if (user.userid == userId) {
      fullname = `${user.firstName} ${user.lastName}`;
      break;
    }
  }
  return fullname;
};

export const userListToMenuFormat = (users: UserResponseProps[] = []) => {
  const userList: MenuItemProps[] = users
    .map((user: UserResponseProps) => {
      return { link: `/theirlist/${user.userid}`, value: `${user.firstName} ${user.lastName}` };
    })
    .sort((a, b) => a.value.localeCompare(b.value));
  return userList;
};
