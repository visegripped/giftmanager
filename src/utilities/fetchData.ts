import { tasksInterface, itemStatusInterface } from '../types/types';
('@types/types');
const apiUrl = 'https://gm.visegripped.com/api.php';

type fetchInterface = {
  task: tasksInterface;
  myuserid: number;
  theiruserid: number;
  itemid: number;
  userid: number;
  name: string;
  avatar: string;
  description?: string;
  email_address?: string;
  link?: string;
  date_received?: string;
  removed?: 1 | 0;
  status?: itemStatusInterface;
  qty?: number;
  added_by_userid?: number;
  groupid?: number;
  archive?: number;
};

export const formatDate = (date: Date) => {
  const monthAdjustedForJS = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayPadded = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}${monthAdjustedForJS}${dayPadded}`;
};

export const fetchData = (config: fetchInterface) => {
  const {
    task,
    myuserid,
    theiruserid,
    userid,
    itemid,
    name,
    avatar,
    description,
    link,
    date_received,
    email_address,
    removed,
    status,
    qty,
    added_by_userid,
    groupid,
    archive,
  } = config;
  const accessToken = localStorage.getItem('access_token');
  const makeAsyncRequest = async (theFormData: fetchInterface) => {
    let jsonPayload = {};

    const apiResponse = await fetch(apiUrl, {
      body: theFormData,
      method: 'POST',
    });

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      jsonPayload = await apiResponse.json();
    } else {
      throw new Error(apiResponse.status);
    }
    if (jsonPayload.err) {
      throw new Error(jsonPayload.err);
    }
    return jsonPayload;
  };

  if (accessToken) {
    let formData = new FormData();
    formData.append('task', task);
    formData.append('access_token', accessToken);
    // TODO -> loop through config and add these dynamically.
    if (myuserid) formData.append('myuserid', myuserid);
    if (theiruserid) formData.append('theiruserid', theiruserid);
    if (userid) formData.append('userid', userid);
    if (itemid) formData.append('itemid', itemid);
    if (name) formData.append('name', name);
    if (avatar) formData.append('avatar', avatar);
    if (email_address) formData.append('email_address', email_address);
    if (description) formData.append('description', description);
    if (link) formData.append('link', link);
    if (date_received) formData.append('date_received', date_received);
    if (removed) formData.append('removed', removed);
    if (status) formData.append('status', status);
    if (qty) formData.append('qty', qty);
    if (added_by_userid) formData.append('added_by_userid', added_by_userid);
    if (groupid) formData.append('groupid', groupid);
    if (archive) formData.append('archive', archive);

    return makeAsyncRequest(formData);
  }
};

export default fetchData;
