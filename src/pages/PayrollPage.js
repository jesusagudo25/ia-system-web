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
} from '@mui/material';

// components
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Slide from '@mui/material/Slide';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// date-fns
import { format, lastDayOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// date-fns


// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import { ReviewListHead, ReviewListToolbar } from '../sections/@payroll/table';
import config from '../config.json';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'month', label: 'Month', alignRight: false },
    { id: 'start_date', label: 'Start date', alignRight: false },
    { id: 'end_date', label: 'End date', alignRight: false },
    { id: 'user', label: 'User', alignRight: false },
    { id: 'total', label: 'Total', alignRight: false },
    { id: '' },
];

const TABLE_HEAD_REVIEW = [
    { id: 'assignment', label: 'Assignment', alignRight: false },
    { id: 'date', label: 'Date of service', alignRight: false },
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
        return filter(array, (_report) => _report.start_date.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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

export const PayrollPage = () => {

    /* Generate */

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    /* Modal */

    const [payroll, setPayroll] = useState(null);
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openPayroll, setOpenPayroll] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    /* -------------------------------  Payrolls -------------------------------  */

    const [payrolls, setPayrolls] = useState([]);

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

    const getPayrolls = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${config.APPBACK_URL}/api/payrolls`);
            setPayrolls(response.data);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    /* ------------------------------- Review --------------------------------------- */
    const [review, setReview] = useState(null);

    const [pageReview, setPageReview] = useState(0);

    const [orderReview, setOrderReview] = useState('asc');

    const [orderByReview, setOrderByReview] = useState('date');

    const [selected, setSelected] = useState([]);

    const [rowsPerPageReview, setRowsPerPageReview] = useState(5);

    const [filterAssignmentReview, setFilterAssignmentReview] = useState('');

    const handleRequestSortReview = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
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

    const handleReviewPayroll = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${config.APPBACK_URL}/api/payrolls/review`, {
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd'),
            });
            setReview(response.data.review);
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

    const handleDeletePayroll = async () => {
        setIsLoading(true);
        setOpenDelete(false);
        try {
            const response = await axios.delete(`${config.APPBACK_URL}/api/payrolls/${currentId}`);
            toast.success('Payroll deleted successfully');
            getPayrolls();
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            toast.error('Error deleting payroll');
        }
    };

    useEffect(() => {
        getPayrolls();
        setDateRange();
    }, []);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - payrolls.length) : 0;

    const filteredPayrolls = applySortFilter(payrolls, getComparator(order, orderBy), filterDate);

    const isNotFound = !filteredPayrolls.length && !!filterDate;

    /* ------------- REVIEW ----------------------------- */

    const emptyRowsReview = review ? pageReview > 0 ? Math.max(0, (1 + pageReview) * rowsPerPageReview - review.length) : 0 : 0;

    const filteredReview = review ? applySortFilterReview(review, getComparator(orderReview, orderByReview), filterAssignmentReview) : [];

    const isNotFoundReview = review ? !filteredReview.length && !!filterAssignmentReview : false;

    /* Dialog delete */
    const handleClickDelete = (id) => {
        setOpenDelete(true);
        setCurrentId(id);
    };

    const handleClose = () => {
        setOpenDelete(false);
        setCurrentId(null);
    };

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
                        Payroll
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
                                handleReviewPayroll();
                            }
                        }>
                            Generate
                        </LoadingButton>
                    </Stack>
                </Card>

                <Typography variant="h4" sx={{ my: 5 }}>
                    Payroll
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
                                    rowCount={payrolls.length}
                                    onRequestSort={handleRequestSort}
                                />
                                {/* Tiene que cargar primero... */}
                                {payrolls.length > 0 ? (
                                    <TableBody>
                                        {filteredPayrolls.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                            const { id, user, month, start_date: startDate, end_date: endDate, total_amount: totalAmount } = row;

                                            return (
                                                <TableRow hover key={id} tabIndex={-1} role="checkbox">

                                                    <TableCell component="th" scope="row" padding="normal">
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Typography variant="subtitle2" noWrap>
                                                                {month}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>

                                                    <TableCell align="left">{format(parseISO(`${startDate.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')}</TableCell>

                                                    <TableCell align="left">{format(parseISO(`${endDate.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')}</TableCell>

                                                    <TableCell align="left">{user.full_name}</TableCell>

                                                    <TableCell align="left">{totalAmount}</TableCell>

                                                    <TableCell align="right">
                                                        <a
                                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                                            target="_blank"
                                                            href={`${config.APPBACK_URL}/api/payrolls/${id}/download`}
                                                            rel="noreferrer"
                                                        >
                                                            <IconButton size="large" color="inherit">
                                                                <Iconify icon="bx:bxs-file-pdf" />
                                                            </IconButton>
                                                        </a>
                                                        <a
                                                            style={{ textDecoration: 'none', color: 'green' }}
                                                            target="_blank"
                                                            href={`${config.APPBACK_URL}/api/bank-checks/${id}/download`}
                                                            rel="noreferrer"
                                                        >
                                                            <IconButton size="large" color="inherit">
                                                                <Iconify icon="bx:money-withdraw" />
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
                        count={payrolls.length}
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
                payroll ? (
                    <Dialog
                        open={openPayroll}
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

                                    <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>{payroll.month}</Typography>

                                </Stack>

                                <Typography variant="h4" sx={{
                                    fontWeight: '600',
                                    marginTop: 2,
                                }}>Payroll generated successfully</Typography>

                                <Typography variant="h6" sx={{
                                    marginY: 2,
                                    fontWeight: '400'
                                }}>You can download the payroll in PDF format</Typography>

                                <Stack direction="row" spacing={2}>
                                <a
                                    href={`${config.APPBACK_URL}/api/payrolls/${payroll.id}/download/`}
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
                                        Download payroll
                                    </Button>
                                </a>

                                <a
                                    href={`${config.APPBACK_URL}/api/bank-checks/${payroll.id}/download/`}
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
                                        Download bank checks
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
                                    setOpenPayroll(false);
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
                                    getPayrolls={getPayrolls}
                                    startDate={startDate}
                                    endDate={endDate}
                                    setDateRange={setDateRange}
                                    toast={toast}
                                    setReview={setReview}
                                    setSelected={setSelected}
                                    setPageReview={setPageReview}
                                    setIsLoading={setIsLoading}
                                    setPayroll={setPayroll}
                                    setOpenPayroll={setOpenPayroll} />

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
                                                        const { id, invoice_number: invoiceNumber, assignment_number: assignment, date_of_service_provided: date, agency, interpreter, total_amount: total, status } = row;

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
                                                                <TableCell align="left">{agency.name}</TableCell>
                                                                <TableCell align="left">{interpreter.full_name}</TableCell>
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
                                    setOrderByReview('date');
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
                    {"Confirm action"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={handleDeletePayroll} autoFocus>
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
