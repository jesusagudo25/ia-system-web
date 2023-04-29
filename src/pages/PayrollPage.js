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
    Box,
    Breadcrumbs, Link,
    Button,
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
    { id: 'month', label: 'Month', alignRight: false },
    { id: 'start_date', label: 'Start date', alignRight: false },
    { id: 'end_date', label: 'End date', alignRight: false },
    { id: 'user', label: 'User', alignRight: false },
    { id: 'total', label: 'Total', alignRight: false },
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
        return filter(array, (_report) => _report.start_date.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return stabilizedThis.map((el) => el[0]);
}

// ----------------------------------------------------------------------

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export const PayrollPage = () => {

    /* Generate */

    const [startDate, setStartDate] = useState(new Date(`${format(new Date(), 'yyyy-MM-01')}T00:00:00`));
    const [endDate, setEndDate] = useState(new Date());

    /* Modal */

    const [payroll, setPayroll] = useState({});
    const [open, setOpen] = useState(false);

    /* Payrolls */

    const [payrolls, setPayrolls] = useState([]);

    const [page, setPage] = useState(0);

    const [order, setOrder] = useState('desc');

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
        try {
            const response = await axios.get(`${config.APPBACK_URL}/api/payrolls`);
            setPayrolls(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleGeneratePayroll = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${config.APPBACK_URL}/api/payrolls`, {
                user_id: 1,
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd'),
            });
            console.log(response);
            toast.success('Payroll generated successfully');
            setPayroll(response.data.payroll);
            setOpen(true);
            getPayrolls();
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            toast.error('Error generating payroll');
            setIsLoading(false);
        }
    };

    const handleDeletePayroll = async (id) => {
        try {
            const response = await axios.delete(`${config.APPBACK_URL}/api/payrolls/${id}`);
            console.log(response);
            toast.success('Payroll deleted successfully');
            getPayrolls();
        } catch (error) {
            console.log(error);
            toast.error('Error deleting payroll');
        }
    };

    useEffect(() => {
        getPayrolls();
    }, []);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - payrolls.length) : 0;

    const filteredReports = applySortFilter(payrolls, getComparator(order, orderBy), filterDate);

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
                            />
                        </LocalizationProvider>
                        <LoadingButton variant="contained" color="primary" size="large" loading={isLoading} sx={{ ml: 1, width: '15%' }} onClick={
                            () => {
                                setIsLoading(true);
                                handleGeneratePayroll();
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
                                        {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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

                                                    <TableCell align="left">{startDate}</TableCell>

                                                    <TableCell align="left">{endDate}</TableCell>

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


                                                        <IconButton size="large" color="error" onClick={() => handleDeletePayroll(id)}>
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

            {/* Dialog - report result */}
            {
                payrolls ? (
                    <Dialog
                        open={open}
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
                                        Descargar
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
                                    setOpen(false);
                                    setStartDate(new Date(`${format(new Date(), 'yyyy-MM-01')}T00:00:00`));
                                    setEndDate(new Date());
                                }}
                            >Cerrar</Button>
                        </DialogActions>
                    </Dialog>
                ) : null
            }
        </>
    )
}
