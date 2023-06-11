import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async';
import {
    Breadcrumbs, Link, Typography, Container, Stack, Card, Box, Tab, Tabs, FormControl, TextField, IconButton, InputAdornment, Backdrop,
    CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import Iconify from '../components/iconify';

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

export const MyAccountPage = () => {

    /* Toastify */
    const showNotification = (type, message) => {
        if (type === 'success') {
            toast.success(message, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
        else if (type === 'error') {
            toast.error(message, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
        else if (type === 'warning') {
            toast.warn(message, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
        else {
            toast.info(message, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const { control, handleSubmit, reset, setValue, getValues, formState: { errors }, } = useForm({
        reValidateMode: 'onBlur'
    });

    const id = localStorage.getItem('id');
    const [isLoading, setIsLoading] = React.useState(false);

    /* User settings */
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [errorsManual, setErrorsManual] = React.useState({});
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');

    const [showPassword, setShowPassword] = useState(false);

    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);


    const getUser = () => {
        axios.get('/api/users/1')
            .then((response) => {
                setName(response.data.full_name);
                setEmail(response.data.email);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const updateUser = () => {
        setIsLoading(true);
        const errors = {};

        if (name === '') {
            errors.name = 'Name is required';
        }

        if (email === '') {
            errors.email = 'Email is required';
        }

        if (Object.keys(errors).length === 0) {

            axios.put('/api/users/1', {
                full_name: name,
                email
            })
                .then((response) => {
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                    setIsLoading(false);
                });
            setErrorsManual({});
            toast.success('User updated successfully');
        }
        else {
            setErrorsManual(errors);
            setIsLoading(false);
        }
    }

    /* Select option */
    const [valueSelected, setValueSelected] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValueSelected(newValue);
    };

    /* Get all */

    useEffect(() => {
        setIsLoading(true);
        getUser();
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
                    <Typography color="text.primary">My Account</Typography>
                </Breadcrumbs>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} mt={3}>
                    <Typography variant="h4" gutterBottom>
                        My Account
                    </Typography>
                </Stack>


                <Card
                    sx={{
                        mb: 3,
                    }}
                >
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={valueSelected} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="General" {...a11yProps(0)} />
                            <Tab label="Change password" {...a11yProps(1)} />
                        </Tabs>
                    </Box>
                    <TabPanel value={valueSelected} index={0}>
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
                            <Stack direction="row" alignItems="center" justifyContent="space-start" mb={2} sx={
                                {
                                    gap: '10px',
                                }
                            }>
                                <Typography variant="body1" gutterBottom>
                                    Name
                                </Typography>
                                <FormControl
                                    sx={{ width: '30%' }}
                                >
                                    <TextField id="outlined-basic" placeholder='Ingrese su nombre completo' variant="outlined" value={name} onChange={
                                        (e) => {
                                            setName(e.target.value)
                                        }
                                    }
                                        error={errorsManual.name}
                                        helperText={errorsManual.name}
                                    />

                                </FormControl>
                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="space-start" sx={
                                {
                                    gap: '10px',
                                    mt: '20px',
                                }
                            }>
                                <Typography variant="body1" gutterBottom>
                                    Email
                                </Typography>
                                <FormControl sx={{ width: '30%' }}>
                                    <TextField id="outlined-basic" variant="outlined" value={email} onChange={
                                        (e) => {
                                            setEmail(e.target.value)
                                        }
                                    } placeholder='Ingrese su correo electrónico'
                                        error={errorsManual.email}
                                        helperText={errorsManual.email}
                                    />
                                </FormControl>
                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={
                                {
                                    mt: '30px',
                                }
                            }>
                                <LoadingButton variant="contained" color="primary" loading={isLoading} onClick={updateUser}>
                                    Save
                                </LoadingButton>
                            </Stack>
                        </Container>
                    </TabPanel>
                    <TabPanel value={valueSelected} index={1}>
                        <Container sx={
                            {
                                padding: '20px',
                            }
                        }>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" gutterBottom>
                                    Change password
                                </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" justifyContent="space-start" mb={2} sx={
                                {
                                    gap: '10px',
                                }
                            }>
                                <Typography variant="body1" gutterBottom>
                                    Current password
                                </Typography>
                                <Controller
                                    name="password"
                                    control={control}
                                    defaultValue=""
                                    rules={{
                                        required: 'Password is required',
                                    }}
                                    render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                                        <TextField
                                            label="New password"
                                            type={showPassword ? 'text' : 'password'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                            <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            value={value}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                        />
                                    )}
                                />
                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="space-start" mb={2} sx={
                                {
                                    gap: '33px',
                                }
                            }>
                                <Typography variant="body1" gutterBottom>
                                    New password
                                </Typography>
                                <Controller
                                    name="passwordConfirm"
                                    control={control}
                                    defaultValue=""
                                    rules={{
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'The password must have at least 8 characters'
                                        },
                                        maxLength: {
                                            value: 20,
                                            message: 'The password must have a maximum of 20 characters'
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                                            message: 'The password must have at least one uppercase letter, one lowercase letter, one number and one special character'
                                        }
                                    }}
                                    render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                                        <TextField
                                            label="Confirm new password"
                                            type={showPasswordConfirm ? 'text' : 'password'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} edge="end">
                                                            <Iconify icon={showPasswordConfirm ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            value={value}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                        />
                                    )}
                                />

                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={
                                {
                                    mt: '30px',
                                }
                            }>
                                <LoadingButton variant="contained" color="primary" onClick={handleSubmit((event) => {
                                    setIsLoading(true)
                                    axios.put(`/api/users/${id}/password`, {
                                        currentPassword: event.password,
                                        password: event.passwordConfirm
                                    })
                                        .then((response) => {
                                            setIsLoading(false)
                                            showNotification('success', 'Password updated successfully')
                                            reset()
                                        }).catch((error) => {
                                            console.log(error)
                                            showNotification('error', 'Current password is incorrect')
                                            setIsLoading(false)
                                        })})}
                                    loading={isLoading}
                                >
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
