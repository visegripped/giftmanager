export type ItemRemovedType = 1 | 0;

export type ItemType = {
  userid: number;
  date_added: number;
  name: string;
  note?: string;
  date_received: number;
  status: null | 'nochange' | 'uncancel' | 'removed' | 'purchased' | 'reserved';
  removed: ItemRemovedType;
  link?: string;
  itemid: number;
  added_by_userid: number;
  groupid: number;
  status_userid: number;
  role: 'user' | 'admin';
  status_username?: string | null;
};

export type UserType = {
  userid: number | string;
  firstname: string;
  lastname: string;
  groupid: number | string;
  created: number | string;
  email: string;
  avatar: string;
  birthday_month?: number | null;
  birthday_day?: number | null;
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

export type responseInterface = {
  success?: string | [];
  error?: string;
  err?: string;
  warn?: string;
};

export interface UserProfileInterface {
  emailAddress: string;
  userid: string;
  givenName: string;
  familyName: string;
  avatar: string;
  google?: GoogleProfileInterface;
  facebook?: FacebookProfileInterface;
}

export interface GoogleProfileEmailInterface {
  metadata: {
    primary: boolean;
  };
  value: string;
}
export interface GoogleProfileNameInterface {
  metadata: {
    primary: boolean;
  };
  displayName: string;
  givenName: string;
  familyName: string;
}
export interface GoogleProfilePhotoInterface {
  metadata: {
    primary: boolean;
  };
  url: string;
}

export interface GoogleProfileInterface {
  resourceName: string;
  emailAddresses: GoogleProfileEmailInterface[];
  names: GoogleProfileNameInterface[];
  photos: GoogleProfilePhotoInterface[];
}

export interface FacebookProfilePictureData {
  url: string;
  width?: number;
  height?: number;
}

export interface FacebookProfilePicture {
  data: FacebookProfilePictureData;
}

export interface FacebookProfileInterface {
  id: string;
  name: string;
  email: string;
  picture?: FacebookProfilePicture;
  first_name?: string;
  last_name?: string;
}
