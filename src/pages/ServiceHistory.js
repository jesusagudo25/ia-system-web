import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import PropTypes from 'prop-types';
import axios from 'axios';
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
    DialogTitle,
    styled,
    Breadcrumbs,
    Link,
} from '@mui/material';
// components
import CloseIcon from '@mui/icons-material/Close';
import { ListHead, ListToolbar } from '../sections/@dashboard/table';

// date-fns
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

// Sections - Se debe reempazar el nombre del componente por uno mas general
import config from '../config.json';


const TABLE_HEAD = [
    { id: 'id', label: 'Invoice #', alignRight: false },
    { id: 'assignment', label: 'Assignment', alignRight: false },
    { id: 'date', label: 'Date', alignRight: false },
    { id: 'agency', label: 'Agency', alignRight: false },
    { id: 'interpreter', label: 'Interpreter', alignRight: false },
    { id: 'status', label: 'Status', alignRight: false },
    { id: '' },
];

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
        return filter(array, (_invoice) => _invoice.id.toString(2).toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return stabilizedThis.map((el) => el[0]);
}

export const ServiceHistory = () => {

    /* Datatable */

    const [invoices, setInvoices] = useState([]);

    const [page, setPage] = useState(0);

    const [order, setOrder] = useState('desc');

    const [orderBy, setOrderBy] = useState('date');

    const [filterName, setFilterName] = useState('');

    const [rowsPerPage, setRowsPerPage] = useState(5);

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

    const getInvoices = async () => {
        const { data } = await axios.get(`${config.APPBACK_URL}/api/invoices`);
        setInvoices(data);
    };

    const handleOnChangeStatus = async (id, status) => {
        const { data } = await axios.put(`${config.APPBACK_URL}/api/invoices/new-status/${id}`, { status });
        getInvoices();
    };


    useEffect(() => {
        getInvoices();
    }, []);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - invoices.length) : 0;

    const filteredInvoices = applySortFilter(invoices, getComparator(order, orderBy), filterName);

    const isNotFound = !filteredInvoices.length && !!filterName;

    return (
        <>
            <Helmet>
                <title> Service History | IA System </title>
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
                        Service History
                    </Link>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ mb: 5, mt: 3 }}>
                    Service History
                </Typography>

                <Card>
                    <ListToolbar filterName={filterName} onFilterName={handleFilterByName} PlaceHolder={"Buscar factura..."} />

                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800 }}>
                            <Table>
                                <ListHead
                                    order={order}
                                    orderBy={orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={invoices.length}
                                    onRequestSort={handleRequestSort}
                                />
                                {/* Tiene que cargar primero... */}
                                {invoices.length > 0 ? (
                                    <TableBody>
                                        {filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                            const { id, invoice_details: invoiceDetails, agency, interpreter, status } = row;

                                            return (
                                                <TableRow hover key={id} tabIndex={-1} role="checkbox">

                                                    <TableCell component="th" scope="row" padding="normal">
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Typography variant="subtitle2" noWrap>
                                                                {invoiceDetails[0].invoice_number}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>

                                                    <TableCell component="th" scope="row" padding="normal">
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Typography variant="subtitle2" noWrap>
                                                                {invoiceDetails[0].assignment_number}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>

                                                    <TableCell align="left">
                                                        {invoiceDetails[0].date_of_service_provided}
                                                    </TableCell>

                                                    <TableCell align="left">
                                                        {agency.name}
                                                    </TableCell>

                                                    <TableCell align="left">
                                                        {interpreter.full_name}
                                                    </TableCell>

                                                    <TableCell align="left">
                                                        <Label color={status === 'paid' ? 'success' : status === 'open' ? 'warning' : status === 'cancelled' ? 'error' : 'info'}>
                                                            {sentenceCase(status === 'paid' ? 'Paid' : status === 'open' ? 'Open' : status === 'cancelled' ? 'Cancelled' : 'Pending')}
                                                        </Label>
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        {
                                                            status === 'paid' ?
                                                                (
                                                                    <>
                                                                        <a
                                                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                                                            target="_blank"
                                                                            href={`${config.APPBACK_URL}/api/invoices/${id}/download`}
                                                                            rel="noreferrer"
                                                                        >
                                                                            <IconButton size="large" color="inherit">
                                                                                <Iconify icon="bx:bxs-file-pdf" />
                                                                            </IconButton>
                                                                        </a>
                                                                        <IconButton size="large" color="error" onClick={() => handleOnChangeStatus(id, 'cancelled')}>
                                                                            <Iconify icon={'mdi:close'} />
                                                                            {/* Anular */}
                                                                        </IconButton>
                                                                    </>
                                                                )
                                                                :
                                                                status === 'open' ?
                                                                    (
                                                                        <>
                                                                            <IconButton size="large" color="inherit">
                                                                                <Iconify icon={'mdi:arrow-right'} />
                                                                                {/* Ir a seguir orden */}
                                                                            </IconButton>
                                                                            <IconButton size="large" color="error" onClick={() => handleOnChangeStatus(id, 'cancelled')}>
                                                                                <Iconify icon={'mdi:close'} />
                                                                                {/* Anular */}
                                                                            </IconButton>
                                                                        </>
                                                                    )
                                                                    :
                                                                    status === 'pending' ?
                                                                        (<>
                                                                            <a
                                                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                                                                target="_blank"
                                                                                href={`${config.APPBACK_URL}/api/invoices/${id}/download`}
                                                                                rel="noreferrer"
                                                                            >
                                                                                <IconButton size="large" color="inherit">
                                                                                    <Iconify icon="bx:bxs-file-pdf" />
                                                                                </IconButton>
                                                                            </a>
                                                                            <IconButton size="large" color="success" onClick={() => handleOnChangeStatus(id, 'paid')}>
                                                                                <Iconify icon="bx:money-withdraw" />
                                                                                {/* Pagar */}
                                                                            </IconButton>
                                                                        </>
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
                                                <TableCell align="center" colSpan={7} sx={{ py: 3 }}>
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
                                            <TableCell align="center" colSpan={7} sx={{ py: 3 }}>
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
                        labelRowsPerPage="Filas por página:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                        count={invoices.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>
            </Container>
        </>
    )
}
