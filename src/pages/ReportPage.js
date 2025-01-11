import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
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
  Breadcrumbs,
  Link,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Slide,
  Box,
  FormControl,
} from '@mui/material';

// components
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// date-fns
import { differenceInDays, format, parseISO } from 'date-fns';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

import useResponsive from '../hooks/useResponsive';

// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import config from '../config.json';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'create', label: 'Date of creation', alignRight: false },
  { id: '' },
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
    /* Se debe cambiar la fecha, para que sea la que se presenta en el start date del reporte */
    return filter(array, (_report) => _report.start_date.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

// ----------------------------------------------------------------------

export const ReportPage = () => {

  const lgDown = useResponsive('down', 'lg');

  /* Reports */

  const [reports, setReports] = useState([]);

  const [report, setReport] = useState({});

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('start_date');

  const [filterDate, setFilterDate] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isLoading, setIsLoading] = useState(false);

  const [openReport, setOpenReport] = useState(false);

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

  /* const handleGenerateReport = async () => {

    setIsLoading(true);

    const difference = differenceInDays(endDate, startDate);
    let type = 'a';

    if (difference >= 300 && difference <= 364) {
      type = 'm';
    }
    else if (difference > 364) {
      type = 'a';
    }
    else {
      toast.error('Error generating report');
      setIsLoading(false);
      type = null;
    };

    if (type) {
      try {
        const response = await axios.post(`${config.APPBACK_URL}/api/reports`, {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          type,
          user_id: localStorage.getItem('id'),
        });
        setOpenReport(true)
        setReport(response.data);
        toast.success('Report generated successfully');
        setStartDate(new Date(`${format(new Date(), 'yyyy-01-01')}T00:00:00`));
        setEndDate(new Date(`${format(new Date(), 'yyyy-12-31')}T00:00:00`));
        getReports();
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        toast.error('Error generating report');
        setIsLoading(false);
      }
    }


  }; */

  /* const handleClickDelete = (id) => {
    setOpenDelete(true);
    setCurrentId(id);
  }; */

  /*   const handleDeleteReport = async () => {
      setIsLoading(true);
      setOpenDelete(false);
      try {
        const response = await axios.delete(`${config.APPBACK_URL}/api/reports/${currentId}`);
        toast.success('Report deleted successfully');
        getReports();
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        toast.error('Error deleting report');
        setIsLoading(false);
      }
    }; */

  /*   const handleClose = () => {
      setOpenDelete(false);
      setCurrentId(null);
    }; */

  const getReports = async () => {

    setIsLoading(true);
    try {
      const response = await axios.get(`${config.APPBACK_URL}/api/reports`);
      setReports(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
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
        {/*
        <Typography variant="h4" sx={{ mb: 5, mt: 3 }}>
          Generate
        </Typography>

         <Card>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ paddingLeft: 3, paddingTop: 3, paddingBottom: 2 }}>
            <Typography variant="subtitle1">
              Date range
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ paddingX: 3, paddingBottom: 3, flexWrap: 'wrap', gap: 2, flexDirection: lgDown ? 'column' : 'row' }}>
            <FormControl sx={{ width: lgDown ? '100%' : '37%' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start date"
                  value={startDate}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                  }}
                  format='MM/dd/yyyy'
                />
              </LocalizationProvider>
            </FormControl>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Iconify icon="bx:bxs-calendar" />
            </Avatar>

            <FormControl sx={{ width: lgDown ? '100%' : '37%' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End date"
                  value={endDate}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                  }}
                  format='MM/dd/yyyy'
                />
              </LocalizationProvider>
            </FormControl>
            <LoadingButton variant="contained" color="primary" size="large" loading={isLoading}
              sx={{ ml: 1, width: lgDown ? '100%' : '15%' }}
              onClick={
                () => {
                  setIsLoading(true);
                  handleGenerateReport();
                }
              }>
              Generate
            </LoadingButton>
          </Stack>
        </Card> */}

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
                      const { id, title, description, created_at: create, filters } = row;

                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox">

                          <TableCell component="th" scope="row" padding="normal">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {title}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell component="th" scope="row" padding="normal">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              {description}
                            </Stack>
                          </TableCell>

                          <TableCell align="left">
                            {format(parseISO(create), 'dd/MM/yyyy')}
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={2}>
                              <IconButton size="large" color="primary"
                                onClick={() => {
                                  setOpenReport(true);
                                  setReport(row);
                                }}
                              >
                                <Iconify icon="bx:bxs-show" />
                                <Typography variant="caption">View</Typography>
                              </IconButton>
                            </Stack>
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

      {/* Dialog - Report result */}
      {
        report && Object.keys(report).length > 0 && (
          <Dialog
            open={openReport}
            TransitionComponent={Transition}
            keepMounted
            aria-describedby="alert-dialog-slide-description"
            fullWidth
            maxWidth='sm'
          >
            <DialogContent dividers>

              <Stack
                direction="column"
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >

              </Stack>

            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                variant="contained"
                size='large'
                sx={{
                  margin: 2,
                }}
                onClick={() => {
                  setOpenReport(false);
                  setReport({});
                }}
              >
                Close
              </Button>

              <Button
                variant="contained"
                size='large'
                sx={{
                  margin: 2,
                }}
                onClick={() => {
                  setOpenReport(false);
                  setReport({});
                }}
              >
                Generate
              </Button>

            </DialogActions>
          </Dialog>
        )
      }


      {/* Toastify */}

      <ToastContainer />

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}
