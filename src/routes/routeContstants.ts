export const routeConstants = {
  HOME: '/',
  ME: '/Me',
  USER: '/User',
  THEME: '/Theme',
  ADMIN: '/Admin',
};

export type routeConstantsType = keyof typeof routeConstants;

export default routeConstants;
