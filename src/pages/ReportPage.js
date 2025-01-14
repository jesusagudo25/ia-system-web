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
  DialogActions,
  Button,
  Slide,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';

// components
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// date-fns
import { differenceInDays, format, parseISO, lastDayOfMonth, lastDayOfYear } from 'date-fns';
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

  /* Date range */

  const [startDate, setStartDate] = useState(new Date(`${format(new Date(), 'yyyy-MM-01')}T00:00:00`));
  const [endDate, setEndDate] = useState(new Date(`${format(lastDayOfMonth(new Date()), 'yyyy-MM-dd')}T00:00:00`));
  const [typeOfPerson, setTypeOfPerson] = useState('All');

  /* Reports */

  const [reports, setReports] = useState([]);

  const [languages, setLanguages] = useState([]);

  const [language, setLanguage] = useState('');

  const [report, setReport] = useState({});

  const [file, setFile] = useState({});

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('start_date');

  const [filterDate, setFilterDate] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isLoading, setIsLoading] = useState(false);

  const [openReport, setOpenReport] = useState(false);

  const [openFile, setOpenFile] = useState(false);

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

    if (differenceInDays(endDate, startDate) < 0) {
      toast.error('The start date must be less than the end date');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${config.APPBACK_URL}/api/reports`, {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        type_of_person: typeOfPerson,
        language_id: language,
        report_id: report.id,
        user_id: localStorage.getItem('id'),
      });
      setOpenFile(true);
      setFile(response.data);
      toast.success('Report generated successfully');
      setStartDate(new Date(`${format(new Date(), 'yyyy-MM-01')}T00:00:00`));
      setEndDate(new Date(`${format(lastDayOfMonth(new Date()), 'yyyy-MM-dd')}T00:00:00`));
      setTypeOfPerson('All');
      setLanguage('');
      setOpenReport(false);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      toast.error('Error generating report');
      setIsLoading(false);
    }
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

  const getLenguages = () => {
    setIsLoading(true);
    axios.get('/api/lenguages/status')
      .then((response) => {
        setLanguages(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        toast.error('Error to get lenguages', {
          position: toast.POSITION.TOP_RIGHT
        });
      }
      );
  }

  useEffect(() => {
    getReports();
    getLenguages();
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
            maxWidth='md'
            fullScreen={lgDown}
          >
            <DialogTitle id="alert-dialog-title">
              {report.title}
            </DialogTitle>
            <DialogContent dividers>

              <Card>
                <Stack
                  direction="column"
                  sx={{

                    width: '100%',
                  }}
                >
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
                          views={JSON.parse(report.filters).date}
                          onChange={(newValue) => {
                            //Tomar en cuenta el views, si es month, year: llevarlo al primer dia del mes. Si es year, llevarlo al primer dia del año
                            if (JSON.parse(report.filters).date[0] === 'year') {
                              setStartDate(new Date(`${format(newValue, 'yyyy-01-01')}T00:00:00`));
                            } else {
                              setStartDate(new Date(`${format(newValue, 'yyyy-MM-01')}T00:00:00`));
                            }
                          }}

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
                          views={JSON.parse(report.filters).date}
                          onChange={(newValue) => {
                            //Tomar en cuenta el views, si es month, year: llevarlo al primer dia del mes. Si es year, llevarlo al primer dia del año
                            if (JSON.parse(report.filters).date[0] === 'year') {
                              // Obtén el último día del año seleccionado
                              setEndDate(new Date(`${format(lastDayOfYear(newValue), 'yyyy-MM-dd')}T00:00:00`));
                            } else {
                              // Obtén el último día del mes seleccionado
                              setEndDate(new Date(`${format(lastDayOfMonth(newValue), 'yyyy-MM-dd')}T00:00:00`));
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </FormControl>

                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ paddingLeft: 3, paddingBottom: 2 }}>
                    <Typography variant="subtitle1">
                      Type of person
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ paddingX: 3, paddingBottom: 3, flexWrap: 'wrap', gap: 2, flexDirection: lgDown ? 'column' : 'row' }}>
                    <FormControl>
                      <RadioGroup
                        aria-labelledby="action-request-label"
                        defaultValue="Cancel"
                        name="radio-buttons-group"
                      >
                        {JSON.parse(report.filters).type_of_person.map((item, index) => (
                          <FormControlLabel
                            key={index}
                            value={item}
                            control={<Radio />}
                            label={item}
                            checked={typeOfPerson === item}
                            onChange={() => setTypeOfPerson(item)}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Stack>

                  {
                    ['All', 'Interpreter'].includes(typeOfPerson) && (
                      <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ paddingLeft: 3, paddingBottom: 2 }}>
                          <Typography variant="subtitle1">
                            Interpreter
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ paddingX: 3, paddingBottom: 3, flexWrap: 'wrap', gap: 2, flexDirection: lgDown ? 'column' : 'row' }}>
                          {
                            JSON.parse(report.filters).interpreter.map((item, index) => (
                              <>
                                {
                                  item === 'Language' ? (
                                    <FormControl
                                      sx={{ width: lgDown ? '100%' : '40%' }}
                                    >
                                      <InputLabel id="language-select-label"
                                        sx={{ width: 400 }}
                                      >Language</InputLabel>
                                      <Select
                                        labelId="language-select-label"
                                        id="language-select"
                                        value={language}
                                        label="Language"
                                        onChange={(event) => setLanguage(event.target.value)}
                                      >
                                        {
                                          languages.map((item, index) => (
                                            <MenuItem key={index} value={item.id}>{item.name}</MenuItem>
                                          ))
                                        }
                                      </Select>
                                    </FormControl>
                                  ) : (
                                    <FormControl
                                      sx={{ width: lgDown ? '100%' : '40%' }}
                                    >
                                      <TextField
                                        id={item}
                                        label={item}
                                        variant="outlined"
                                        placeholder={`Enter the ${item} of the interpreter`}
                                      />
                                    </FormControl>
                                  )
                                }


                                {(index !== JSON.parse(report.filters).interpreter.length - 1) && (
                                  <Avatar
                                    sx={{
                                      bgcolor: 'primary.main',
                                      color: 'primary.contrastText',
                                      width: 40,
                                    }}
                                  >
                                    <span>OR</span>
                                  </Avatar>
                                )}
                              </>
                            ))
                          }
                        </Stack>
                      </>
                    )
                  }

                </Stack>
              </Card>
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
                  setTypeOfPerson('All');
                  setLanguage('');
                  setStartDate(new Date(`${format(new Date(), 'yyyy-MM-01')}T00:00:00`));
                  setEndDate(new Date(`${format(lastDayOfMonth(new Date()), 'yyyy-MM-dd')}T00:00:00`));
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
                onClick={handleGenerateReport}
              >
                Generate
              </Button>

            </DialogActions>
          </Dialog>
        )
      }

      {/* Dialog - File result */}
      {
        file && Object.keys(file).length > 0 && (
          <Dialog
            open={openFile}
            TransitionComponent={Transition}
            keepMounted
            aria-describedby="alert-dialog-slide-description"
            fullWidth
            maxWidth='sm'
            fullScreen={lgDown}
          >
            <DialogTitle id="alert-dialog-title">
              {report.title}
            </DialogTitle>
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

                <Typography variant="h4" sx={{
                  fontWeight: '600',
                  marginTop: 2,
                }}>Report generated successfully</Typography>

                <Typography variant="h6" sx={{
                  marginY: 2,
                  fontWeight: '400'
                }}>You can download the report in PDF format</Typography>

                <a
                  href={`${config.APPBACK_URL}/api/reports/files/${file.name}`}
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
                  setOpenFile(false);
                  setFile({});
                }}
              >
                Close
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
