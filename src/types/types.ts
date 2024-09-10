export type ItemType = {
  userid: number;
  date_added: number;
  name: string;
  note: string;
  date_received: number;
  status: null | 'nochange' | 'uncancel' | 'removed' | 'purchased' | 'reserved';
  removed: 1 | 0;
  link: string;
  itemid: number;
  groupid: number;
};

export type UserType = {
  userid: number;
  firstname: string;
  lastname: string;
  groupid: number;
  created: number;
  email: string;
  avatar: string;
};

export type tasksInterface = {
  task: //my
  | 'addItemToMyList'
    | 'getMyItemList'
    | 'updateItemOnMyList'
    | 'updateRemovedStatusForMyItem'

    //their
    | 'getTheirItemList'
    | 'addItemToTheirList'
    | 'updateStatusForTheirItem'

    //generic
    | 'getUserProfileByUserId'
    | 'confirmUserIsValid'
    | 'getUsers'
    | 'updateAvatar';
};

export type itemStatusInterface =
  | 'cancelled'
  | 'uncancel'
  | 'purchased'
  | 'reserved';
