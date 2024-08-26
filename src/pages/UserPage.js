import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
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
  Backdrop,
  CircularProgress,
  TextField,
  Button,
  DialogTitle,
  styled,
  Switch,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  Breadcrumbs,
  Link,
  FormHelperText,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
// date-fns
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// date-fns

// sections
import config from '../config.json';

// Sections - Se debe reempazar el nombre del componente por uno mas general
import { ListHead, ListToolbar } from '../sections/@dashboard/table';

const TABLE_HEAD = [
  { id: 'full_name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
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

/* -------------------> */

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
    return filter(array, (_user) => _user.full_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export const UserPage = () => {

  /* Toastify */

  const showToastMessage = () => {
    if (!id) toast.success('¡New User created!', {
      position: toast.POSITION.TOP_RIGHT
    });
    else toast.success('¡User updated!', {
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

  /* User */

  const [id, setId] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [containerPassword, setContainerPassword] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showPassword, setshowPassword] = useState(true);
  const [errors, setErrors] = useState({});

  /* Db */

  const [users, setUsers] = useState([]);

  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDialog = (event) => {
    setOpen(true);
    setId('');
    setName('');
    setEmail('');
    setPassword('abc123');
    setShowCreate(true);
    setContainerPassword(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setErrors({});
  };

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

  const getUsers = async () => {
    const response = await axios.get('/api/users');
    setIsLoading(false);
    setUsers(response.data);
  }

  useEffect(() => {
    setIsLoading(true);
    getUsers();
  }, []);

  const handleSubmitDialog = async () => {
    const displayErrors = {};
    const passwordRegex = /^^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]/;
    setIsLoading(true);
    if (id) {
      if (containerPassword) {
        if(password === '') {
          displayErrors.password = 'Password is required';
        }
        else if (!passwordRegex.test(password)) {
          displayErrors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase and one number';
        }

        if (Object.keys(displayErrors).length > 0) {
          setErrors(displayErrors);
          setIsLoading(false);
          return;
        }
        await axios.put(`/api/users/${id}/password`, {
          password,
        }).then((res) => {
          setIsLoading(false);
        }).catch((err) => {
          console.log(err);
        }
        );
      }
      else {
        if (name === '') {
          displayErrors.name = 'Name is required';
        }
        if (email === '') {
          displayErrors.email = 'Email is required';
        }
        if (Object.keys(displayErrors).length > 0) {
          setErrors(displayErrors);
          setIsLoading(false);
          return;
        }
        await axios.put(`/api/users/${id}`, {
          'full_name': name, // 'full_name' es el nombre del campo en la base de datos, 'name' es el nombre del campo en el formulario
          email,
        }).then((res) => {
          setIsLoading(false);
        }
        ).catch((err) => {
          console.log(err);
        }
        );
      }
    } else {

      if (name === '') {
        displayErrors.name = 'Name is required';
      }
      if (email === '') {
        displayErrors.email = 'Email is required';
      }
      if (password === '') {
        displayErrors.password = 'Password is required';
      }
      else if (!passwordRegex.test(password)) {
        console.log('password', password);
        displayErrors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase and one number';
      }
      
      if (Object.keys(displayErrors).length > 0) {
        setErrors(displayErrors);
        setIsLoading(false);
        return;
      }
      await axios.post('/api/users', {
        'full_name': name, // 'full_name' es el nombre del campo en la base de datos, 'name' es el nombre del campo en el formulario
        email,
        password,
      }).then((res) => {
        setIsLoading(false);
      }
      ).catch((err) => {
        console.log(err);
      }
      );
    }
    handleCloseDialog();
    showToastMessage();
    getUsers();
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Users | IA System </title>
      </Helmet>

      <Container>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard/app">
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard/manage"
          >
            Manage
          </Link>
          <Link
            underline='hover'
            color="inherit"
            href="#"
          >
            Users
          </Link>
        </Breadcrumbs>
        <Stack direction="row" alignItems="center" justifyContent="space-between" my={5}>
          <Typography variant="h4" gutterBottom>
            Users
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleCreateDialog}>
            New User
          </Button>
        </Stack>

        <Card>
          <ListToolbar filterName={filterName} onFilterName={handleFilterByName} PlaceHolder={"Buscar usuario..."} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={users.length}
                  onRequestSort={handleRequestSort}
                />
                {/* Tiene que cargar primero... */}
                {users.length > 0 ? (
                  <TableBody>
                    {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, full_name: fullName, status, email } = row;

                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox">

                          <TableCell component="th" scope="row" padding="normal">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {fullName}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell align="left">
                            {email}
                          </TableCell>

                          <TableCell align="left">
                            <ButtonSwitch checked={status} inputProps={{ 'aria-label': 'ant design' }} onClick={
                              async () => {
                                setIsLoading(true);
                                if (status) (
                                  showToastMessageStatus('error', 'User off')
                                )
                                else (
                                  showToastMessageStatus('success', 'User on')
                                )
                                setUsers(users.map((user) => {
                                  if (user.id === id) {
                                    return { ...user, status: !status };
                                  }
                                  return user;
                                }));
                                await axios.put(`/api/users/${id}`, {
                                  status: !status
                                });
                                setIsLoading(false);
                              }
                            } />
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" alignItems="center" spacing={2}>
                            <IconButton size="large" 
                              color="error"
                             onClick={() => {
                              setOpen(true);
                              setId(id);
                              setContainerPassword(true);
                              setShowCreate(false);
                              setPassword('');
                            }}>
                              <Iconify icon={'mdi:lock'} /> <Typography variant="caption">Password</Typography>
                            </IconButton>
                            <IconButton size="large" color="inherit" onClick={() => {
                              setOpen(true);
                              setId(id);
                              setName(fullName);
                              setEmail(email);
                              setShowCreate(false);
                              setContainerPassword(false);
                            }}>
                              <Iconify icon={'mdi:pencil-box'} /> <Typography variant="caption">Edit</Typography>
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
            count={users.length}
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
          Manage User
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={
            {
              minWidth: 550,
            }
          }>
            {
              showCreate ?
                (
                  <>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField id="outlined-basic" label="Name" variant="outlined" value={name} size="small" onChange={(event) => {
                        setName(event.target.value)}} error={errors.name} helperText={errors.name} />
                    </FormControl>

                    <FormControl sx={{ width: '100%' }}>
                      <TextField id="outlined-basic" label="Email" variant="outlined" value={email} size="small" onChange={
                        (event) => {
                          setEmail(event.target.value)
                        }
                      } error={errors.email} helperText={errors.email} />
                    </FormControl>

                    <FormControl sx={{ width: '100%' }} variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value)
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => {
                                setshowPassword(!showPassword)
                              }}
                              onMouseDown={(event) => {
                                event.preventDefault();
                              }}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Contraseña"
                        size='small'
                        error={errors.password}
                      />
                      <FormHelperText error={errors.password}>{errors.password}</FormHelperText>
                    </FormControl>
                  </>
                )
                :
                containerPassword ?
                  (
                    <FormControl sx={{ width: '100%' }} variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value)
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => {
                                setshowPassword(!showPassword)
                              }}
                              onMouseDown={(event) => {
                                event.preventDefault();
                              }}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Contraseña"
                        error={errors.password}
                      />
                      <FormHelperText error={errors.password}>{errors.password}</FormHelperText>
                    </FormControl>
                  )
                  :
                  (
                    <>
                      <FormControl sx={{ width: '100%' }}>
                        <TextField id="outlined-basic" label="Nombre" variant="outlined" value={name} size="small" onChange={(event) => {
                          setName(event.target.value)
                        }} error={errors.name} helperText={errors.name} />
                      </FormControl>

                      <FormControl sx={{ width: '100%' }}>
                        <TextField id="outlined-basic" label="Correo" variant="outlined" value={email} size="small" onChange={
                          (event) => {
                            setEmail(event.target.value)
                          }
                        } error={errors.email} helperText={errors.email} />
                      </FormControl>
                    </>
                  )
            }
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="large" onClick={handleCloseDialog}  >
            Cancel
          </Button>
          <Button size="large" autoFocus onClick={handleSubmitDialog} disabled={isLoading}>
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