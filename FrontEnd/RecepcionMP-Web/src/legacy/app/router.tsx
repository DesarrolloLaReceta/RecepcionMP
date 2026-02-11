import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import RecepcionPage from '../modules/recepcion/pages/RecepcionPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'recepcion',
        element: <RecepcionPage />,
      },
    ],
  },
]);
