import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import Page404 from './pages/Page404';
import DashboardAppPage from './pages/DashboardAppPage';
import { NewServicePage } from './pages/NewServicePage';
import { MyAccountPage } from './pages/MyAccountPage';
import { PayrollPage } from './pages/PayrollPage';
import { ManagePage } from './pages/ManagePage';
import { ReportPage } from './pages/ReportPage';
import { ServiceHistory } from './pages/ServiceHistory';
import { InvoicePage } from './pages/InvoicePage';
import { DescriptionPage } from './pages/DescriptionPage';
import { InterpreterPage } from './pages/InterpreterPage';
import { UserPage } from './pages/UserPage';
import { LenguagePage } from './pages/LenguagePage';
import { AgencyPage } from './pages/AgencyPage';
import LoginPage from './pages/LoginPage';
import { CoordinatorPage } from './pages/CoordinatorPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { PublicRoute } from './components/auth/PublicRoute';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'my-account', element: <MyAccountPage/> },
        { path: 'coordinator', element: <CoordinatorPage />},
        { path: 'new-service', element: <NewServicePage />},
        { path: 'service-history', element: <ServiceHistory />},
        { path: "service-history/:id", element: <NewServicePage />},
        { path: 'payroll', element: <PayrollPage />},
        { path: 'report', element: <ReportPage /> },

        { path: 'manage', element: <ManagePage />},
        { path: 'manage/invoices', element: <InvoicePage />},
        { path: 'manage/descriptions', element: <DescriptionPage />},
        { path: 'manage/interpreters', element: <InterpreterPage />},
        { path: 'manage/users', element: <UserPage />},
        { path: 'manage/lenguages', element: <LenguagePage />},
        { path: 'manage/agencies', element: <AgencyPage />}
      ],
    },
    {
      path: 'login',
      element: <PublicRoute><LoginPage /></PublicRoute>,
    },
    {
      path: 'forgot-password',
      element: <PublicRoute><ForgotPasswordPage /></PublicRoute>,
    },
    {
      path: 'reset-password/:token',
      element: <PublicRoute><ResetPasswordPage /></PublicRoute>,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/login" />, index: true },
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
