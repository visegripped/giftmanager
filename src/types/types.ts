export type UserType = {
  userid: number;
  date_added: number;
  name: string;
  note: string;
  date_received: number;
  status: null | 'nochange' | 'uncancel' | 'removed' | 'purchased' | 'reserved';
  removed: 1 | 0;
  link: string;
  giftid: number;
  groupid: number;
};
