import { itemStatusInterface, ItemRemovedType } from '../types/types';

const apiUrl = 'https://gm.visegripped.com/api.php';

type fetchInterface = {
  task: string;
  myuserid?: string | number;
  theiruserid?: string | number;
  itemid?: string | number;
  userid?: string | number;
  name?: string;
  avatar?: string;
  description?: string;
  email_address?: string;
  link?: string;
  date_received?: string;
  removed?: ItemRemovedType;
  status?: itemStatusInterface;
  qty?: string;
  added_by_userid?: string;
  groupid?: string;
  archive?: string;
};

export const formatDate = (date: Date) => {
  const monthAdjustedForJS = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayPadded = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}${monthAdjustedForJS}${dayPadded}`;
};

export const fetchData = (config: fetchInterface) => {
  const configWhiteList = [
    'task',
    'myuserid',
    'theiruserid',
    'userid',
    'itemid',
    'name',
    'avatar',
    'description',
    'link',
    'date_received',
    'email_address',
    'removed',
    'status',
    'qty',
    'added_by_userid',
    'groupid',
    'archive',
  ];
  const accessToken = localStorage.getItem('access_token');
  const makeAsyncRequest = async (theFormData: {}) => {
    let jsonPayload = { err: '' };

    const apiResponse = await fetch(apiUrl, {
      // @ts-ignore
      body: theFormData,
      method: 'POST',
    });

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      jsonPayload = await apiResponse.json();
    } else {
      throw new Error(`API responded with a ${apiResponse.status}`);
    }
    if (jsonPayload?.err) {
      throw new Error(jsonPayload.err);
    }
    return jsonPayload;
  };

  if (accessToken) {
    let formData = new FormData();
    formData.append('access_token', accessToken);
    for (let key of configWhiteList) {
      // @ts-ignore: todo - remove this and address TS issue.
      formData.append(key, config[key]);
    }

    return makeAsyncRequest(formData);
  }
};

export default fetchData;
