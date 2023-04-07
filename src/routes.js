import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import DashboardAppPage from './pages/DashboardAppPage';
import { NewService } from './pages/NewService';
import { SettingPage } from './pages/SettingPage';
import { PayrollPage } from './pages/PayrollPage';
import { ManagePage } from './pages/ManagePage';
import { ReportPage } from './pages/ReportPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ServiceHistory } from './pages/ServiceHistory';
import { InvoicePage } from './pages/InvoicePage';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'setting', element: <SettingPage/> },
        { path: 'new-service', element: <NewService />},
        { path: 'service-history', element: <ServiceHistory />},
        { path: 'payroll', element: <PayrollPage />},
        { path: 'manage', element: <ManagePage />},
        { path: 'manage/invoices', element: <InvoicePage />},
        { path: 'report', element: <ReportPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'register',
      element: <RegisterPage />,
    },
    {
      path: 'forgot-password',
      element: <ForgotPasswordPage />,
    },
    {
      path: 'reset-password/:token',
      element: <ResetPasswordPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
