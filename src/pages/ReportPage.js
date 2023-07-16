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
} from '@mui/material';

// components
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// date-fns
import { differenceInDays, format, lastDayOfMonth, parseISO } from 'date-fns';
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

// ----------------------------------------------------------------------

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export const ReportPage = () => {


  /* Report */
  const [startDate, setStartDate] = useState(new Date(`${format(new Date(), 'yyyy-01-01')}T00:00:00`));
  const [endDate, setEndDate] = useState(new Date(`${format(new Date(), 'yyyy-12-31')}T00:00:00`));

  /* Reports */

  const [reports, setReports] = useState([]);

  const [report, setReport] = useState({});

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('start_date');

  const [filterDate, setFilterDate] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isLoading, setIsLoading] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  const [openReport, setOpenReport] = useState(false);

  const [currentId, setCurrentId] = useState(null);

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

    setIsLoading(true);

    /* Get differenceInDays */

    const difference = differenceInDays(endDate, startDate);
    let type = 'a';

    console.log(difference);
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


  };

  const handleClickDelete = (id) => {
    setOpenDelete(true);
    setCurrentId(id);
  };

  const handleDeleteReport = async () => {
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
  };

  const handleClose = () => {
    setOpenDelete(false);
    setCurrentId(null);
  };

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
                format='MM/dd/yyyy'
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
                format='MM/dd/yyyy'
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

                          <TableCell align="left">{format(parseISO(`${startDate.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')}</TableCell>

                          <TableCell align="left">{format(parseISO(`${endDate.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')}</TableCell>
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

                            <IconButton size="large" color="error" onClick={() => handleClickDelete(id)}>
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

      {/* Dialog - Report result */}
      {
        report ? (
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
                <Box sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Iconify icon="mdi:check-circle" color="#4caf50" width="130px" height="130px" />
                </Box>

                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1,
                    marginTop: 1,
                  }}
                >
                  {/* Details */}
                  <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>Report type:</Typography>

                  <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>{report.type === 'm' ? 'Month' : 'Annual'}</Typography>

                </Stack>

                <Typography variant="h4" sx={{
                  fontWeight: '600',
                  marginTop: 2,
                }}>Report generated successfully</Typography>

                <Typography variant="h6" sx={{
                  marginY: 2,
                  fontWeight: '400'
                }}>You can download the report in PDF format</Typography>

                <a
                  href={`${config.APPBACK_URL}/api/reports/${report.id}/download/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="contained"
                    size='large'
                    sx={{
                      width: '100%',
                    }}
                    color="error"
                    startIcon={<Iconify icon="mdi:file-pdf" />}
                  >
                    Download
                  </Button>
                </a>

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
                }}
              >Close</Button>
            </DialogActions>
          </Dialog>
        ) : null
      }

      {/* Dialog - delete */}

      <Dialog
        open={openDelete}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm action"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleDeleteReport} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>


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
