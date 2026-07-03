export const routeConstants = {
  HOME: '/',
  ME: '/me',
  USER: '/user',
  THEME: '/theme',
  ADMIN: '/admin',
};

export type routeConstantsType = keyof typeof routeConstants;

export default routeConstants;
