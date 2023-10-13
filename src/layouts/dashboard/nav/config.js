// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_dashboard'),
  },
  {
    title: 'New service',
    path: '/dashboard/new-service',
    icon: icon('ic_cart'),
  },
  {
    title: 'Service history',
    path: '/dashboard/service-history',
    icon: icon('ic_checkin'),
  },
  {
    title: 'Payroll',
    path: '/dashboard/payroll-panel',
    icon: icon('ic_payments'),
  },
  {
    title: 'Reports',
    path: '/dashboard/report',
    icon: icon('ic_reports'),
  },
  {
    title: 'Manage',
    path: '/dashboard/manage',
    icon: icon('ic_management'),
  },
];

export default navConfig;
