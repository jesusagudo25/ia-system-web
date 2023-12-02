import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import InputAdornment from '@mui/material/InputAdornment';
import { format, parseISO } from 'date-fns';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { SearchInterpreter } from '../sections/@manage/interpreter/SearchInterpreter';
import { SearchAgency } from '../sections/@manage/agency/SearchAgency';
import { InterpreterData } from '../sections/@manage/interpreter/InterpreterData';
import { SearchDescription } from '../sections/@manage/description/SearchDescription';
import { SearchAddress } from '../sections/@manage/interpreter/SearchAddress';
import config from '../config.json';
import Iconify from '../components/iconify';

const steps = ['Agency and Interpreter data', 'Service data', 'Summary'];

export const NewServicePage = () => {

    /* Detect id */
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    /* Form */
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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
    const [addressSelected, setAddressSelected] = useState(false); // [1

    /* New service variable */

    const [assignmentNumber, setAssignmentNumber] = useState('');
    const [assignmentNumberOld, setAssignmentNumberOld] = useState('');
    const [timeIsNull, setTimeIsNull] = useState(true);

    const [miscellaneous, setMiscellaneous] = useState(0);

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

    const handleNext = () => {
        const errors = {};
        let flag;
        if (activeStep === 0) {
            if (agencyId === '') {
                errors.agency = 'Agency is required';
                flag = true;
            }

            if (interpreterId === '' && interpreterContainer === false) {
                errors.interpreter = 'Interpreter is required';
                flag = true;
            }

            if (interpreterContainer === true) {
                if (interpreterName === '') {
                    errors.interpreterName = 'Name is required';
                    flag = true;
                }

                if (interpreterEmail === '') {
                    errors.interpreterEmail = 'Email is required';
                    flag = true;
                }

                if (interpreterPhoneNum === '') {
                    errors.interpreterPhoneNum = 'Phone number is required';
                    flag = true;
                }

                if (interpreterSSN === '') {
                    errors.interpreterSSN = 'SSN is required';
                    flag = true;
                }

                if (interpreterAddress === '') {
                    errors.interpreterAddress = 'Address is required';
                    flag = true;
                }

                if (interpreterCity === '') {
                    errors.interpreterCity = 'City is required';
                    flag = true;
                }

                if (interpreterState === '') {
                    errors.interpreterState = 'State is required';
                    flag = true;
                }

                if (interpreterZipCode === '') {
                    errors.interpreterZipCode = 'Zip code is required';
                    flag = true;
                }

                if (interpreterLenguageId === 'none') {
                    errors.lenguage = 'Lenguage is required';
                    flag = true;
                }
            }

            if (serviceAddressId === '') {

                if (serviceAddress === '') {
                    errors.serviceAddress = 'Address is required';
                    flag = true;
                }

                if (serviceCity === '') {
                    errors.serviceCity = 'City is required';
                    flag = true;
                }

                if (serviceState === '' || serviceState === 'none') {
                    errors.serviceState = 'State is required';
                    flag = true;
                }

                if (serviceZipCode === '') {
                    errors.serviceZipCode = 'Zip is required';
                    flag = true;
                }

            }

            if (interpreterLenguageId === 'none') {
                errors.lenguage = 'Lenguage is required';
                flag = true;
            }
        }
        if (activeStep === 1) {

            if (assignmentNumber === '') {
                errors.assignmentNumber = 'Assignment number is required';
                flag = true;
            }

            if (description === '') {
                errors.description = 'Description is required';
                flag = true;
            }

            if (dateServiceProvided === '' || JSON.stringify(dateServiceProvided) === 'null') {
                errors.dateServiceProvided = 'Date of service provided is required';
                flag = true;
            }

            if (timeIsNull) {
                if (arrivalTime === '') {
                    errors.arrivalTime = 'Arrival time is required';
                    flag = true;
                }

                if (startTime === '') {
                    errors.startTime = 'Start time is required';
                    flag = true;
                }

                if (endTime === '') {
                    errors.endTime = 'End time is required';
                    flag = true;
                }
            }

            if (travelTimeToAssignment === '') {
                errors.travelTimeToAssignment = 'Travel time to assignment is required';
                flag = true;
            }

            if (timeBackFromAssignment === '') {
                errors.timeBackFromAssignment = 'Time back from assignment is required';
                flag = true;
            }

            if (travelMileage === '') {
                errors.travelMileage = 'Travel mileage is required';
                flag = true;
            }

            if (costPerMile === '') {
                errors.costPerMile = 'Cost per mile is required';
                flag = true;
            }

            if (containerOrderDetails === false) {
                toast.warning('Please calculate the service, the date is not correct');
                flag = true;
            }
        }

        if (flag) {
            toast.error('Please fill in the required fields');
            setErrors(errors);
            return;
        }

        setErrors({});
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

        switch (activeStep) {
            case 0:
                break;
            default:
        }
    };

    const handleOnBlurAssignmentNumber = () => {
        /* validar el assignment number, si hay un id es porque se esta editando, entonces que no se valide por el mismo id */

        if (assignmentNumber !== '' && assignmentNumber !== assignmentNumberOld) {
            axios.get(`${config.APPBACK_URL}/api/invoices/assignmentNumber/${assignmentNumber}`)
                .then((response) => {
                })
                .catch((error) => {
                    console.log(error);
                    toast.error('Assignment number already exists');
                    setAssignmentNumber('');
                });
        }
    }

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
        calculateInterpreterService(arrivalTime, startTime, endTime, timeIsNull, interpreterLenguageId);
    }

    const handleClearInterpreter = () => {
        setInterpreterId('');
        setInterpreterPhoneNum('');
        setInterpreterSSN('');
        setInterpreterAddress('');
        setInterpreterCity('');
        setInterpreterState('none');
        setInterpreterEmail('');
        setInterpreterZipCode('');
        setInterpreterContainer(false);
        setInterpreterSelected(false);
        setErrors({});
        calculateInterpreterService('', '', '', true, 'none');
    }

    /* Autocomplete address */

    const handleOnChangeAddress = (address) => {
        setServiceAddressId(address.id);
        setServiceAddress(address.address);
        setServiceCity(address.city);
        setServiceState(address.state);
        setServiceZipCode(address.zipCode);
        setAddressSelected(true);
    }

    const handleClearAddress = () => {
        setServiceAddressId('');
        setServiceCity('');
        setServiceState('none');
        setServiceZipCode('');
        setAddressSelected(false);
        setErrors({});
    }

    /* Autocomplete description */

    const handleOnChangeDescription = (description) => {
        setDescription(description.title);
        setDescriptionId(description.id);
    }

    /* Functions for calculate service - Time */

    const timeStringToFloat = (time) => {
        const [hours, minutes] = time.split(':');
        return Math.round((parseFloat(hours) + parseFloat(minutes) / 60) * 100) / 100;
    }

    const calculateInterpreterService = (arrivalTime, startTime, endTime, timeIsNull, interpreterLenguageId) => {

        setContainerOrderDetails(false);

        if (timeIsNull) { // Si el tiempo esta habilitado, se calcula el servicio en base a las horas ingresadas
            if (arrivalTime && startTime && endTime) {
                const arrivalTimeFloat = timeStringToFloat(format(arrivalTime, 'HH:mm'));
                const startTimeFloat = timeStringToFloat(format(startTime, 'HH:mm'));
                const endTimeFloat = timeStringToFloat(format(endTime, 'HH:mm'));

                // Calcular utilizando cuartos de hora
                const arrivalTimeRounded = Math.ceil(arrivalTimeFloat * 4) / 4;
                const startTimeRounded = Math.ceil(startTimeFloat * 4) / 4;
                const endTimeRounded = Math.ceil(endTimeFloat * 4) / 4;

                /* Se busca el lenguaje seleccionado, para obtener el precio por hora */
                const LenguageNameSelected = lenguages.find(lenguage => lenguage.id === interpreterLenguageId);

                let totalTime = Math.round((endTimeRounded - startTimeRounded) * 100) / 100;

                if (totalTime > 0 && totalTime <= 2) {
                    totalTime = 2;
                }

                const totalCostService = LenguageNameSelected.price_per_hour * totalTime;

                if (totalCostService > 0) {
                    const totalInterpreter = LenguageNameSelected.price_per_hour_interpreter * totalTime;
                    const totalCoordinador = (LenguageNameSelected.price_per_hour - (totalInterpreter / totalTime)) * totalTime;

                    setTotalServiceInterpreter(totalInterpreter);
                    setTotalServiceCoordinator(totalCoordinador);
                    setTotalService(totalCostService);
                    setContainerOrderDetails(true);
                }
            }
            else {
                setTotalServiceInterpreter(0);
                setTotalServiceCoordinator(0);
                setTotalService(0);
                setContainerOrderDetails(false);
            }
        }
        else {
            const LenguageNameSelected = lenguages.find(lenguage => lenguage.id === interpreterLenguageId);
            const totalTime = 2;
            const totalCostService = LenguageNameSelected.price_per_hour * totalTime;
            /*  40 * 2 = 80 */

            /* Se calcula la cantidad para el interprete, en base al lenguaje seleccionado:
                * el tiempo total
                * el precio por hora del interprete (25 o 30) */
            const totalInterpreter = LenguageNameSelected.price_per_hour_interpreter * totalTime;

            /*
            El 40 es el precio por hora del lenguaje seleccionado
            El 50 es el precio por hora del interprete
            El 2 es el tiempo total
            Aqui se calcula el precio del coordinador restandole el precio del interprete y multiplicandolo por el tiempo total del servicio.
            */
            const totalCoordinador = (LenguageNameSelected.price_per_hour - (totalInterpreter / totalTime)) * totalTime;
            // 40 - (50 / 2) * 2 = 40 - 25 = 15 * 2 = 30

            setTotalServiceInterpreter(totalInterpreter);
            setTotalServiceCoordinator(totalCoordinador);
            setTotalService(totalCostService);
            setContainerOrderDetails(true);
        }
    }

    /* Functions for calculate service - Travel */


    const calculateMileage = (travelMileage, costPerMile) => {
        setContainerTravelDetails(false);
        if (travelMileage > 0 && costPerMile > 0) {
            const totalCostMileage = travelMileage * costPerMile;
            let totalInterpreter = 0;
            let totalCoordinator = 0;

            if (travelMileage > 0 && travelMileage < 50) {
                totalCoordinator = totalCostMileage;
            }
            else if (travelMileage >= 50) {
                totalInterpreter = totalCostMileage;
            }

            setTotalMileageInterpreter(totalInterpreter);
            setTotalMileageCoordinator(totalCoordinator);
            setTotalMileage(totalCostMileage);
            setContainerTravelDetails(true);

        } else {
            setTotalMileageInterpreter(0);
            setTotalMileageCoordinator(0);
            setTotalMileage(0);
        }
    }

    /* Handle submit new service or update */

    const handleSubmitNewInvoice = () => {
        setIsLoading(true);

        const newInvoice = {
            /* Interpreters and coordinators */
            'coordinator_id': 1,
            'user_id': localStorage.getItem('id'),
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

            /* Address service */
            'address_id': serviceAddressId,
            'address': serviceAddress,
            'city': serviceCity,
            'state': serviceState,
            'state_abbr': states.find((item) => item.name === serviceState).iso2,
            'zip_code': serviceZipCode,

            /* Invoice details */
            'assignment_number': assignmentNumber,
            'description_id': descriptionId,
            'description': description,
            'date_of_service_provided': format(dateServiceProvided, 'yyyy-MM-dd'),
            'arrival_time': timeIsNull ? format(arrivalTime, 'HH:mm') : null,
            'start_time': timeIsNull ? format(startTime, 'HH:mm') : null,
            'end_time': timeIsNull ? format(endTime, 'HH:mm') : null,
            'travel_time_to_assignment': travelTimeToAssignment,
            'time_back_from_assignment': timeBackFromAssignment,
            'miscellaneous': parseFloat(miscellaneous).toFixed(2),

            'travel_mileage': travelMileage,
            'cost_per_mile': costPerMile,

            'total_amount_miles': totalMileage,
            'total_amount_hours': totalService,

            'total_interpreter': (totalServiceInterpreter + totalMileageInterpreter).toFixed(2),
            'total_coordinator': (totalServiceCoordinator + totalMileageCoordinator).toFixed(2),

            'total_amount': (totalService + totalMileage).toFixed(2),
            comments,
        };

        if (miscellaneous > 0) {
            newInvoice.total_interpreter = (parseFloat(newInvoice.total_interpreter) + Math.abs(miscellaneous)).toFixed(2);
            newInvoice.total_coordinator = (parseFloat(newInvoice.total_coordinator) - Math.abs(miscellaneous)).toFixed(2);
        }
        else {
            newInvoice.total_interpreter = (parseFloat(newInvoice.total_interpreter) - Math.abs(miscellaneous)).toFixed(2);
            newInvoice.total_coordinator = (parseFloat(newInvoice.total_coordinator) + Math.abs(miscellaneous)).toFixed(2);
        }

        if(newInvoice.total_interpreter < 0 || newInvoice.total_coordinator < 0){
            toast.error('The miscellaneous amount cannot be greater than the total amount');
            setIsLoading(false);
            return;
        }

        if (id) {
            newInvoice.id = id;
            axios.put(`${config.APPBACK_URL}/api/invoices/${id}`, newInvoice)
                .then((response) => {

                    toast.success('Invoice updated successfully');

                    setTimeout(() => {
                        setIsLoading(false);
                        navigate('/dashboard/service-history');
                    }, 2000);
                }
                )
                .catch((error) => {
                    console.log(error);
                    setIsLoading(false);
                }
                );

        }
        else {
            axios.post(`${config.APPBACK_URL}/api/invoices`, newInvoice)
                .then((response) => {
                    setInvoiceId(response.data.invoice);
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                    setIsLoading(false);
                });
        }

    }

    /* Get axios */

    const getLenguages = () => {
        setIsLoading(true);
        axios.get(`${config.APPBACK_URL}/api/lenguages/status`)
            .then((response) => {
                setIsLoading(false);
                setLenguages(response.data);
            })
            .catch((error) => {
                console.log(error);
            }
            );
    }

    const getStates = () => {
        setIsLoading(true);
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

    const getServiceDetails = () => {
        setIsLoading(true);
        axios.get(`${config.APPBACK_URL}/api/invoices/${id}`)
            .then((response) => {
                /* Agency */
                setAgencyId(response.data.agency.id);
                setAgencyName(response.data.agency.name);

                /* Address */
                setServiceAddressId(response.data.address.id);
                setServiceAddress(response.data.address.address);
                setServiceCity(response.data.address.city);
                setServiceState(response.data.address.state);
                setServiceZipCode(response.data.address.zip_code);
                setAddressSelected(true);

                /* Interpreter */
                setInterpreterId(response.data.interpreter.id);
                setInterpreterName(response.data.interpreter.full_name);
                setInterpreterPhoneNum(response.data.interpreter.phone_number);
                setInterpreterSSN(response.data.interpreter.ssn);
                setInterpreterAddress(response.data.interpreter.address);
                setInterpreterCity(response.data.interpreter.city);
                setInterpreterState(response.data.interpreter.state);
                setInterpreterZipCode(response.data.interpreter.zip_code);
                setInterpreterEmail(response.data.interpreter.email);
                setInterpreterLenguageId(response.data.interpreter.lenguage_id);
                setInterpreterSelected(true);
                setInterpreterContainer(true);

                /* Service variable */
                setAssignmentNumber(response.data.details.assignment_number);
                setAssignmentNumberOld(response.data.details.assignment_number);
                setDescriptionId(response.data.description.id);
                setDescription(response.data.description.title);
                setDateServiceProvided(new Date(`${format(parseISO(response.data.details.date_of_service_provided), 'yyyy-MM-dd')}T00:00:00`));
                setMiscellaneous(response.data.details.miscellaneous);

                if (response.data.details.arrival_time === null && response.data.details.start_time === null && response.data.details.end_time === null) {
                    setTimeIsNull(false);
                    calculateInterpreterService(response.data.details.arrival_time, response.data.details.start_time, response.data.details.end_time, false, response.data.interpreter.lenguage_id);
                } else {
                    setTimeIsNull(true);
                    setArrivalTime(parseISO(`${response.data.details.date_of_service_provided}T${response.data.details.arrival_time}`));
                    setStartTime(parseISO(`${response.data.details.date_of_service_provided}T${response.data.details.start_time}`));
                    setEndTime(parseISO(`${response.data.details.date_of_service_provided}T${response.data.details.end_time}`));
                    calculateInterpreterService(
                        parseISO(`${response.data.details.date_of_service_provided}T${response.data.details.arrival_time}`),
                        parseISO(`${response.data.details.date_of_service_provided}T${response.data.details.start_time}`),
                        parseISO(`${response.data.details.date_of_service_provided}T${response.data.details.end_time}`),
                        true,
                        response.data.interpreter.lenguage_id
                    );
                }

                setTravelMileage(response.data.details.travel_mileage);
                setCostPerMile(response.data.details.cost_per_mile);
                calculateMileage(response.data.details.travel_mileage, response.data.details.cost_per_mile);

                setTravelTimeToAssignment(response.data.details.travel_time_to_assignment);
                setTimeBackFromAssignment(response.data.details.time_back_from_assignment);

                /* Comments */
                setComments(response.data.details.comments);

                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            }
            );
    };

    useEffect(() => {
        getStates();
        getLenguages();
    }, []);

    useEffect(() => {
        if (lenguages.length > 0) {
            if (id) {
                getServiceDetails();
            }
        }
    }, [lenguages]);

    useEffect(() => {
        if (location.pathname === '/dashboard/new-service') {
            /* Clear data */
            setAgencyId('');
            setAgencyName('');
            setServiceAddressId('');
            setServiceAddress('');
            setServiceCity('');
            setServiceState('none');
            setServiceZipCode('');
            setAddressSelected(false);
            setInterpreterId('');
            setInterpreterName('');
            setInterpreterPhoneNum('');
            setInterpreterSSN('');
            setInterpreterAddress('');
            setInterpreterCity('');
            setInterpreterState('');
            setInterpreterZipCode('');
            setInterpreterEmail('');
            setInterpreterLenguageId('none');
            setInterpreterSelected(false);
            setInterpreterContainer(false);
            setAssignmentNumber('');
            setDescriptionId('');
            setDescription('');
            setDateServiceProvided(new Date());
            setTimeIsNull(true);
            setArrivalTime('');
            setStartTime('');
            setEndTime('');
            setTravelMileage(0);
            setCostPerMile(0.655);
            setTravelTimeToAssignment('');
            setTimeBackFromAssignment('');
            setMiscellaneous(0);
            setComments('');
            setErrors({});
            setInvoiceId(null);
            setActiveStep(0);
        }
        else if (id) {
            getServiceDetails();
            setActiveStep(0);
        }
    }, [location]);

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
                <SearchAgency handleOnChangeAgency={handleOnChangeAgency} setAgencyName={setAgencyName} agencyName={agencyName} errors={errors} toast={toast} setAgencyId={setAgencyId} />
                <Typography variant="subtitle1" gutterBottom marginBottom={2} marginTop={2} sx={{ width: '100%' }}>
                    Enter the address of the service
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
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
                            errors={errors}
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
                            error={errors.serviceCity}
                            helperText={errors.serviceCity ? errors.serviceCity : null}
                            disabled={addressSelected}
                        />
                    </FormControl>
                    <FormControl sx={{ width: '25%' }} error={errors.serviceState}>
                        <InputLabel id="customer-select-label"
                            sx={{ width: 400 }}
                        >State</InputLabel>
                        <Select
                            labelId="customer-select-label"
                            id="customer-select"
                            label="State"
                            value={serviceState}
                            onChange={(e) => setServiceState(e.target.value)}
                            disabled={addressSelected}
                        >
                            <MenuItem disabled value="none">
                                <em style={{ color: 'gray' }}>Choose</em>
                            </MenuItem>
                            {states.map((state) => (
                                <MenuItem key={state.iso2} value={state.name}>{state.name}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText error={errors.serviceState}>{errors.serviceState ? errors.serviceState : null}</FormHelperText>
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
                            disabled={addressSelected}
                            error={errors.serviceZipCode}
                            helperText={errors.serviceZipCode ? errors.serviceZipCode : null}
                        />
                    </FormControl>

                    <Typography variant="subtitle1" gutterBottom marginBottom={2} marginTop={2} sx={{ width: '100%' }}>
                        Enter the data of the interpreter
                    </Typography>

                    <FormControl sx={{ width: '37%' }} error={errors.lenguage}>
                        <InputLabel id="lenguage-select-label"
                            sx={{ width: 400 }}
                        >Language</InputLabel>
                        <Select
                            labelId="lenguage-select-label"
                            id="lenguage-select"
                            label="Lenguage"
                            value={interpreterLenguageId}
                            onChange={(e) => {
                                setInterpreterLenguageId(e.target.value);
                                setInterpreterName('');
                                handleClearInterpreter();
                                calculateInterpreterService(arrivalTime, startTime, endTime, timeIsNull, e.target.value);
                            }}
                        >
                            <MenuItem disabled value="none">
                                <em style={{ color: 'gray' }}>Choose</em>
                            </MenuItem>
                            {lenguages.map((lenguage) => (
                                <MenuItem key={lenguage.id} value={lenguage.id}>{lenguage.name}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.lenguage ? errors.lenguage : null}</FormHelperText>
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
                            errors={errors}
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
                            errors={errors}
                            setIsLoading={setIsLoading}
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

                <TextField id="outlined-basic" label="Assignment number" variant="outlined" value={assignmentNumber} onChange={(e) => setAssignmentNumber(e.target.value)} sx={{ marginBottom: '20px' }} error={errors.assignmentNumber} helperText={errors.assignmentNumber ? errors.assignmentNumber : null} onBlur={handleOnBlurAssignmentNumber} />

                <TextField id="outlined-basic" label="Miscellaneous" variant="outlined" value={miscellaneous} onChange={(e) => setMiscellaneous(e.target.value)} sx={{ marginBottom: '20px', marginLeft: '20px' }} type='number' />

                <SearchDescription handleOnChangeDescription={handleOnChangeDescription} setDescription={setDescription} description={description} toast={toast} setDescriptionId={setDescriptionId} errors={errors} />
                <Stack direction="row" sx={{ marginTop: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControl sx={{ width: '37%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date of service Provided"
                                value={dateServiceProvided}
                                onChange={(newValue) => {
                                    setDateServiceProvided(newValue);
                                }}
                                slotProps={{
                                    textField: {
                                        error: errors.dateServiceProvided,
                                        helperText: errors.dateServiceProvided ? errors.dateServiceProvided : null,
                                    },
                                }}
                                format='MM/dd/yyyy'
                            />
                        </LocalizationProvider>
                    </FormControl>
                    <FormControl sx={{ width: '10%' }}>
                        <FormControlLabel required control={<Checkbox />} label="Time:" checked={timeIsNull} onChange={(e) => {
                            setTimeIsNull(e.target.checked);
                            setArrivalTime('');
                            setStartTime('');
                            setEndTime('');
                            calculateInterpreterService('', '', '', e.target.checked, interpreterLenguageId);
                        }} />
                    </FormControl>
                    <FormControl sx={{ width: '15%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                                label="Arrival time"
                                value={arrivalTime}
                                onChange={(newValue) => {
                                    setArrivalTime(newValue);
                                    calculateInterpreterService(newValue, startTime, endTime, timeIsNull, interpreterLenguageId);
                                }}
                                slotProps={{
                                    textField: {
                                        error: errors.arrivalTime,
                                        helperText: errors.arrivalTime ? errors.arrivalTime : null,
                                    },
                                }}
                                disabled={!timeIsNull}
                            />
                        </LocalizationProvider>
                    </FormControl>
                    <FormControl sx={{ width: '15%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                                label="Start time"
                                value={startTime}
                                onChange={(newValue) => {
                                    setStartTime(newValue);
                                    calculateInterpreterService(arrivalTime, newValue, endTime, timeIsNull, interpreterLenguageId);
                                }}
                                slotProps={{
                                    textField: {
                                        error: errors.startTime,
                                        helperText: errors.startTime ? errors.startTime : null,
                                    },
                                }}
                                disabled={!timeIsNull}
                            />
                        </LocalizationProvider>
                    </FormControl>
                    <FormControl sx={{ width: '15%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                                label="End time"
                                value={endTime}
                                onChange={(newValue) => {
                                    setEndTime(newValue);
                                    calculateInterpreterService(arrivalTime, startTime, newValue, timeIsNull, interpreterLenguageId);
                                }}
                                slotProps={{
                                    textField: {
                                        error: errors.endTime,
                                        helperText: errors.endTime ? errors.endTime : null,
                                    },
                                }}
                                disabled={!timeIsNull}
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
                            error={errors.travelTimeToAssignment}
                            helperText={errors.travelTimeToAssignment ? errors.travelTimeToAssignment : null}
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
                            error={errors.timeBackFromAssignment}
                            helperText={errors.timeBackFromAssignment ? errors.timeBackFromAssignment : null}
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
                            error={errors.travelMileage}
                            helperText={errors.travelMileage ? errors.travelMileage : null}
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
                            error={errors.costPerMile}
                            helperText={errors.costPerMile ? errors.costPerMile : null}
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
                                    if (id) {
                                        navigate('/dashboard/service-history');
                                    }
                                    else {
                                        window.location.reload();
                                    }
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
                <title> {
                    id ?
                        'Edit service'
                        : 'New service'
                } | IA System </title>
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
                        {id ? 'Edit service' : 'New service'}
                    </Link>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ mb: 5, mt: 3 }}>
                    {id ? 'Edit service' : 'New service'}
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

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    )
}
