import { ItemsResponseProps } from './fetchData';
import { SelectListOptionProps } from '../components/SelectList/SelectList';
/*
status:
 5 = reserved
 10 = purchased
*/

export const getPrettyStatus = (status: number) => {
  if (status === 5) {
    return 'Reserved';
  }
  if (status === 10) {
    return 'Purchased';
  }
  return 'Unknown status';
};

export const getStatusChoicesForTheirList = (myUserId: number | string | undefined, itemInfo: ItemsResponseProps) => {
  if (!myUserId) {
    return []; // exit early if required values are not present.
  }
  const { remove, status, buy_userid } = itemInfo;
  const statusChoices: SelectListOptionProps[] = [];
  const blank = {
    label: '',
    value: '',
  };
  const purchased = {
    label: 'Purchased',
    value: 10,
  };
  const reserved = {
    label: 'Reserved',
    value: 5,
  };
  const release = {
    label: 'Unpurchase/unreserve',
    value: 'XX',
  };
  const fullList = [blank, reserved, purchased, release];
  // cases where remove > 1 and status = 0 are handled on the request.
  if (status === 0 && remove > 0) {
    return [];
  }
  if (status === 0 && remove === 0) {
    return fullList;
  }
  if (status >= 1 && myUserId === buy_userid) {
    return fullList;
  }

  return statusChoices;
};

export const getStatusChoicesForMyList = (itemRemoved: number) => {
  const statusChoices: SelectListOptionProps[] = [];

  if (itemRemoved === 1) {
    statusChoices.push(
      {
        label: 'Cancelled',
        value: 1,
      },
      {
        label: 'Uncancel',
        value: 0,
      },
    );
    return statusChoices;
  }

  statusChoices.push({
    label: '',
    value: '',
  });

  if (itemRemoved === 0) {
    statusChoices.push({
      label: 'Cancel',
      value: 1,
    });
  }

  return statusChoices;
};
