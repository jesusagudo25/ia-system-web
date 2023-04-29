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
import { format, lastDayOfMonth } from 'date-fns';
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
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'start_date', label: 'Start date', alignRight: false },
  { id: 'end_date', label: 'End date', alignRight: false },
  { id: 'user', label: 'User', alignRight: false },
  { id: '' },
];

const options = [
  {
    value: 'f',
    label: 'Income per fortnight',
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
  /* Payrolls */

  const [reports, setReports] = useState([]);

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('start_date');

  const [filterDate, setFilterDate] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [itemSelected, setItemSelected] = useState(null);

  const [startDate, setStartDate] = useState(new Date());

  const [endDate, setEndDate] = useState(new Date());

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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reports.length) : 0;

  const filteredReports = applySortFilter(reports, getComparator(order, orderBy), filterDate);

  const isNotFound = !filteredReports.length && !!filterDate;
  return (
    <>
      <Helmet>
        <title> Payroll | IA System </title>
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
                renderInput={(params) => <TextField sx={
                  {
                    width: '30%',
                  }
                } {...params} />}
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
                renderInput={(params) => <TextField sx={
                  {
                    width: '30%',
                  }
                } {...params} />}
              />
            </LocalizationProvider>
            <LoadingButton variant="contained" color="primary" size="large" loading={isLoading} sx={{ ml: 1, width: '15%' }} onClick={
              () => {
                setIsLoading(true);
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
                      const { id, user, month, start_date: startDate, end_date: endDate, type } = row;

                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox">

                          <TableCell component="th" scope="row" padding="normal">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {month}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">
                            <Label color={type === 'g' ? 'success' : type === 'v' ? 'warning' : 'error'}>{sentenceCase(type === 'g' ? 'General' : type === 'v' ? 'Visitas' : 'Insumos')}</Label>
                          </TableCell>
                          <TableCell align="left">{user.name}</TableCell>

                          <TableCell align="left">{startDate}</TableCell>

                          <TableCell align="left">{endDate}</TableCell>

                          <TableCell align="right">
                            <IconButton size="large" color="inherit" onClick={(event) => {
                              setItemSelected(id);
                              setOpen(event.currentTarget);
                            }}>
                              <Iconify icon={'eva:more-vertical-fill'} />
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
    </>
  )
}
