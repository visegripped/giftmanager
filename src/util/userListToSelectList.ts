interface UserListItemProps {
  userid: Number;
  firstName: String;
  lastName: String;
  email: String;
}

interface UserListProps extends Array<UserListItemProps> {}

const userListToSelectList = (userList: UserListProps = []) => {
  return userList.map((user: UserListItemProps) => {
    return { value: user.userid, label: `${user.firstName} ${user.lastName}` };
  });
};

export default userListToSelectList;
