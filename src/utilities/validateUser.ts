import fetchData from './fetchData';
export const validateUser = async (email_address: string) => {
  if (!email_address) {
    return { error: 'no email_address passed to validateUser' };
  }
  const response = await fetchData({
    task: 'confirmUserIsValid',
    email_address,
  });
  return response;
};

export default validateUser;
