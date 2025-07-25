import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogTitle,
  styled,
  Switch,
  FormControl,
  Breadcrumbs,
  Link,
  Backdrop,
  CircularProgress,
  Slide,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// components
import CloseIcon from '@mui/icons-material/Close';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// date-fns

// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import config from '../config.json';

import useResponsive from '../hooks/useResponsive';
import { SearchAgency } from '../sections/@manage/agency/SearchAgency';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'price_per_hour', label: 'Price per hour', alignRight: false },
  { id: 'price_per_hour_interpreter', label: 'Price per hour interpreter', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

const TABLE_HEAD_SPECIAL_PRICE = [
  { id: 'agency', label: 'Agency', alignRight: false, width: '40%' },
  { id: 'price_per_hour', label: 'Price per hour', alignRight: false, width: '17%' },
  { id: 'price_per_hour_interpreter', label: 'Price per hour interpreter', alignRight: false, width: '17%' },
  { id: '' },
];

/* --------------------> */

const ButtonSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}));

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

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
    return filter(array, (_lenguage) => _lenguage.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

function applySortFilterSpecialPrice(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_specialPrice) => _specialPrice.agency_name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

// ----------------------------------------------------------------------

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export const LenguagePage = () => {
  /* Toastify */

  const showToastMessage = () => {
    if (!id)
      toast.success('¡New lenguage created!', {
        position: toast.POSITION.TOP_RIGHT,
      });
    else
      toast.success('¡Lenguage updated!', {
        position: toast.POSITION.TOP_RIGHT,
      });
  };

  const showToastMessageSpecialPrice = (type) => {
    if (type === 'create')
      toast.success('¡New special price created!', {
        position: toast.POSITION.TOP_RIGHT,
      });
    else
      toast.success('¡Special price updated!', {
        position: toast.POSITION.TOP_RIGHT,
      });
  };

  const showToastMessageDelete = () => {
    toast.success('¡Special price deleted!', {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const showToastMessageError = (message) => {
    toast.error(message, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const showToastMessageStatus = (type, message) => {
    if (type === 'success') {
      toast.success(message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      toast.error(message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  /* useForm */

  const { control, handleSubmit, reset, setValue } = useForm({
    reValidateMode: 'onBlur',
  });

  const lgDown = useResponsive('down', 'lg');

  /* Languaje */

  const [id, setId] = useState('');

  const [lenguages, setLenguages] = useState([]);

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isLoading, setIsLoading] = useState(false);

  /* Agency */
  const [agencyName, setAgencyName] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [errors, setErrors] = useState({});

  /* Autocomplete agency */

  const handleOnChangeAgency = (agency) => {
    setAgencyId(agency.id);
  };

  /* Special prices */

  const [specialPrices, setSpecialPrices] = useState([]);

  const [openSpecialPrice, setOpenSpecialPrice] = useState(false);

  const [pageSpecialPrice, setPageSpecialPrice] = useState(0);

  const [orderSpecialPrice, setOrderSpecialPrice] = useState('asc');

  const [orderBySpecialPrice, setOrderBySpecialPrice] = useState('name');

  const [filterNameSpecialPrice, setFilterNameSpecialPrice] = useState('');

  const [rowsPerPageSpecialPrice, setRowsPerPageSpecialPrice] = useState(5);

  const [isLoadingSpecialPrice, setIsLoadingSpecialPrice] = useState(false);

  /* Datatable - Special Price */

  const handleRequestSortSpecialPrice = (event, property) => {
    const isAsc = orderBySpecialPrice === property && orderSpecialPrice === 'asc';
    setOrderSpecialPrice(isAsc ? 'desc' : 'asc');
    setOrderBySpecialPrice(property);
  };

  const handleChangePageSpecialPrice = (event, newPage) => {
    setPageSpecialPrice(newPage);
  };

  const handleChangeRowsPerPageSpecialPrice = (event) => {
    setPageSpecialPrice(0);
    setRowsPerPageSpecialPrice(parseInt(event.target.value, 10));
  };

  const handleFilterByNameSpecialPrice = (event) => {
    setPageSpecialPrice(0);
    setFilterNameSpecialPrice(event.target.value);
  };

  /* Datatable - Lenguage */

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

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  /* --------------------------- Special Price --------------------------- */

  const getSpecialPrices = async (languageId) => {
    setIsLoadingSpecialPrice(true);
    try {
      const response = await axios.get(`${config.APPBACK_URL}/api/lenguages/special-price/${languageId}`);
      setSpecialPrices(response.data?.lenguage?.agenciesWithSpecialPrices);
      setIsLoadingSpecialPrice(false);
      setOpenSpecialPrice(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseDialogSpecialPrice = (id = '') => {
    setOpenSpecialPrice(false);
    setSpecialPrices([]);
    setPageSpecialPrice(0);
    setOrderSpecialPrice('asc');
    setOrderBySpecialPrice('name');
    setFilterNameSpecialPrice('');
    setRowsPerPageSpecialPrice(5);
    setIsLoadingSpecialPrice(false);
    setAgencyId('');
    setAgencyName('');
    setErrors({});
    setId(id);
  };

  const handleSubmitDialogSpecialPrice = async (event) => {
    setErrors({});

    if (agencyId) {
      setIsLoadingSpecialPrice(true);

      const apiUrl = `${config.APPBACK_URL}/api/lenguages/special-price`;
      const payload = {
        lenguage_id: id,
        agency_id: agencyId,
        price_per_hour: 0,
        price_per_hour_interpreter: 0,
      };

      try {
        await axios.post(apiUrl, payload);
        showToastMessageSpecialPrice('create');
      } catch (error) {
        showToastMessageError(error.response?.data?.message || 'An error occurred');
      } finally {
        setIsLoadingSpecialPrice(false);
        reset();
        handleCloseDialogSpecialPrice(id);
        getSpecialPrices(id);
      }
    } else {
      showToastMessageError('Please select an agency');
      setErrors({
        agency: 'Please select an agency',
      });
    }
  };

  const handleUpdateSpecialPrice = async (agencyId) => {
    setIsLoadingSpecialPrice(true);

    const specialPriceResult = specialPrices.find((item) => item.agency_id === agencyId);

    if (specialPriceResult) {
      const apiUrl = `${config.APPBACK_URL}/api/lenguages/special-price/${id}`;
      const payload = {
        agency_id: agencyId,
        price_per_hour: specialPriceResult.price_per_hour,
        price_per_hour_interpreter: specialPriceResult.price_per_hour_interpreter,
      };

      try {
        await axios.put(apiUrl, payload);
        showToastMessageSpecialPrice('update');
      } catch (error) {
        showToastMessageError(error.response?.data?.message || 'An error occurred');
      } finally {
        setIsLoadingSpecialPrice(false);
        reset();
        handleCloseDialogSpecialPrice(id);
        getSpecialPrices(id);
      }
    } else {
      showToastMessageError('Special price not found');
      setIsLoadingSpecialPrice(false);
    }
  };

  const handleUpdateDataSpecialPrice = (agencyId, field, value) => {
    setSpecialPrices((prevData) =>
      prevData.map((item) => {
        if (item.agency_id === agencyId) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      })
    );
  };

  const handleDeleteSpecialPrice = async (agencyId) => {
    if (window.confirm('Are you sure you want to delete this special price?')) {
      setIsLoadingSpecialPrice(true);
      try {
        await axios.delete(`${config.APPBACK_URL}/api/lenguages/special-price/${id}`, {
          data: { agency_id: agencyId },
        });
        showToastMessageDelete();
        setSpecialPrices((prev) => prev.filter((item) => item.agency_id !== agencyId));
      } catch (error) {
        showToastMessageError(error.response?.data?.message || 'An error occurred');
      } finally {
        setIsLoadingSpecialPrice(false);
      }
    }
  };

  /* --------------------------- LENGUAGES --------------------------- */
  const getLenguages = async () => {
    try {
      const response = await axios.get(`${config.APPBACK_URL}/api/lenguages`);
      setLenguages(response.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateDialog = (event) => {
    setOpen(true);
    setId('');
    reset();
  };

  const handleCloseDialog = () => {
    setOpen(false);
    reset();
  };

  const handleSubmitDialog = async (event) => {
    setIsLoading(true);
    if (id) {
      await axios
        .put(`${config.APPBACK_URL}/api/lenguages/${id}`, {
          name: event.name,
          price_per_hour: event.price_per_hour,
          price_per_hour_interpreter: event.price_per_hour_interpreter,
        })
        .then((response) => {
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
        });
    } else {
      await axios
        .post(`${config.APPBACK_URL}/api/lenguages`, {
          name: event.name,
          price_per_hour: event.price_per_hour,
          price_per_hour_interpreter: event.price_per_hour_interpreter,
        })
        .then((response) => {
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
        });
    }

    showToastMessage();

    reset();
    handleCloseDialog();
    getLenguages();
  };

  useEffect(() => {
    setIsLoading(true);
    getLenguages();
  }, []);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - lenguages.length) : 0;

  const filteredLenguages = applySortFilter(lenguages, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredLenguages.length && !!filterName;

  /* Special prices */

  const emptyRowsSpecialPrice =
    pageSpecialPrice > 0 ? Math.max(0, (1 + pageSpecialPrice) * rowsPerPageSpecialPrice - specialPrices.length) : 0;

  const filteredSpecialPrices = applySortFilterSpecialPrice(
    specialPrices,
    getComparator(orderSpecialPrice, orderBySpecialPrice),
    filterNameSpecialPrice
  );

  const isNotFoundSpecialPrice = !filteredSpecialPrices.length && !!filterNameSpecialPrice;

  return (
    <>
      <Helmet>
        <title> Languages | IA System </title>
      </Helmet>

      <Container>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard/app">
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/dashboard/manage">
            Manage
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Languages
          </Link>
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" justifyContent="space-between" my={5}>
          <Typography variant="h4">Languages</Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleCreateDialog}>
            New Language
          </Button>
        </Stack>

        <Card>
          <ListToolbar filterDate={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={lenguages.length}
                  onRequestSort={handleRequestSort}
                />
                {/* Tiene que cargar primero... */}

                {lenguages.length > 0 ? (
                  <TableBody>
                    {filteredLenguages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const {
                        id,
                        name,
                        price_per_hour: pricePerHour,
                        price_per_hour_interpreter: pricePerHourInterpreter,
                        status,
                      } = row;

                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox">
                          <TableCell component="th" scope="row" padding="normal">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {name}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell align="left">$ {pricePerHour}</TableCell>

                          <TableCell align="left">$ {pricePerHourInterpreter}</TableCell>

                          <TableCell align="left">
                            <ButtonSwitch
                              checked={status}
                              inputProps={{ 'aria-label': 'ant design' }}
                              onClick={async () => {
                                setIsLoading(true);
                                if (status) showToastMessageStatus('error', 'Lenguage off');
                                else showToastMessageStatus('success', 'Lenguage on');
                                setLenguages(
                                  lenguages.map((lenguage) =>
                                    lenguage.id === id ? { ...lenguage, status: !status } : lenguage
                                  )
                                );
                                await axios
                                  .put(`${config.APPBACK_URL}/api/lenguages/${id}`, { status: !status })
                                  .then((response) => {
                                    setIsLoading(false);
                                  })
                                  .catch((error) => {
                                    setIsLoading(false);
                                  });
                              }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={2}>
                              <IconButton
                                size="large"
                                color="primary"
                                onClick={() => {
                                  handleCloseDialogSpecialPrice();

                                  setId(id);

                                  getSpecialPrices(id);
                                }}
                              >
                                <Iconify icon={'mdi:currency-usd'} />
                                <Typography variant="caption">Special Price</Typography>
                              </IconButton>
                              <IconButton
                                size="large"
                                color="inherit"
                                onClick={() => {
                                  setId(id);
                                  setValue('name', name);
                                  setValue('price_per_hour', pricePerHour);
                                  setValue('price_per_hour_interpreter', pricePerHourInterpreter);
                                  setOpen(true);
                                }}
                              >
                                <Iconify icon={'mdi:pencil-box'} />
                                <Typography variant="caption">Edit</Typography>
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
                ) : (
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
                )}

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
                            <strong>&quot;{filterName}&quot;</strong>.
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
            count={lenguages.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* Toastify */}

      <ToastContainer />

      {/* Dialog */}

      <BootstrapDialog
        onClose={handleCloseDialog}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="sm"
        fullScreen={lgDown}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleCloseDialog}>
          Manage Languages
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ minWidth: lgDown ? '' : 550 }}>
            <FormControl sx={{ width: '100%' }}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                  minLength: {
                    value: 3,
                    message: 'The name must have a minimum of 3 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'The name must have a maximum of 50 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    onChange={onChange}
                    onBlur={onBlur}
                    required
                    error={!!error}
                    helperText={error ? error.message : null}
                    value={value}
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </FormControl>

            <FormControl sx={{ width: '100%' }}>
              <Controller
                name="price_per_hour"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                }}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label="Price per hour"
                    name="price_per_hour"
                    onChange={onChange}
                    onBlur={onBlur}
                    required
                    error={!!error}
                    helperText={error ? error.message : null}
                    value={value}
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </FormControl>

            <FormControl sx={{ width: '100%' }}>
              <Controller
                name="price_per_hour_interpreter"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                }}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label="Price per hour interpreter"
                    name="price_per_hour_interpreter"
                    onChange={onChange}
                    onBlur={onBlur}
                    required
                    error={!!error}
                    helperText={error ? error.message : null}
                    value={value}
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="large" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button size="large" autoFocus onClick={handleSubmit(handleSubmitDialog)} disabled={isLoading}>
            Save
          </Button>
        </DialogActions>
      </BootstrapDialog>

      {/* Dialog - Special Price */}

      {Array.isArray(specialPrices) ? (
        <Dialog
          onClose={handleCloseDialogSpecialPrice}
          aria-labelledby="customized-dialog-title"
          open={openSpecialPrice}
          fullScreen={lgDown}
          TransitionComponent={Transition}
          keepMounted
          fullWidth
          maxWidth="md"
        >
          <DialogTitle id="alert-dialog-title">{'Special Prices'}</DialogTitle>
          <DialogContent dividers>
            <Card sx={{ marginBottom: 2 }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="form-add-new-line-content"
                  id="form-add-new-line-header"
                >
                  <Typography variant="subtitle1"> Add new special price</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <SearchAgency
                      handleOnChangeAgency={handleOnChangeAgency}
                      setAgencyName={setAgencyName}
                      agencyName={agencyName}
                      setAgencyId={setAgencyId}
                      errors={errors}
                      toast={toast}
                    />
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                      onClick={handleSubmitDialogSpecialPrice}
                    >
                      Add Special Price
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Card>
            <Divider sx={{ marginBottom: 2 }} />
            <Card>
              <ListToolbar filterDate={filterNameSpecialPrice} onFilterName={handleFilterByNameSpecialPrice} />

              <Scrollbar>
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <ListHead
                      order={orderSpecialPrice}
                      orderBy={orderBySpecialPrice}
                      headLabel={TABLE_HEAD_SPECIAL_PRICE}
                      rowCount={specialPrices.length}
                      onRequestSort={handleRequestSortSpecialPrice}
                    />
                    {specialPrices.length > 0 ? (
                      <TableBody>
                        {filteredSpecialPrices
                          .slice(
                            pageSpecialPrice * rowsPerPageSpecialPrice,
                            pageSpecialPrice * rowsPerPageSpecialPrice + rowsPerPageSpecialPrice
                          )
                          .map((row) => {
                            const {
                              agency_id: id,
                              agency_name: name,
                              price_per_hour: pricePerHour,
                              price_per_hour_interpreter: pricePerHourInterpreter,
                            } = row;

                            return (
                              <TableRow hover key={id} tabIndex={-1} role="checkbox">
                                <TableCell component="th" scope="row" padding="normal">
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="subtitle2" noWrap>
                                      {name}
                                    </Typography>
                                  </Stack>
                                </TableCell>

                                <TableCell align="left">
                                  <TextField
                                    value={specialPrices.find((item) => item.agency_id === id)?.price_per_hour}
                                    onChange={(e) => {
                                      handleUpdateDataSpecialPrice(id, 'price_per_hour', e.target.value);
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="left">
                                  <TextField
                                    value={
                                      specialPrices.find((item) => item.agency_id === id)?.price_per_hour_interpreter
                                    }
                                    onChange={(e) => {
                                      handleUpdateDataSpecialPrice(id, 'price_per_hour_interpreter', e.target.value);
                                    }}
                                  />
                                </TableCell>

                                <TableCell align="right">
                                  <IconButton
                                    size="large"
                                    color="error"
                                    onClick={() => {
                                      handleDeleteSpecialPrice(id);
                                    }}
                                  >
                                    <Iconify icon={'mdi:trash-can'} />
                                    <Typography variant="caption">Delete</Typography>
                                  </IconButton>
                                  <IconButton size="large" color="inherit" onClick={() => handleUpdateSpecialPrice(id)}>
                                    <Iconify icon={'material-symbols:save'} />
                                    <Typography variant="caption">Save</Typography>
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {emptyRowsSpecialPrice > 0 && (
                          <TableRow style={{ height: 53 * emptyRowsSpecialPrice }}>
                            <TableCell colSpan={4} />
                          </TableRow>
                        )}
                      </TableBody>
                    ) : (
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
                    )}

                    {isNotFoundSpecialPrice && (
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
                                <strong>&quot;{filterNameSpecialPrice}&quot;</strong>.
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
                count={specialPrices.length}
                rowsPerPage={rowsPerPageSpecialPrice}
                page={pageSpecialPrice}
                onPageChange={handleChangePageSpecialPrice}
                onRowsPerPageChange={handleChangeRowsPerPageSpecialPrice}
              />
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
              size="large"
              sx={{
                margin: 2,
              }}
              onClick={handleCloseDialogSpecialPrice}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoadingSpecialPrice}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};
