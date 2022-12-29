export interface ResponseProps {
  items: [];
  users: UserResponseProps[];
  type: string;
  msg: string;
  statusText: string;
}

export interface UserResponseProps {
  email: string;
  userid: number;
  firstName: string;
  lastName: string;
}

export const fetchData = (cmd: string, token: string, queryParams: { [key: string]: string } = {}) => {
  if (!cmd || !token) {
    Promise.resolve({
      msg: `Token [${token}] and/or cmd [${cmd}] were left blank in fetchData.  Both are required.`,
      type: 'error',
    });
  }
  const formData = new FormData();
  formData.append('tokenId', token);
  formData.append('cmd', cmd);
  Object.keys(queryParams).forEach((propId) => {
    formData.append(propId, queryParams[propId]);
  });

  return fetch(`https://www.visegripped.com/family/api.php`, {
    body: formData,
    method: 'post',
  })
    .then((response) => {
      return response.json();
    })
    .then((response: ResponseProps) => {
      if (response.type !== 'success') {
        throw new Error(response.msg); // this throw will trigger the catch.
      }
      return response;
    })
    .catch(() => {
      throw new Error();
    });
};
