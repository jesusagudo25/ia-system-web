import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { ToastContainer, toast } from 'react-toastify';
import {
    Breadcrumbs, Link, Typography, Container, Stack, Card, Box, Tab, Tabs, FormControl, TextField, InputLabel, Select, MenuItem, FormHelperText, CircularProgress, Backdrop} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import PropTypes from 'prop-types';
import config from '../config.json';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export const CoordinatorPage = () => {

    const [isLoading, setIsLoading] = React.useState(false);
    const [states, setStates] = React.useState([]);

    /* User settings */
    const [errors, setErrors] = React.useState({});

    /* Select option */
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    /* Coordinator settings */

    const [coordinatorName, setCoordinatorName] = React.useState('');
    const [coordinatorEmail, setCoordinatorEmail] = React.useState('');
    const [coordinatorPhone, setCoordinatorPhone] = React.useState('');
    const [coordinatorAddress, setCoordinatorAddress] = React.useState('');
    const [coordinatorCity, setCoordinatorCity] = React.useState('');
    const [coordinatorState, setCoordinatorState] = React.useState('');
    const [coordinatorZipCode, setCoordinatorZipCode] = React.useState('');
    const [coordinatorSSN, setCoordinatorSSN] = React.useState('');

    const getCoordinator = () => {
        axios.get('/api/coordinators/1')
            .then((response) => {
                setCoordinatorName(response.data.full_name);
                setCoordinatorEmail(response.data.email);
                setCoordinatorPhone(response.data.phone_number);
                setCoordinatorAddress(response.data.address);
                setCoordinatorCity(response.data.city);
                setCoordinatorState(response.data.state);
                setCoordinatorZipCode(response.data.zip_code);
                setCoordinatorSSN(response.data.ssn);

                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const updateCoordinator = () => {
        setIsLoading(true);
        const errors = {};

        if (coordinatorName === '') {
            errors.nameCoordinator = 'Name is required';
        }

        if (coordinatorEmail === '') {
            errors.emailCoordinator = 'Email is required';
        }

        if (coordinatorPhone === '') {
            errors.phone = 'Phone number is required';
        }

        if (coordinatorAddress === '') {
            errors.address = 'Address is required';
        }

        if (coordinatorCity === '') {
            errors.city = 'City is required';
        }

        if (coordinatorState === '') {
            errors.state = 'State is required';
        }

        if (coordinatorZipCode === '') {
            errors.zip_code = 'Zip code is required';
        }

        if (coordinatorSSN === '') {
            errors.ssn = 'SSN is required';
        }

        if (Object.keys(errors).length === 0) {

        axios.put('/api/coordinators/1', {
            full_name: coordinatorName,
            email: coordinatorEmail,
            phone_number: coordinatorPhone,
            address: coordinatorAddress,
            city: coordinatorCity,
            state: coordinatorState,
            zip_code: coordinatorZipCode,
            ssn: coordinatorSSN

        })
            .then((response) => {
                setIsLoading(false);
                setErrors({});
                toast.success('Coordinator updated successfully');
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        }
        else {
            setErrors(errors);
            setIsLoading(false);
        }

    }

    const getStates = () => {
        axios.get(`${config.APP_URL}/assets/json/states.json`, {
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

    /* Get all */

    useEffect(() => {
        setIsLoading(true);
        getCoordinator();
        getStates();
    }, []);

    return (
        <>
            <Helmet>
                <title> Settings | IA System </title>
            </Helmet>

            <Container>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/dashboard/app">
                        Dashboard
                    </Link>
                    <Typography color="text.primary">Coordinator</Typography>
                </Breadcrumbs>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} mt={3}>
                    <Typography variant="h4" gutterBottom>
                        Coordinator
                    </Typography>
                </Stack>


                <Card
                    sx={{
                        mb: 3,
                    }}
                >
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Coordinator" {...a11yProps(0)} />
                        </Tabs>
                    </Box>
                    <TabPanel value={value} index={0}>
                        <Container sx={
                            {
                                padding: '20px',
                            }
                        }>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" gutterBottom>
                                    General information
                                </Typography>
                            </Stack>
                            <Stack direction="row" sx={{
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                minWidth: 550,
                                gap: 3
                            }}
                            >
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Name" variant="outlined" value={coordinatorName} onChange={(e) => { setCoordinatorName(e.target.value) }} error={errors.nameCoordinator} helperText={errors.nameCoordinator} />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="SSN" variant="outlined" value={coordinatorSSN} onChange={(e) => { setCoordinatorSSN(e.target.value) }} error={errors.ssn} helperText={errors.ssn} />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Email" variant="outlined" value={coordinatorEmail} onChange={(e) => { setCoordinatorEmail(e.target.value) }} error={errors.emailCoordinator} helperText={errors.emailCoordinator} />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Phone number" variant="outlined" value={coordinatorPhone} onChange={(e) => { setCoordinatorPhone(e.target.value) }} error={errors.phone} helperText={errors.phone} />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Address" variant="outlined" value={coordinatorAddress} onChange={(e) => { setCoordinatorAddress(e.target.value) }} error={errors.address} helperText={errors.address} />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="City" variant="outlined" value={coordinatorCity} onChange={(e) => { setCoordinatorCity(e.target.value) }} error={errors.city} helperText={errors.city} />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }} error={errors.state}>
                                    <InputLabel id="state-select-label"
                                        sx={{ width: 400 }}
                                    >State</InputLabel>
                                    <Select
                                        labelId="state-select-label"
                                        id="state-select"
                                        label="State"
                                        value={coordinatorState}
                                        onChange={(e) => {
                                            setCoordinatorState(e.target.value)
                                        }}
                                    >
                                        <MenuItem disabled value="none">
                                            <em style={{ color: 'gray' }}>Choose</em>
                                        </MenuItem>
                                        {states.map((state) => (
                                            <MenuItem key={state.iso2} value={state.name}>{state.name}</MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.state ? errors.state : null}</FormHelperText>
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Zip code" variant="outlined" value={coordinatorZipCode} onChange={(e) => { setCoordinatorZipCode(e.target.value) }} error={errors.zip_code} helperText={errors.zip_code} />
                                </FormControl>
                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={
                                {
                                    mt: '30px',
                                }
                            }>
                                <LoadingButton variant="contained" color="primary" loading={isLoading} onClick={updateCoordinator}>
                                    Save
                                </LoadingButton>
                            </Stack>
                        </Container>
                    </TabPanel>
                </Card>

            </Container>

            {/* Toastify */}

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
