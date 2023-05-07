import axios from 'axios';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
import 'react-toastify/dist/ReactToastify.css';
import config from './config.json';

axios.defaults.baseURL = config.APPBACK_URL;
axios.interceptors.request.use( (config) => {
  const token = localStorage.getItem('token')
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// ----------------------------------------------------------------------

export default function App() {
  return (
    <ThemeProvider>
      <ScrollToTop />
      <StyledChart />
      <Router />
    </ThemeProvider>
  );
}
