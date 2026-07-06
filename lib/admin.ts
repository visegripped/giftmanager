export const ADMIN_USER_ID = '58627';

export function isAdminUser(
  userid: string | number | undefined | null
): boolean {
  if (userid === undefined || userid === null || userid === '') {
    return false;
  }

  return String(userid) === ADMIN_USER_ID;
}
