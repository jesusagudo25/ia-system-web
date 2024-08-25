import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import {
    Box,
    Button,
    Card,
    Container,
    Step,
    StepLabel,
    Stepper,
    Stack,
    Typography,
    Breadcrumbs, Link,
    FormControl, InputLabel, Select, MenuItem,
    TextField,
    Paper,
    Grid,
    FormHelperText,
    CircularProgress,
    Backdrop,
    FormControlLabel,
    Checkbox,
    FormLabel,
    RadioGroup,
    Radio,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import config from '../config.json';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

import useResponsive from '../hooks/useResponsive';


/* Review table */
import { ReviewListHead, WizardListToolbar } from '../sections/@payroll/table';

const TABLE_HEAD_REVIEW = [
    { id: 'assignment', label: 'Assignment', alignRight: false },
    { id: 'date', label: 'Date of service provided', alignRight: false },
    { id: 'agency', label: 'Agency', alignRight: false },
    { id: 'interpreter', label: 'Interpreter', alignRight: false },
    { id: 'status', label: 'Status', alignRight: false },
    { id: 'total', label: 'Total', alignRight: false },
];

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


/* Cancel and regenerate wizard payrol */
const steps = ['Set up', 'Review Payroll', 'Summary'];

export const CAndRWizardPage = () => {

    /* Form */
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [responseCARWizard, setResponseCARWizard] = useState('');

    const navigate = useNavigate();

    const lgDown = useResponsive('down', 'lg');

    /* Set Up */

    const [payrolls, setPayrolls] = useState([]);
    const [payrollSelected, setPayrollSelected] = useState('none');
    const [payrollData, setPayrollData] = useState({});

    const [actionRequest, setActionRequest] = useState('Cancel');

    /* Reviews */

    const [review, setReview] = useState(null);

    const [pageReview, setPageReview] = useState(0);

    const [orderReview, setOrderReview] = useState('desc');

    const [orderByReview, setOrderByReview] = useState('payroll_id');

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
            const response = await axios.get(`${config.APPBACK_URL}/api/payrolls/wizard/${payrollSelected}`);
            setReview(response.data.review.map((review) => ({
                ...review,
                assignment: review.assignment_number,
                date: review.date_of_service_provided,
                agency: review.agency.name,
                interpreter: review.interpreter.full_name,
                total: review.total_amount,
            })));

            setIsLoading(false);

        } catch (error) {
            console.log(error);
            toast.error('Error generating review');
            setIsLoading(false);
        }
    };

    const emptyRowsReview = review ? pageReview > 0 ? Math.max(0, (1 + pageReview) * rowsPerPageReview - review.length) : 0 : 0;

    const filteredReview = review ? applySortFilterReview(review, getComparator(orderReview, orderByReview), filterAssignmentReview) : [];

    const isNotFoundReview = review ? !filteredReview.length && !!filterAssignmentReview : false;

    /* Summary */

    const [comments, setComments] = useState('');

    /*  Active step variable */

    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
        const errors = {};
        let flag;
        if (activeStep === 0) {
            if (payrollSelected === 'none') {
                errors.payroll = 'Please select a payroll';
                flag = true;
            }

            if (actionRequest === '') {
                errors.actionRequest = 'Please select an action';
                flag = true;
            }
        }
        if (activeStep === 1) {
            if (selected.length === 0) {
                toast.error('Please select at least one service');
                flag = true;
            }
        }

        if (flag && activeStep === 0) {
            toast.error('Please fill in the required fields');
            setErrors(errors);
            return;
        }

        if (flag && activeStep === 1) {
            return;
        }

        setErrors({});

        if (activeStep === 0 && actionRequest === 'Regenerate') {
            handleReviewRequest();
        }


        if (activeStep === 0 && actionRequest === 'Cancel') {
            setActiveStep((prevActiveStep) => prevActiveStep + 2);
            return;
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);

    };

    const handleBack = () => {

        if (activeStep === 2 && actionRequest === 'Cancel') {
            setActiveStep((prevActiveStep) => prevActiveStep - 2);
            return;
        }

        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    /* Handle submit new service or update */

    const handleSubmitForm = () => {
        setIsLoading(true);

        const newRequest = {
            comments,
            actionRequest,
            payroll: payrollSelected,
            invoices: selected,
            user_id: localStorage.getItem('id')
        };

        console.log(newRequest);

        axios.post(`${config.APPBACK_URL}/api/car-wizard`, newRequest)
            .then((response) => {
                console.log(response.data);
                setResponseCARWizard(response.data.carWizard.id);
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

    }

    /* Get axios */

    const getLastPayroll = () => {
        setIsLoading(true);
        axios.get(`${config.APPBACK_URL}/api/last-payroll`)
            .then((response) => {
                const data = [];
                data.push(response.data);
                setPayrolls(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const getPayrollData = (id) => {
        setIsLoading(true);
        axios.get(`${config.APPBACK_URL}/api/payrolls/${id}`)
            .then((response) => {
                setPayrollData(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(() => {
        getLastPayroll();
    }, []);


    useEffect(() => {
        if (selected.length === 0) {

            payrollData?.invoices?.forEach((invoice) => {
                review?.forEach((review) => {

                    if (invoice.id === review.id) {
                        setSelected((prevSelected) => [...prevSelected, review.id]);
                    }
                });
            });
        }
    }, [review]);

    /* Functions for New service */

    function setUp() {
        return (
            <Container sx={
                {
                    marginTop: '40px',
                    marginBottom: '20px',
                    padding: '20px',
                    boxShadow: 2,
                    borderRadius: 1,
                }
            }>
                <Typography variant="subtitle1" gutterBottom marginBottom={2}>
                    Enter the data of the payroll
                </Typography>

                <FormControl error={errors.payroll} fullWidth >
                    <InputLabel id="payroll-select-label"
                    >Payroll</InputLabel>
                    <Select
                        labelId="payroll-select-label"
                        id="payroll-select"
                        label="Payroll"
                        value={payrollSelected}
                        onChange={(e) => {
                            setPayrollSelected(e.target.value);
                            getPayrollData(e.target.value);
                        }}
                    >
                        <MenuItem disabled value="none">
                            <em style={{ color: 'gray' }}>Choose</em>
                        </MenuItem>
                        {payrolls?.map((payroll) => (
                            payroll?.id ? (
                                <MenuItem key={payroll.id} value={payroll.id}> {payroll.suffix_id} - {format(parseISO(`${payroll.end_date.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')} </MenuItem>
                            ) : null
                        ))}
                    </Select>
                    <FormHelperText>{errors.payroll}</FormHelperText>
                </FormControl>

                <Typography variant="subtitle1" gutterBottom marginBottom={2} marginTop={2} sx={{ width: '100%' }}>
                    Enter the data of the request
                </Typography>

                <FormControl>
                    <FormLabel id="action-request-label">Action</FormLabel>
                    <RadioGroup
                        aria-labelledby="action-request-label"
                        defaultValue="Cancel"
                        name="radio-buttons-group"
                    >
                        <FormControlLabel value="Cancel" checked={actionRequest === 'Cancel'} onChange={(e) => setActionRequest(e.target.value)} control={<Radio />} label="Cancel" />
                        <FormControlLabel value="Regenerate" checked={actionRequest === 'Regenerate'} onChange={(e) => setActionRequest(e.target.value)} control={<Radio />} label="Regenerate" />
                    </RadioGroup>
                </FormControl>

            </Container>
        );
    }

    function reviewPayroll() {
        return (
            <Container sx={
                {
                    marginTop: '40px',
                    marginBottom: '20px',
                    padding: '20px',
                    boxShadow: 2,
                    borderRadius: 1,
                    maxWidth: '85vw',
                }
            }>
                <Typography variant="subtitle1" gutterBottom marginBottom={2}>
                    Select the services to regenerate
                </Typography>

                {review ? (
                    <Card>
                        <WizardListToolbar
                            numSelected={selected.length}
                            filterAssignment={filterAssignmentReview}
                            onFilterAssignment={handleFilterByAssignment}
                            selected={selected}
                            toast={toast}
                            setSelected={setSelected}
                            setPageReview={setPageReview}
                        />

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
                ) : null}

            </Container>
        );
    }

    function summary() {
        return (
            <Container sx={
                {
                    marginTop: '40px',
                    marginBottom: '20px',
                    padding: '20px',
                    boxShadow: 2,
                    borderRadius: 1,
                }
            }>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Details of the payroll to be canceled
                </Typography>

                <Grid container spacing={4} sx={{
                    mb: 3,
                }}>
                    <Grid item xs={12} md={6} lg={3}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            ID
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {payrollData?.suffix_id ? payrollData?.suffix_id : 'N/A'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Request
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {payrollData?.request?.suffix_id ? payrollData?.request?.suffix_id : 'N/A'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Start - End Date
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {format(parseISO(`${payrollData?.start_date.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')} - {format(parseISO(`${payrollData?.end_date.split('T')[0]}T00:00:00`), 'MM/dd/yyyy')}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6} lg={3}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Total
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {payrollData?.total_amount}
                        </Typography>
                    </Grid>
                </Grid>


                <Typography variant="h6" sx={{ marginY: 2 }}>
                    Additional Comments
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <TextField
                        id="outlined-multiline-static"
                        label="Comments"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        placeholder="Enter comments"
                        multiline
                        rows={4}
                        variant="outlined"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </FormControl>
                
                {/* 
                {
                    actionRequest === 'Regenerate' ? (
                        <>
                            <Typography variant="subtitle1" sx={{ marginY: 2, textAlign: 'center', color: 'text.secondary' }}>
                                View list of services to regenerate
                            </Typography>
                            <Typography variant="body2" sx={{ marginY: 2, textAlign: 'center', color: 'text.secondary' }}>
                                <a href="api/payrolls/1" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>Click here</a>
                            </Typography>
                        </>

                    ) : null
                } */}


                <Typography variant="h6" sx={{ marginY: 2 }}>
                    Actions
                </Typography>

                <Grid item xs={12} md={6} lg={4}>
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: lgDown ? '1fr' : 'repeat(2, 1fr)'
                        }}
                    >
                        <Button
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            onClick={
                                () => {
                                    navigate('/dashboard/payroll-panel');
                                }
                            }
                        >
                            <Paper key='Anulación' variant="outlined" sx={{
                                py: 2, textAlign: 'center',
                                width: '100%',
                                height: '100%',
                            }}>
                                <Box sx={{ mb: 0.5 }}><Iconify icon={'mdi:close-circle-outline'} color="red" width={32} /></Box>

                                <Typography variant="body1" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                                    Cancel
                                </Typography>
                            </Paper>
                        </Button>

                        <Button
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            onClick={handleSubmitForm}
                            disabled={isLoading}
                        >
                            <Paper variant="outlined" sx={{
                                py: 2, textAlign: 'center',
                                width: '100%',
                                height: '100%',
                            }}>
                                <Box sx={{ mb: 0.5 }}><Iconify icon={'material-symbols:save'} color="green" width={32} /></Box>

                                <Typography variant="body1" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                                    Save
                                </Typography>
                            </Paper>
                        </Button>
                    </Box>
                </Grid>
            </Container>
        );
    }

    return (
        <>
            <Helmet>
                <title>C&R Wizard | IA System </title>
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
                        C&R Wizard
                    </Link>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ mb: 5, mt: 3 }}>
                    C&R Wizard
                </Typography>

                <Card>
                    <Container sx={
                        {
                            padding: '20px',
                            display: 'grid',
                            flexDirection: 'column',
                            gap: '20px',
                        }
                    }>
                        <Box sx={{ width: '100%' }}>
                            <Stepper activeStep={activeStep}>
                                {steps.map((label, index) => {
                                    const stepProps = {};
                                    const labelProps = {};
                                    return (
                                        <Step key={label} {...stepProps}>
                                            <StepLabel {...labelProps}>{label}</StepLabel>
                                        </Step>
                                    );
                                })}
                            </Stepper>
                            {activeStep === steps.length ? (
                                <Container sx={
                                    {
                                        marginTop: '40px',
                                        marginBottom: '20px',
                                        padding: '20px',
                                        boxShadow: 2,
                                        borderRadius: 1,
                                    }
                                }>
                                    {
                                        responseCARWizard ? (
                                            <Stack spacing={3} sx={{ mb: 4 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <Iconify icon="material-symbols:check-circle" color="#00BB2D" width={50} height={50} />
                                                </Box>
                                                <Typography variant="h6" gutterBottom sx={
                                                    {
                                                        textAlign: 'center'
                                                    }
                                                }>
                                                    The process has been completed
                                                </Typography>
                                                <Typography variant="body1" sx={
                                                    {
                                                        textAlign: 'center'
                                                    }
                                                }>
                                                    You can check the log of the process in the following link
                                                </Typography>

                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                                                    <a
                                                        style={{ textDecoration: 'none' }}
                                                        href={`/dashboard/manage/cr-wizard-log`}
                                                    >
                                                        <Button variant="contained"
                                                            size='large'
                                                            sx={{
                                                                width: '100%',
                                                            }}
                                                            color="error"
                                                            startIcon={<Iconify icon="mdi:table-large" color="#fff"  />}
                                                        >
                                                            View log
                                                        </Button>
                                                    </a>

                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={
                                                            () => {
                                                                window.location.reload();
                                                            }
                                                        }
                                                    >
                                                        New
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        ) : null
                                    }
                                </Container>
                            ) : (
                                <>
                                    {
                                        activeStep === 0 ? setUp() :
                                            activeStep === 1 ? reviewPayroll() :
                                                activeStep === 2 ? summary() : null
                                    }

                                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                        <Button
                                            color="inherit"
                                            disabled={activeStep === 0}
                                            onClick={handleBack}
                                            sx={{ mr: 1 }}
                                        >
                                            Back
                                        </Button>
                                        <Box sx={{ flex: '1 1 auto' }} />
                                        {activeStep === steps.length - 1 ? null : <Button onClick={handleNext}>Next</Button>}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Container>
                </Card>
            </Container>

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
