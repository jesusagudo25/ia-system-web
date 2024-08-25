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
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    Box,
    Breadcrumbs, Link,
    Button,
    Checkbox,
    Backdrop,
    CircularProgress,
    DialogContentText,
    FormControl
} from '@mui/material';

// components
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Slide from '@mui/material/Slide';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// date-fns
import { format, lastDayOfMonth, parseISO } from 'date-fns';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

import useResponsive from '../hooks/useResponsive';

// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import { ReviewListHead, ReviewListToolbar } from '../sections/@payroll/table';
import config from '../config.json';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'suffix_id', label: 'ID', alignRight: false },
    { id: 'month', label: 'Month', alignRight: false },
    { id: 'start_date', label: 'Start date', alignRight: false },
    { id: 'end_date', label: 'End date', alignRight: false },
    { id: 'user', label: 'User', alignRight: false },
    { id: 'total', label: 'Total', alignRight: false },
    { id: 'status', label: 'Status', alignRight: false },
    { id: '' },
];

const TABLE_HEAD_REVIEW = [
    { id: 'assignment', label: 'Assignment', alignRight: false },
    { id: 'date', label: 'Date of service provided', alignRight: false },
    { id: 'agency', label: 'Agency', alignRight: false },
    { id: 'interpreter', label: 'Interpreter', alignRight: false },
    { id: 'status', label: 'Status', alignRight: false },
    { id: 'total', label: 'Total', alignRight: false },
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
        /* Se debe cambiar la fecha, para que sea la que se presenta en el start date del reporte
        Se pueden hacer una funcion que busque por el mes,mas haya de que el campo venga en fecha
        */
        return filter(array, (_payroll) => _payroll.start_date.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return stabilizedThis.map((el) => el[0]);
}

function applySortFilterReview(array, comparator, query) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    if (query) {
        return filter(array, (_review) => _review.assignment_number.indexOf(query.toLowerCase()) !== -1);
    }
    return stabilizedThis.map((el) => el[0]);
}

// ----------------------------------------------------------------------

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export const RequestPage = () => {

    const lgDown = useResponsive('down', 'lg');

    /* Generate */

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    /* Modal */

    const [request, setRequest] = useState(null);
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openRequest, setOpenRequest] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [currentRequest, setCurrentRequest] = useState(null);

    const [currentStatus, setCurrentStatus] = useState(null);

    /* -------------------------------  Payrolls -------------------------------  */

    const [requests, setRequests] = useState([]);

    const [page, setPage] = useState(0);

    const [order, setOrder] = useState('desc');

    const [orderBy, setOrderBy] = useState('id');

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

    const getRequests = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${config.APPBACK_URL}/api/requests`);
            setRequests(response.data);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    /* ------------------------------- Review --------------------------------------- */
    const [review, setReview] = useState(null);

    const [pageReview, setPageReview] = useState(0);

    const [orderReview, setOrderReview] = useState('desc');

    const [orderByReview, setOrderByReview] = useState('id');

    const [selected, setSelected] = useState([]);

    const [rowsPerPageReview, setRowsPerPageReview] = useState(5);

    const [filterAssignmentReview, setFilterAssignmentReview] = useState('');

    const handleRequestSortReview = (event, property) => {
        const isAsc = orderByReview === property && orderReview === 'asc';
        setOrderReview(isAsc ? 'desc' : 'asc');
        setOrderByReview(property);
    };

    const handleChangePageReview = (event, newPage) => {
        setPageReview(newPage);
    };

    const handleChangeRowsPerPageReview = (event) => {
        setPageReview(0);
        setRowsPerPageReview(parseInt(event.target.value, 10));
    };

    const handleFilterByAssignment = (event) => {
        setPageReview(0);
        setFilterAssignmentReview(event.target.value);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = review.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        setSelected(newSelected);
    };

    const handleReviewRequest = async () => {
        try {
            setIsLoading(true);

            const sDate = format(startDate, 'yyyy-MM-dd');
            const eDate = format(endDate, 'yyyy-MM-dd');

            const response = await axios.get(`${config.APPBACK_URL}/api/requests/review/${sDate}/${eDate}`);
            setReview(response.data.review.map((review) => ({
                ...review,
                assignment: review.assignment_number,
                date: review.date_of_service_provided,
                agency: review.agency.name,
                interpreter: review.interpreter.full_name,
                total: review.total_amount,
            })));
            setOpen(true);
            setIsLoading(false);

        } catch (error) {
            console.log(error);
            toast.error('Error generating review');
            setIsLoading(false);
        }
    };

    const setDateRange = () => {
        const currentDate = new Date();
        // validate currentDay
        if (Number(format(currentDate, 'dd')) > 15) {
            setStartDate(new Date(`${format(new Date(), 'yyyy-MM-16')}T00:00:00`));
            setEndDate(lastDayOfMonth(currentDate));
        }
        else {
            setStartDate(new Date(`${format(new Date(), 'yyyy-MM-01')}T00:00:00`));
            setEndDate(new Date(`${format(new Date(), 'yyyy-MM-15')}T00:00:00`));
        }
    }

    useEffect(() => {
        getRequests();
        setDateRange();
    }, []);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - requests.length) : 0;

    const filteredRequests = applySortFilter(requests, getComparator(order, orderBy), filterDate);

    const isNotFound = !filteredRequests.length && !!filterDate;

    /* ------------- REVIEW ----------------------------- */

    const emptyRowsReview = review ? pageReview > 0 ? Math.max(0, (1 + pageReview) * rowsPerPageReview - review.length) : 0 : 0;

    const filteredReview = review ? applySortFilterReview(review, getComparator(orderReview, orderByReview), filterAssignmentReview) : [];

    const isNotFoundReview = review ? !filteredReview.length && !!filterAssignmentReview : false;

    /* ------------- Dialog Change status ----------------------------- */

    const handleClickDelete = (id, suffixId, status) => {
        setOpenDelete(true);
        setCurrentId(id);
        setCurrentRequest(suffixId);
        setCurrentStatus(status);
    };

    const handleClose = () => {
        setOpenDelete(false);
        setCurrentId(null);
        setCurrentStatus(null);
    };


    const handleDeleteRequest = async () => {
        setIsLoading(true);
        setOpenDelete(false);
        try {
            const { data } = await axios.put(`${config.APPBACK_URL}/api/requests/new-status/${currentId}`, { status: currentStatus });
            toast.success('Status updated successfully');
            setIsLoading(false);
            getRequests();
        }
        catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title> Requests | IA System </title>
            </Helmet>

            <Container>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/dashboard/app">
                        Dashboard
                    </Link>
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/dashboard/payroll-panel"
                    >
                        Payroll
                    </Link>
                    <Link
                        underline="hover"
                        color="inherit"
                        href="#"
                    >
                        Requests
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
                                    handleReviewRequest();
                                }
                            }>
                            Generate
                        </LoadingButton>
                    </Stack>
                </Card>

                <Typography variant="h4" sx={{ my: 5 }}>
                    Requests
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
                                    rowCount={requests.length}
                                    onRequestSort={handleRequestSort}
                                />
                                {/* Tiene que cargar primero... */}
                                {requests.length > 0 ? (
                                    <TableBody>
                                        {filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                            const { id, suffix_id: suffixId, user, month, start_date: startDate, end_date: endDate, total_amount: totalAmount, status, request_id: requestId } = row;

                                            return (
                                                <TableRow hover key={id} tabIndex={-1} role="checkbox">

                                                    <TableCell component="th" scope="row" padding="normal">
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Typography variant="subtitle2" noWrap>
                                                                {suffixId}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>

                                                    <TableCell align="left">{month}</TableCell>

                                                    <TableCell align="left">{format(parseISO(`${startDate.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')}</TableCell>

                                                    <TableCell align="left">{format(parseISO(`${endDate.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')}</TableCell>

                                                    <TableCell align="left">{user.full_name}</TableCell>

                                                    <TableCell align="left">{totalAmount}</TableCell>

                                                    <TableCell align="left">
                                                        <Label color={status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'error'}>
                                                            {sentenceCase(status)}
                                                        </Label>
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        {
                                                            status === 'pending' ? (
                                                                <Stack direction="row" spacing={1}>
                                                                    <a
                                                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                                                        target="_blank"
                                                                        href={`${config.APPBACK_URL}/api/requests/${id}/download`}
                                                                        rel="noreferrer"
                                                                    >
                                                                        <IconButton size="large" color="inherit">
                                                                            <Iconify icon="bx:bxs-file-pdf" /> <Typography variant="caption">Download</Typography>                                                                        </IconButton>
                                                                    </a>
                                                                    <a
                                                                        style={{ textDecoration: 'none', color: '#2065D1' }}
                                                                        target="_blank"
                                                                        href={`${config.APPBACK_URL}/api/bank-checks-preview/${id}/download`}
                                                                        rel="noreferrer"
                                                                    >
                                                                        <IconButton size="large" color="inherit">
                                                                            <Iconify icon="bx:money-withdraw" /> <Typography variant="caption">Checks</Typography>
                                                                        </IconButton>
                                                                    </a>

                                                                    <IconButton size="large" color="success" onClick={() => handleClickDelete(id, suffixId, 'completed')} >
                                                                        <Iconify icon={'mdi:check'} />  <Typography variant="caption">Complete</Typography>
                                                                        {/* Complete */}
                                                                    </IconButton>

                                                                    <IconButton size="large" color="error" onClick={() => handleClickDelete(id, suffixId, 'cancelled')}>
                                                                        <Iconify icon="bx:bxs-trash" /> <Typography variant="caption">Cancel</Typography>
                                                                    </IconButton>
                                                                </Stack>
                                                            )
                                                                :
                                                                status === 'completed' ? (
                                                                    <Stack direction="row" spacing={1}>
                                                                        <a
                                                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                                                            target="_blank"
                                                                            href={`${config.APPBACK_URL}/api/requests/${id}/download`}
                                                                            rel="noreferrer"
                                                                        >
                                                                            <IconButton size="large" color="inherit">
                                                                                <Iconify icon="bx:bxs-file-pdf" /> <Typography variant="caption">Download</Typography>
                                                                            </IconButton>
                                                                        </a>
                                                                        <a
                                                                            style={{ textDecoration: 'none', color: '#2065D1' }}
                                                                            target="_blank"
                                                                            href={`${config.APPBACK_URL}/api/bank-checks-preview/${id}/download`}
                                                                            rel="noreferrer"
                                                                        >
                                                                            <IconButton size="large" color="inherit">
                                                                                <Iconify icon="bx:money-withdraw" /> <Typography variant="caption">Checks</Typography>
                                                                            </IconButton>
                                                                        </a>


                                                                        <a
                                                                            style={{ textDecoration: 'none', color: '#54D62C' }}
                                                                            href={`/dashboard/payroll-panel/payments/`}
                                                                        >
                                                                            <IconButton size="large" color="inherit">
                                                                                <Iconify icon="bx:show" /> <Typography variant="caption">Payments</Typography>
                                                                            </IconButton>
                                                                        </a>
                                                                    </Stack>
                                                                )
                                                                    :
                                                                    null
                                                        }

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
                        count={requests.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>
            </Container>

            {/* Toastify */}

            <ToastContainer />

            {/* Dialog - Payroll result */}
            {
                request ? (
                    <Dialog
                        open={openRequest}
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
                                    <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>Selected month:</Typography>

                                    <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>{request.month}</Typography>

                                </Stack>

                                <Typography variant="h4" sx={{
                                    fontWeight: '600',
                                    marginTop: 2,
                                }}>Request generated successfully</Typography>

                                <Typography variant="h6" sx={{
                                    marginY: 2,
                                    fontWeight: '400'
                                }}>You can download the request in PDF format</Typography>

                                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', width: '100%', justifyContent: 'center', gap: 2 }}>
                                    <a
                                        href={`${config.APPBACK_URL}/api/requests/${request.id}/download/`}
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
                                            Download request
                                        </Button>
                                    </a>

                                    <a
                                        href={`${config.APPBACK_URL}/api/bank-checks-preview/${request.id}/download/`}
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
                                            color="success"
                                            startIcon={<Iconify icon="mdi:file-pdf" />}
                                        >
                                            Download bank checks preview
                                        </Button>
                                    </a>
                                </Stack>

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
                                    setOpenRequest(false);
                                }}
                            >Close</Button>
                        </DialogActions>
                    </Dialog>
                ) : null
            }

            {/* Dialog - review result */}
            {
                review ? (
                    <Dialog
                        open={open}
                        TransitionComponent={Transition}
                        keepMounted
                        aria-describedby="alert-dialog-slide-description"
                        fullWidth
                        maxWidth='md'
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Services provided"}
                        </DialogTitle>
                        <DialogContent dividers>

                            <Card>
                                <ReviewListToolbar
                                    numSelected={selected.length}
                                    filterAssignment={filterAssignmentReview}
                                    onFilterAssignment={handleFilterByAssignment}

                                    setOpen={setOpen}
                                    selected={selected}
                                    getRequests={getRequests}
                                    startDate={startDate}
                                    endDate={endDate}
                                    setDateRange={setDateRange}
                                    toast={toast}
                                    setReview={setReview}
                                    setSelected={setSelected}
                                    setPageReview={setPageReview}
                                    setIsLoading={setIsLoading}
                                    setRequest={setRequest}
                                    setOpenRequest={setOpenRequest} />

                                <Scrollbar>
                                    <TableContainer sx={{ minWidth: 800 }}>
                                        <Table>
                                            <ReviewListHead
                                                order={orderReview}
                                                orderBy={orderByReview}
                                                headLabel={TABLE_HEAD_REVIEW}
                                                rowCount={review.length}
                                                numSelected={selected.length}
                                                onRequestSort={handleRequestSortReview}
                                                onSelectAllClick={handleSelectAllClick}
                                            />
                                            {/* Tiene que cargar primero... */}
                                            {review.length > 0 ? (
                                                <TableBody>
                                                    {filteredReview.slice(pageReview * rowsPerPageReview, pageReview * rowsPerPageReview + rowsPerPageReview
                                                    ).map((row) => {
                                                        const { id, assignment, date, agency, interpreter, status, total } = row;
                                                        const selectedReview = selected.indexOf(id) !== -1;

                                                        return (
                                                            <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedReview}>
                                                                <TableCell padding="checkbox">
                                                                    <Checkbox checked={selectedReview} onChange={(event) => handleClick(event, id)} />
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" padding="normal">
                                                                    <Stack direction="row" alignItems="center" spacing={2}>
                                                                        <Typography variant="subtitle2" noWrap>
                                                                            {assignment}
                                                                        </Typography>
                                                                    </Stack>
                                                                </TableCell>

                                                                <TableCell align="left">{date}</TableCell>
                                                                <TableCell align="left">{agency}</TableCell>
                                                                <TableCell align="left">{interpreter}</TableCell>
                                                                <TableCell align="left">
                                                                    <Label color={status === 'paid' ? 'success' : status === 'open' ? 'warning' : status === 'cancelled' ? 'error' : 'info'}>
                                                                        {sentenceCase(status === 'paid' ? 'Paid' : status === 'open' ? 'Open' : status === 'cancelled' ? 'Cancelled' : 'Pending')}
                                                                    </Label>
                                                                </TableCell>
                                                                <TableCell align="left">{total}</TableCell>

                                                            </TableRow>
                                                        );
                                                    })}
                                                    {emptyRowsReview > 0 && (
                                                        <TableRow style={{ height: 53 * emptyRowsReview }}>
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


                                            {isNotFoundReview && (
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
                                                                    <strong>&quot;{filterAssignmentReview}&quot;</strong>.
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
                                    count={review.length}
                                    rowsPerPage={rowsPerPageReview}
                                    page={pageReview}
                                    onPageChange={handleChangePageReview}
                                    onRowsPerPageChange={handleChangeRowsPerPageReview}
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
                                size='large'
                                sx={{
                                    margin: 2,
                                }}
                                onClick={() => {
                                    setOpen(false);
                                    setDateRange();
                                    setReview(false);
                                    setPageReview(0);
                                    setOrderByReview('id');
                                    setFilterAssignmentReview('');
                                    setSelected([]);
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
                    {"Change of status"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to change the <b>status</b> of request <b>#{currentRequest}</b> to <b>{currentStatus}?</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={handleDeleteRequest} autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

        </>
    )
}
