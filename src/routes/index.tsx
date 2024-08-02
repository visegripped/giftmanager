import React from 'react';
import routeConstants from './routeConstants';

const Me = React.lazy(() => import('@pages/Me'));
const User = React.lazy(() => import('@pages/User'));
const Theme = React.lazy(() => import('@pages/Theme'));

const routes = [
  { path: routeConstants.HOME, element: <Me /> },
  { path: routeConstants.ALERTS, element: <Me /> },
  { path: routeConstants.THEME, element: <Theme /> },
  { path: routeConstants.SYMBOL, element: <User /> },
];

export { routeConstants };
export default routes;
