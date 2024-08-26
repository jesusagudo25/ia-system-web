import { Helmet } from 'react-helmet-async';
import { filter, set } from 'lodash';
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
  TableContainer,
  TablePagination,
  Breadcrumbs,
  Link,
  Backdrop, 
  CircularProgress,
} from '@mui/material';


import Scrollbar from '../components/scrollbar';

// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import config from '../config.json';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'comment', label: 'Comment', alignRight: false },
  { id: 'user', label: 'User', alignRight: false },
  { id: 'action', label: 'Action', alignRight: false },
  { id: 'payroll', label: 'Payroll', alignRight: false },
  { id: 'request', label: 'Request', alignRight: false },
  { id: 'created_at', label: 'Date', alignRight: false },

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
    return filter(array, (_log) => _log.action.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export const CAndRWizardLogPage = () => {

  /* Description */

  const [descriptions, setDescriptions] = useState([]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('desc');

  const [orderBy, setOrderBy] = useState('id');

  const [filterTitle, setFilterTitle] = useState('');

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
    setFilterTitle(event.target.value);
  };

  const getDescriptions = async () => {

    try {
      const response = await axios.get(`${config.APPBACK_URL}/api/car-wizard`);
      setDescriptions(response.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    setIsLoading(true);
    getDescriptions();
  }, []);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - descriptions.length) : 0;

  const filteredDescriptions = applySortFilter(descriptions, getComparator(order, orderBy), filterTitle);

  const isNotFound = !filteredDescriptions.length && !!filterTitle;
  return (
    <>
      <Helmet>
        <title> C&R Wizard Log | IA System </title>
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
            C&R Wizard Log
          </Link>
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" justifyContent="space-between" my={5}>
          <Typography variant="h4">
            C&R Wizard Log
          </Typography>

        </Stack>

        <Card>
          <ListToolbar filterDate={filterTitle} onFilterName={handleFilterByDate} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={descriptions.length}
                  onRequestSort={handleRequestSort}
                />
                {/* Tiene que cargar primero... */}
                {descriptions.length > 0 ? (
                  <TableBody>
                    {filteredDescriptions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, payroll, request, action, created_at: createdAt, comment, user } = row;
                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox">

                          <TableCell component="th" scope="row" padding="normal" width={400}>
                            <Stack direction="row" alignItems="center" spacing={2} >
                              <Typography variant="subtitle2" >
                                {comment}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell align="left"> {user?.full_name ? user?.full_name : 'N/A'} </TableCell>

                          <TableCell align="left"> {action} </TableCell>

                          <TableCell align="left"> {payroll?.suffix_id ? payroll?.suffix_id : 'N/A'} </TableCell>

                          <TableCell align="left"> {request?.suffix_id ? request?.suffix_id : 'N/A'} </TableCell>

                          <TableCell align="left"> {createdAt.split('T')[0]} </TableCell>
                          


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
                            <strong>&quot;{filterTitle}&quot;</strong>.
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
            count={descriptions.length}
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

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}
