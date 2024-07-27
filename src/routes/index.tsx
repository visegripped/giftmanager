import React from 'react';
import routeConstants from './routeConstants';

const Me = React.lazy(() => import('@pages/Me'));
const User = React.lazy(() => import('@pages/User'));

const routes = [
  { path: routeConstants.HOME, element: <Me /> },
  { path: routeConstants.ALERTS, element: <Me /> },
  { path: routeConstants.SYMBOL, element: <User /> },
];

export { routeConstants };
export default routes;
