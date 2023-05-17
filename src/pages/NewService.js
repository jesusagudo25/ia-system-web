import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { History, Blocker, Transition } from 'history';

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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import InputAdornment from '@mui/material/InputAdornment';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';

import { SearchInterpreter } from '../sections/@manage/interpreter/SearchInterpreter';
import { SearchAgency } from '../sections/@manage/agency/SearchAgency';
import { InterpreterData } from '../sections/@manage/interpreter/InterpreterData';
import { SearchDescription } from '../sections/@manage/description/SearchDescription';
import { SearchAddress } from '../sections/@manage/interpreter/SearchAddress';
import config from '../config.json';
import Iconify from '../components/iconify';


const steps = ['Agency and Interpreter data', 'Service data', 'Summary'];

export const NewService = () => {

    /* Detect exit --------------------------------------------- ************* */

    
    /* get data external */
    const [states, setStates] = useState([]);
    const [lenguages, setLenguages] = useState([]);

    /* Agency */
    const [agencyName, setAgencyName] = useState('');
    const [agencyId, setAgencyId] = useState('');

    /* Interprete */

    const [interpreterName, setInterpreterName] = useState('');
    const [interpreterId, setInterpreterId] = useState('');
    const [interpreterPhoneNum, setInterpreterPhoneNum] = useState('');
    const [interpreterSSN, setInterpreterSSN] = useState('');

    const [interpreterAddress, setInterpreterAddress] = useState('');
    const [interpreterCity, setInterpreterCity] = useState('');
    const [interpreterState, setInterpreterState] = useState('');
    const [interpreterZipCode, setInterpreterZipCode] = useState('');
    const [interpreterEmail, setInterpreterEmail] = useState('');
    const [interpreterLenguageId, setInterpreterLenguageId] = useState('none');
    const [interpreterSelected, setInterpreterSelected] = useState(false);

    const [interpreterContainer, setInterpreterContainer] = useState(false);

    /* Service address */
    
    const [serviceAddressId, setServiceAddressId] = useState(''); // [1]
    const [serviceAddress, setServiceAddress] = useState('');
    const [serviceCity, setServiceCity] = useState('');
    const [serviceState, setServiceState] = useState('none');
    const [serviceZipCode, setServiceZipCode] = useState('');

    /* New service variable */

    const [description, setDescription] = useState('');
    const [descriptionId, setDescriptionId] = useState('');

    const [dateServiceProvided, setDateServiceProvided] = useState(new Date());
    const [arrivalTime, setArrivalTime] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [travelTimeToAssignment, setTravelTimeToAssignment] = useState('');
    const [timeBackFromAssignment, setTimeBackFromAssignment] = useState('');

    const [travelMileage, setTravelMileage] = useState(0);
    const [costPerMile, setCostPerMile] = useState(0.655);

    const [containerOrderDetails, setContainerOrderDetails] = useState(false);
    const [containerTravelDetails, setContainerTravelDetails] = useState(false);

    /* Service calculation */

    const [totalServiceInterpreter, setTotalServiceInterpreter] = useState(0);
    const [totalServiceCoordinator, setTotalServiceCoordinator] = useState(0);
    const [totalService, setTotalService] = useState(0);

    /* Mileage calculation */

    const [totalMileageInterpreter, setTotalMileageInterpreter] = useState(0);
    const [totalMileageCoordinator, setTotalMileageCoordinator] = useState(0);
    const [totalMileage, setTotalMileage] = useState(0);

    /* Summary */

    const [comments, setComments] = useState('');

    /* Result */

    const [invoiceId, setInvoiceId] = useState(null);

    /*  Active step variable */

    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set());

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    /* Autocomplete agency */

    const handleOnChangeAgency = (agency) => {
        setAgencyId(agency.id);
    }

    /* Autocomplete interpreter */

    const handleOnChangeInterpreter = (interpreter) => {
        setInterpreterId(interpreter.id);
        setInterpreterPhoneNum(interpreter.phone_number);
        setInterpreterSSN(interpreter.ssn);
        setInterpreterAddress(interpreter.address);
        setInterpreterCity(interpreter.city);
        setInterpreterState(interpreter.state);
        setInterpreterEmail(interpreter.email);
        setInterpreterZipCode(interpreter.zip_code);
        setInterpreterContainer(true);
        setInterpreterSelected(true);
    }

    const handleClearInterpreter = () => {
        setInterpreterId('');
        setInterpreterPhoneNum('');
        setInterpreterSSN('');
        setInterpreterAddress('');
        setInterpreterCity('');
        setInterpreterState('');
        setInterpreterEmail('');
        setInterpreterZipCode('');
        setInterpreterContainer(false);
        setInterpreterSelected(false);
    }

    /* Autocomplete address */
    const handleOnChangeAddress = (address) => {
        console.log(address);
        setServiceAddressId(address.id);
        setServiceAddress(address.address);
        setServiceCity(address.city);
        setServiceState(address.state);
        setServiceZipCode(address.zipCode);
    }

    const handleClearAddress = () => {
        setServiceAddressId('');
        setServiceCity('');
        setServiceState('');
        setServiceZipCode('');
    }

    /* Autocomplete description */

    const handleOnChangeDescription = (description) => {
        setDescription(description.title);
        setDescriptionId(description.id);
    }

    /* Functions for calculate service */

    const calculateInterpreterService = (arrivalTime, startTime, endTime) => {
        setContainerOrderDetails(false);
        if (arrivalTime && startTime && endTime) {

            const arrivalTimeFloat = timeStringToFloat(format(arrivalTime, 'HH:mm'));
            const startTimeFloat = timeStringToFloat(format(startTime, 'HH:mm'));
            const endTimeFloat = timeStringToFloat(format(endTime, 'HH:mm'));

            const LenguageNameSelected = lenguages.find(lenguage => lenguage.id === interpreterLenguageId);

            let totalTime = Math.round((endTimeFloat - startTimeFloat) * 100) / 100;
            if (totalTime > 0 && totalTime < 2) {
                totalTime = 2;
            }
            const totalCostService = LenguageNameSelected.price_per_hour * totalTime;
            console.log(totalCostService, totalTime);

            if (totalCostService > 0) {
                let totalInterpreter = 0;

                if (LenguageNameSelected.name === 'Spanish') {
                    totalInterpreter = 25 * totalTime;
                }
                else {
                    totalInterpreter = 30 * totalTime;
                }

                const totalCoordinador = (LenguageNameSelected.price_per_hour - (totalInterpreter / totalTime)) * totalTime;

                setTotalServiceInterpreter(totalInterpreter);
                setTotalServiceCoordinator(totalCoordinador);
                setTotalService(totalCostService);
                setContainerOrderDetails(true);
            }
        }
    }

    const timeStringToFloat = (time) => {
        const [hours, minutes] = time.split(':');
        return Math.round((parseFloat(hours) + parseFloat(minutes) / 60) * 100) / 100;
    }

    const calculateMileage = (travelMileage, costPerMile) => {
        setContainerTravelDetails(false);
        if (travelMileage >= 50 && costPerMile > 0) {
            const totalCostMileage = travelMileage * costPerMile;
            let totalInterpreter = 0;
            let totalCoordinator = 0;
            if (costPerMile > 0.50) {
                totalCoordinator = (costPerMile - 0.50) * travelMileage;
                totalInterpreter = 0.50 * travelMileage;
            }
            else {
                totalInterpreter = totalCostMileage;
            }

            if (totalCostMileage > 0) {
                setTotalMileageInterpreter(totalInterpreter);
                setTotalMileageCoordinator(totalCoordinator);
                setTotalMileage(totalCostMileage);
                setContainerTravelDetails(true);
            }
        }
    }

    /* Handle submit new service */

    const handleSubmitNewInvoice = () => {
        const newInvoice = {
            'coordinator_id': 1,
            'user_id': 1,
            'agency_id': agencyId,
            'interpreter_id': interpreterId,
            'interpreterName': interpreterName,
            'interpreterPhoneNum': interpreterPhoneNum,
            'interpreterSSN': interpreterSSN,
            'interpreterAddress': interpreterAddress,
            'interpreterCity': interpreterCity,
            'interpreterState': interpreterState,
            'interpreterZipCode': interpreterZipCode,
            'interpreterEmail': interpreterEmail,
            'interpreterLenguageId': interpreterLenguageId,

            'description_id': descriptionId,
            'description': description,

            'address_id': serviceAddressId,
            'address': serviceAddress,
            'city': serviceCity,
            'state': serviceState,
            'state_abbr': states.find((item) => item.name === serviceState).iso2,
            'zip_code': serviceZipCode,

            'total_amount': (totalService + totalMileage).toFixed(2),
            'date_of_service_provided': format(dateServiceProvided, 'yyyy-MM-dd'),
            'arrival_time': format(arrivalTime, 'HH:mm'),
            'start_time': format(startTime, 'HH:mm'),
            'end_time': format(endTime, 'HH:mm'),
            'travel_time_to_assignment': travelTimeToAssignment,
            'time_back_from_assignment': timeBackFromAssignment,
            'travel_mileage': travelMileage,
            'cost_per_mile': costPerMile,
            'total_amount_miles': totalMileage,
            'total_amount_hours': totalService,
            'total_interpreter': (totalServiceInterpreter + totalMileageInterpreter).toFixed(2),
            'total_coordinator': (totalServiceCoordinator + totalMileageCoordinator).toFixed(2),
            comments,
        };

        axios.post(`${config.APPBACK_URL}/api/invoices`, newInvoice)
            .then((response) => {
                console.log(response);
                setInvoiceId(response.data.invoice);
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
            })
            .catch((error) => {
                console.log(error);
            });

    }

    /* Get axios */

    const getLenguages = () => {
        axios.get(`${config.APPBACK_URL}/api/lenguages/status`)
            .then((response) => {
                setLenguages(response.data);
            })
            .catch((error) => {
                console.log(error);
            }
            );
    }

    const getStates = () => {
        axios.get('https://api.countrystatecity.in/v1/countries/US/states', {
            headers: {
                'X-CSCAPI-KEY': 'N3NXRVN4V1Y1YVJmSTd6ZHR3b1NlMDlMRkRRVFQ2c0JWWmcxbmNUWg=='
            }
        })
            .then((response) => {
                setStates(response.data);
            })
            .catch((error) => {
                console.log(error);
            }
            );
    }

    useEffect(() => {
        getStates();
        getLenguages();
    }, []);

    /* Functions for New service */

    function AgencyInterpreterDetails() {
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
                    Enter the data of the agency
                </Typography>
                <SearchAgency handleOnChangeAgency={handleOnChangeAgency} setAgencyName={setAgencyName} agencyName={agencyName} />
                <Typography variant="subtitle1" gutterBottom marginBottom={2} marginTop={2} sx={{ width: '100%' }}>
                    Enter the address of the service
                </Typography>
                <Stack direction="row" sx={{flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControl sx={{ width: '37%' }}>
                    <SearchAddress
                        handleOnChangeAddress={handleOnChangeAddress}
                        setAddress={setServiceAddress}
                        address={serviceAddress}
                        serviceCity={serviceCity}
                        setServiceCity={setServiceCity}
                        serviceState={serviceState}
                        setServiceState={setServiceState}
                        serviceZipCode={serviceZipCode}
                        setServiceZipCode={setServiceZipCode}
                        toast={toast}
                        handleClearAddress={handleClearAddress}
                    />
                </FormControl>
                    <FormControl sx={{ width: '20%' }}>
                        <TextField
                            id="city"
                            label="City"
                            variant="outlined"
                            placeholder="Enter the city"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={serviceCity}
                            onChange={(e) => setServiceCity(e.target.value)}
                        />
                    </FormControl>
                    <FormControl sx={{ width: '25%' }}>
                        <InputLabel id="customer-select-label"
                            sx={{ width: 400 }}
                        >State</InputLabel>
                        <Select
                            labelId="customer-select-label"
                            id="customer-select"
                            label="State"
                            value={serviceState}
                            onChange={(e) => setServiceState(e.target.value)}
                        >
                            <MenuItem disabled value="none">
                                <em style={{ color: 'gray' }}>Choose</em>
                            </MenuItem>
                            {states.map((state) => (
                                <MenuItem key={state.iso2} value={state.name}>{state.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ width: '12%' }}>
                        <TextField
                            id="zip"
                            label="Zip"
                            variant="outlined"
                            placeholder="Enter the zip"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={serviceZipCode}
                            onChange={(e) => setServiceZipCode(e.target.value)}
                        />
                    </FormControl>

                    <Typography variant="subtitle1" gutterBottom marginBottom={2} marginTop={2} sx={{ width: '100%' }}>
                        Enter the data of the interpreter
                    </Typography>

                    <FormControl sx={{ width: '37%' }}>
                        <InputLabel id="lenguage-select-label"
                            sx={{ width: 400 }}
                        >Lenguage</InputLabel>
                        <Select
                            labelId="lenguage-select-label"
                            id="lenguage-select"
                            label="Lenguage"
                            value={interpreterLenguageId}
                            onChange={(e) => setInterpreterLenguageId(e.target.value)}
                        >
                            <MenuItem disabled value="none">
                                <em style={{ color: 'gray' }}>Choose</em>
                            </MenuItem>
                            {lenguages.map((lenguage) => (
                                <MenuItem key={lenguage.id} value={lenguage.id}>{lenguage.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ width: '61%' }}>
                        <SearchInterpreter
                            handleOnChangeInterpreter={handleOnChangeInterpreter}
                            serviceState={serviceState}
                            interpreterLenguageId={interpreterLenguageId}
                            setInterpreterContainer={setInterpreterContainer}
                            setInterpreterName={setInterpreterName}
                            interpreterName={interpreterName}
                            toast={toast}
                            handleClearInterpreter={handleClearInterpreter}
                            />
                    </FormControl>
                </Stack>
                {
                    interpreterContainer ?
                        <InterpreterData
                            setInterpreterPhoneNum={setInterpreterPhoneNum}
                            interpreterPhoneNum={interpreterPhoneNum}
                            setInterpreterEmail={setInterpreterEmail}
                            interpreterEmail={interpreterEmail}
                            setInterpreterSSN={setInterpreterSSN}
                            interpreterSSN={interpreterSSN}
                            setInterpreterAddress={setInterpreterAddress}
                            interpreterAddress={interpreterAddress}
                            setInterpreterCity={setInterpreterCity}
                            interpreterCity={interpreterCity}
                            setInterpreterState={setInterpreterState}
                            interpreterState={interpreterState}
                            setInterpreterZipCode={setInterpreterZipCode}
                            interpreterZipCode={interpreterZipCode}
                            interpreterSelected={interpreterSelected}
                        />
                        : null
                }
            </Container>
        );
    }

    function serviceDetails() {
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
                    Enter the service data
                </Typography>
                <SearchDescription handleOnChangeDescription={handleOnChangeDescription} setDescription={setDescription} description={description} toast={toast} setDescriptionId={setDescriptionId} />
                <Stack direction="row" sx={{ marginTop: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControl sx={{ width: '37%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date of service Provided"
                                value={dateServiceProvided}
                                onChange={(newValue) => {
                                    setDateServiceProvided(newValue);
                                }}
                            />
                        </LocalizationProvider>
                    </FormControl>
                    <FormControl sx={{ width: '19%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                                label="Arrival time"
                                value={arrivalTime}
                                onChange={(newValue) => {
                                    setArrivalTime(newValue);
                                    calculateInterpreterService(newValue, startTime, endTime);
                                }}
                            />
                        </LocalizationProvider>
                    </FormControl>
                    <FormControl sx={{ width: '19%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                                label="Start time"
                                value={startTime}
                                onChange={(newValue) => {
                                    setStartTime(newValue);
                                    calculateInterpreterService(arrivalTime, newValue, endTime);
                                }}
                            />
                        </LocalizationProvider>
                    </FormControl>
                    <FormControl sx={{ width: '19%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                                label="End time"
                                value={endTime}
                                onChange={(newValue) => {
                                    setEndTime(newValue);
                                    calculateInterpreterService(arrivalTime, startTime, newValue);
                                }}
                            />
                        </LocalizationProvider>
                    </FormControl>
                    <FormControl sx={{ width: '37%', marginTop: '20px' }}>
                        <TextField
                            id="outlined-multiline-static"
                            label="Travel time to assignment"
                            value={travelTimeToAssignment}
                            onChange={(e) => setTravelTimeToAssignment(e.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Minutes</InputAdornment>,
                            }}
                        />
                    </FormControl>
                    <FormControl sx={{ width: '61%', marginTop: '20px' }}>
                        <TextField
                            id="outlined-multiline-static"
                            label="Time back from assignment"
                            value={timeBackFromAssignment}
                            onChange={(e) => setTimeBackFromAssignment(e.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Minutes</InputAdornment>,
                            }}
                        />
                    </FormControl>
                    <FormControl sx={{ width: '37%', marginTop: '20px' }}>
                        <TextField
                            id="outlined-multiline-static"
                            label="Travel mileage (round trip)"
                            value={travelMileage}
                            onChange={(e) => {
                                setTravelMileage(e.target.value);
                                calculateMileage(e.target.value, costPerMile);
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Miles</InputAdornment>,
                            }}
                        />
                    </FormControl>
                    <FormControl sx={{ width: '61%', marginTop: '20px' }}>
                        <TextField
                            id="outlined-multiline-static"
                            label="Cost per mile"
                            value={costPerMile}
                            onChange={(e) => {
                                setCostPerMile(e.target.value);
                                calculateMileage(travelMileage, e.target.value);
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">USD</InputAdornment>,
                            }}
                        />
                    </FormControl>
                </Stack>


                {/* Display details order */}
                {
                    containerOrderDetails ?
                        (
                            <>
                                <hr style={{ marginTop: '20px', marginBottom: '20px', border: '1px solid #e0e0e0' }} />
                                <Stack direction="row" sx={{ marginTop: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Grid container spacing={3} justifyContent="space-around">
                                        {
                                            containerTravelDetails ?
                                                (
                                                    <>
                                                        <Grid item xs={10}>
                                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                                Mileage: {travelMileage} miles @ ${costPerMile}/mile
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={1}>
                                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                                ${totalMileage.toFixed(2)}
                                                            </Typography>
                                                        </Grid>
                                                    </>
                                                )
                                                : null
                                        }
                                        <Grid item xs={10}>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                Interpreter services rate: ${
                                                    lenguages.find((item) => item.id === interpreterLenguageId).price_per_hour
                                                } per hour for two (2) hours minium
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                ${totalService.toFixed(2)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={10}>
                                            <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                                                Total Amount Due:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                                                ${(totalService + totalMileage).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </>
                        )
                        : null
                }
            </Container>
        );
    }

    function summaryDetails() {
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
                    Service Request Details
                </Typography>
                <Grid container spacing={3} sx={{
                    mb: 3,
                }}>
                    <Grid item xs={12} md={6} lg={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Name agency
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {agencyName}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Address of service
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {serviceAddress}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Description
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {description}
                        </Typography>
                    </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mb: 3 }}>
                    Interpreter Details
                </Typography>
                <Grid container spacing={3} sx={{
                    mb: 3,
                }}>
                    <Grid item xs={12} md={6} lg={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Full Name
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {interpreterName}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            SSN
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {interpreterSSN}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Phone Number
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {interpreterPhoneNum}
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

                {
                    containerTravelDetails ?
                        (
                            <Typography variant="subtitle1" sx={{ marginY: 2, textAlign: 'center', color: 'text.secondary' }}>
                                Mileage: {travelMileage} miles @ ${costPerMile}/mile: ${totalMileage.toFixed(2)}
                            </Typography>
                        )
                        : null
                }
                <Typography variant="subtitle1" sx={{ marginY: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Interpreter services rate: ${
                        lenguages.find((item) => item.id === interpreterLenguageId).price_per_hour
                    } per hour for two (2) hours minium: ${(totalService.toFixed(2))}
                </Typography>
                <Typography variant="subtitle1" sx={{ marginY: 2, textAlign: 'center' }}>
                    Total Amount Due: ${(totalService + totalMileage).toFixed(2)}
                </Typography>

                <Typography variant="h6" sx={{ marginY: 2 }}>
                    Actions
                </Typography>
                
                <Grid item xs={12} md={6} lg={4}>
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 3,
                            gridTemplateColumns: 'repeat(2, 1fr)',
                        }}
                    >
                        <Button
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            onClick={
                                () => {
                                    /* Reaload  */
                                    window.location.reload();
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
                            onClick={handleSubmitNewInvoice}
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
                <title> Generate Invoice | IA System </title>
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
                        New service
                    </Link>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ mb: 5, mt: 3 }}>
                    New service
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
                                    if (isStepSkipped(index)) {
                                        stepProps.completed = false;
                                    }
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
                                        invoiceId ? (
                                            <Stack spacing={3} sx={{ mb: 4 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <Iconify icon="material-symbols:check-circle" color="#00BB2D" width={50} height={50} />
                                                </Box>
                                                <Typography variant="h6" gutterBottom sx={
                                                    {
                                                        textAlign: 'center'
                                                    }
                                                }>
                                                    The service has been generated successfully
                                                </Typography>
                                                <Typography variant="body1" sx={
                                                    {
                                                        textAlign: 'center'
                                                    }
                                                }>
                                                    You can download the invoice in PDF format
                                                </Typography>

                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                                                    <a
                                                        href={`${config.APPBACK_URL}/api/invoices/${invoiceId}/download/`}
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
                                                            Download PDF
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
                                                        Create another service
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        ) : null
                                    }
                                </Container>
                            ) : (
                                <>
                                    {
                                        activeStep === 0 ? AgencyInterpreterDetails() :
                                            activeStep === 1 ? serviceDetails() :
                                                activeStep === 2 ? summaryDetails() : null
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
        </>
    )
}
