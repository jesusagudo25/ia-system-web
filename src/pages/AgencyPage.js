import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
// @mui
import { LoadingButton } from '@mui/lab';
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
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
  Backdrop,
  CircularProgress,
} from '@mui/material';

// components
import CloseIcon from '@mui/icons-material/Close';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// date-fns

// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import config from '../config.json';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'address', label: 'Address', alignRight: false },
  { id: 'city', label: 'City', alignRight: false },
  { id: 'state', label: 'State', alignRight: false },
  { id: 'zip_code', label: 'Zip Code', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
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
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
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
    return filter(array, (_agency) => _agency.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export const AgencyPage = () => {
  /* Toastify */

  const showToastMessage = () => {
    if (!id) toast.success('¡New agency created!', {
      position: toast.POSITION.TOP_RIGHT
    });
    else toast.success('¡Agency updated!', {
      position: toast.POSITION.TOP_RIGHT
    });
  };

  const showToastMessageStatus = (type, message) => {
    if (type === 'success') {
      toast.success(message, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
    else {
      toast.error(message, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  };

  /* useForm */

  const { control, handleSubmit, reset, setValue, getValues, formState: { errors }, } = useForm({
    reValidateMode: 'onBlur'
  });

  /* Description */

  const [id, setId] = useState('');

  const [agencies, setAgencies] = useState([]);

  const [states, setStates] = useState([]);

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

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

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const getAgencies = async () => {
    try {
      const response = await axios.get(`${config.APPBACK_URL}/api/agencies`);
      setAgencies(response.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  /* --------------------------- */
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
      await axios.put(`${config.APPBACK_URL}/api/agencies/${id}`, { name: event.name, phone_number: event.phone_number, email: event.email, address: event.address, city: event.city, state: event.state, zip_code: event.zip_code }).then((response) => {
        setIsLoading(false);
      }).catch((error) => {
        setIsLoading(false);
      });
    } else {
      await axios.post(`${config.APPBACK_URL}/api/agencies`, { name: event.name, phone_number: event.phone_number, email: event.email, address: event.address, city: event.city, state: event.state, zip_code: event.zip_code }).then((response) => {
        setIsLoading(false);
      }
      ).catch((error) => {
        setIsLoading(false);
      }
      );
    }

    showToastMessage();

    reset();
    handleCloseDialog();
    getAgencies();
  };

  const getStates = () => {
    axios.get('https://api.countrystatecity.in/v1/countries/US/states', {
      headers: {
        'X-CSCAPI-KEY': 'N3NXRVN4V1Y1YVJmSTd6ZHR3b1NlMDlMRkRRVFQ2c0JWWmcxbmNUWg=='
      }
    })
      .then((response) => {
        const states = response.data.map((item) => {
          return {
            name: item.name,
            iso2: item.iso2,
          }
        }).sort((a, b) => a.name.localeCompare(b.name));
        setStates(states);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      }
      );
  }

  useEffect(() => {
    setIsLoading(true);
    getAgencies();
    getStates();
  }, []);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - agencies.length) : 0;

  const filteredAgencies = applySortFilter(agencies, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredAgencies.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Agencies | IA System </title>
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
            Manage
          </Link>
          <Link
            underline='hover'
            color="inherit"
            href="#"
          >
            Agencies
          </Link>
        </Breadcrumbs>



        <Stack direction="row" alignItems="center" justifyContent="space-between" my={5}>
          <Typography variant="h4">
            Agencies
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleCreateDialog}>
            New Agency
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
                  rowCount={agencies.length}
                  onRequestSort={handleRequestSort}
                />
                {/* Tiene que cargar primero... */}
                {agencies.length > 0 ? (
                  <TableBody>
                    {filteredAgencies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, name, email, phone_number: phoneNumber, address, city, state, zip_code: zipCode, status } = row;

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
                            {email}
                          </TableCell>

                          <TableCell align="left">
                            {address}
                          </TableCell>

                          <TableCell align="left">
                            {city}
                          </TableCell>

                          <TableCell align="left">
                            {state}
                          </TableCell>

                          <TableCell align="left">
                            {zipCode}
                          </TableCell>

                          <TableCell align="left">
                            <ButtonSwitch checked={status} inputProps={{ 'aria-label': 'ant design' }} onClick={
                              async () => {
                                setIsLoading(true);
                                if (status) (
                                  showToastMessageStatus('error', 'Agency off')
                                )
                                else (
                                  showToastMessageStatus('success', 'Agency on')
                                )
                                setAgencies(agencies.map(agency => agency.id === id ? { ...agency, status: !status } : agency));
                                await axios.put(`/api/agencies/${id}`, { status: !status }).then((response) => {
                                  setIsLoading(false);
                                }).catch((error) => {
                                  setIsLoading(false);
                                }
                                );
                              }
                            } />
                          </TableCell>

                          <TableCell align="right">
                            <IconButton size="large" color="inherit" onClick={
                              () => {
                                setId(id);
                                setValue('name', name);
                                setValue('email', email);
                                setValue('phone_number', phoneNumber);
                                setValue('address', address);
                                setValue('city', city);
                                setValue('state', state);
                                setValue('zip_code', zipCode);
                                setOpen(true);
                              }
                            }>
                              <Iconify icon={'mdi:pencil-box'} />
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
                        <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
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
                      <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
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
            count={agencies.length}
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
        maxWidth='sm'
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleCloseDialog}>
          Manage Agency
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ minWidth: 550 }}>

            <FormControl sx={{ width: '100%' }}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                  minLength: {
                    value: 3,
                    message: 'The name must have a minimum of 3 characters'
                  },
                  maxLength: {
                    value: 30,
                    message: 'The name must have a maximum of 30 characters'
                  }
                }}
                render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
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
                name="email"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                  pattern: {
                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
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
                name="phone_number"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                }}
                render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label="Phone number"
                    name="phone_number"
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
                name="address"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                }}
                render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
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
                name="city"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                }}
                render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
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

            <FormControl size="small" error={!!errors?.state}>
              <InputLabel id="state-select-label">State</InputLabel>
              <Controller
                name="state"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                }}
                render={({ field: { onChange, onBlur, value, } }) => (
                  <Select
                    labelId="state-select-label"
                    id="state-select"
                    value={value}
                    label="State"
                    onChange={onChange}
                    onBlur={onBlur}
                    required
                  >
                    {
                      states.map((state) => (
                        <MenuItem key={state.iso2} value={state.name}>{state.name}</MenuItem>
                      ))
                    }
                  </Select>
                )}
              />
              <FormHelperText>{errors?.state?.message}</FormHelperText>
            </FormControl>

            <FormControl sx={{ width: '100%' }}>
              <Controller
                name="zip_code"
                control={control}
                defaultValue=""
                rules={{
                  required: 'This field is required',
                }}
                render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    label="Zip code"
                    name="zip_code"
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
          <Button size="large" onClick={handleCloseDialog}  >
            Cancel
          </Button>
          <Button size="large" autoFocus onClick={handleSubmit(handleSubmitDialog)}>
            Save
          </Button>
        </DialogActions>
      </BootstrapDialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}
