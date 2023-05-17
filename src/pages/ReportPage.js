import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

// @mui
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Table,
  Stack,
  Paper,
  TableRow,
  Avatar,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  TextField,
  Breadcrumbs, Link,
} from '@mui/material';

// components
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Slide from '@mui/material/Slide';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// date-fns
import { differenceInDays, format, lastDayOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// date-fns


// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import config from '../config.json';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'user', label: 'User', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'start_date', label: 'Start date', alignRight: false },
  { id: 'end_date', label: 'End date', alignRight: false },
  { id: '' },
];

const options = [
  {
    value: 'm',
    label: 'Income per month',
  },
  {
    value: 'a',
    label: 'Annual income',
  },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_report) => _report.start_date.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export const ReportPage = () => {


  /* Report */
  const [startDate, setStartDate] = useState(new Date(`${format(new Date(), 'yyyy-MM-01')}T00:00:00`));
  const [endDate, setEndDate] = useState(new Date(`${format(new Date(), 'yyyy-MM-dd')}T00:00:00`));

  /* Reports */

  const [reports, setReports] = useState([]);

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('start_date');

  const [filterDate, setFilterDate] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isLoading, setIsLoading] = useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByDate = (event) => {
    setPage(0);
    setFilterDate(event.target.value);
  };

  /* -------------------------- */

  const handleGenerateReport = async () => {

    /* Get differenceInDays */

    const difference = differenceInDays(endDate, startDate);
    let type = 'a';
    
    if (difference > 15 && difference <= 31) {
      type = 'm';
    }
    else if (difference > 31 && difference <= 365) {
      type = 'a';
    }
    else {
      toast.error('Error generating report');
      setIsLoading(false);
      type = null;
    }

    console.log(type);
    if (type) {
      try {
        const response = await axios.post(`${config.APPBACK_URL}/api/reports`, {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          type,
          user_id: 1,
        });
        console.log(response);
        toast.success('Report generated successfully');
        getReports();
      } catch (error) {
        console.log(error);
        toast.error('Error generating report');
      } finally {
        setIsLoading(false);
      }
    }


  };

  const handleDeleteReport = async (id) => {
    try {
      const response = await axios.delete(`${config.APPBACK_URL}/api/reports/${id}`);
      console.log(response);
      toast.success('Report deleted successfully');
      getReports();
    } catch (error) {
      console.log(error);
      toast.error('Error deleting report');
    }
  };


  const getReports = async () => {
    try {
      const response = await axios.get(`${config.APPBACK_URL}/api/reports`);
      setReports(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getReports();
  }, []);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reports.length) : 0;

  const filteredReports = applySortFilter(reports, getComparator(order, orderBy), filterDate);

  const isNotFound = !filteredReports.length && !!filterDate;
  return (
    <>
      <Helmet>
        <title> Report | IA System </title>
      </Helmet>

      <Container>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard/app">
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="#"
          >
            Reports
          </Link>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 5, mt: 3 }}>
          Generate
        </Typography>

        <Card>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ paddingLeft: 3, paddingTop: 3, paddingBottom: 2 }}>
            <Typography variant="subtitle1">
              Date range
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ paddingX: 3, paddingBottom: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start date"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
              }}
              />
            </LocalizationProvider>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Iconify icon="bx:bxs-calendar" />
            </Avatar>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End date"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
              }}
              />
            </LocalizationProvider>
            <LoadingButton variant="contained" color="primary" size="large" loading={isLoading} sx={{ ml: 1, width: '15%' }} onClick={
              () => {
                setIsLoading(true);
                handleGenerateReport();
              }
            }>
              Generate
            </LoadingButton>
          </Stack>
        </Card>

        <Typography variant="h4" sx={{ my: 5 }}>
          Reports
        </Typography>

        <Card>
          <ListToolbar filterDate={filterDate} onFilterName={handleFilterByDate} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={reports.length}
                  onRequestSort={handleRequestSort}
                />
                {/* Tiene que cargar primero... */}
                {reports.length > 0 ? (
                  <TableBody>
                    {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, type, start_date: startDate, end_date: endDate, user } = row;

                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox">

                          <TableCell align="left">{user.full_name}</TableCell>
                          <TableCell component="th" scope="row" padding="normal">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {type === 'm' ? 'Month' : 'Annual'}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell align="left">{startDate}</TableCell>

                          <TableCell align="left">{endDate}</TableCell>
                          <TableCell align="right">
                            <a
                              style={{ textDecoration: 'none', color: 'inherit' }}
                              target="_blank"
                              href={`${config.APPBACK_URL}/api/reports/${id}/download`}
                              rel="noreferrer"
                            >
                              <IconButton size="large" color="inherit">
                                <Iconify icon="bx:bxs-file-pdf" />
                              </IconButton>
                            </a>

                            <IconButton size="large" color="error" onClick={() => handleDeleteReport(id)}>
                              <Iconify icon="bx:bxs-trash" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                )
                  :
                  (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <Paper
                            sx={{
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="h6" paragraph>
                              No results found
                            </Typography>

                            <Typography variant="body2">
                              Please <strong>reload</strong> the page.
                            </Typography>
                          </Paper>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )
                }


                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterDate}&quot;</strong>.
                            <br /> Try to check for errors or use complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reports.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>


      {/* Toastify */}

      <ToastContainer />
    </>
  )
}
