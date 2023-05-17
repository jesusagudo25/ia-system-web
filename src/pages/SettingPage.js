import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async';
import {
    Breadcrumbs, Link, Typography, Container, Stack, Card, Box, Tab, Tabs, FormControl, TextField, IconButton, InputAdornment, Backdrop,
    CircularProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import PropTypes from 'prop-types';
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

export const SettingPage = () => {

    const [isLoading, setIsLoading] = React.useState(false);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Helmet>
                <title> Mi cuenta | Fab Lab System </title>
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
                        User
                    </Link>
                    <Typography color="text.primary">Settings</Typography>
                </Breadcrumbs>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} mt={3}>
                    <Typography variant="h4" gutterBottom>
                        Settings
                    </Typography>
                </Stack>


                <Card
                    sx={{
                        mb: 3,
                    }}
                >
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="User" {...a11yProps(0)} />
                            <Tab label="Coordinator" {...a11yProps(1)} />
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
                            <Stack direction="row" alignItems="center" justifyContent="space-start" mb={2} sx={
                                {
                                    gap: '10px',
                                }
                            }>
                                <Typography variant="body1" gutterBottom>
                                    Name
                                </Typography>
                                <FormControl
                                    sx={{ width: '60%' }}
                                >
                                    <TextField id="outlined-basic" placeholder='Ingrese su nombre completo' variant="outlined" value={name} onChange={
                                        (e) => {
                                            setName(e.target.value)
                                        }
                                    } />

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
                                <FormControl sx={{ width: '60%' }}>
                                    <TextField id="outlined-basic" variant="outlined" value={email} onChange={
                                        (e) => {
                                            setEmail(e.target.value)
                                        }
                                    } placeholder='Ingrese su correo electrónico' />
                                </FormControl>
                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={
                                {
                                    mt: '30px',
                                }
                            }>
                                <LoadingButton variant="contained" color="primary" loading={isLoading}>
                                    Save
                                </LoadingButton>
                            </Stack>
                        </Container>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
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
                                    <TextField id="outlined-basic" label="Nombre del evento" variant="outlined" />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Nombre del evento" variant="outlined" />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Nombre del evento" variant="outlined" />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Nombre del evento" variant="outlined" />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Nombre del evento" variant="outlined" />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Nombre del evento" variant="outlined" />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Nombre del evento" variant="outlined" />
                                </FormControl>
                                <FormControl sx={{ width: '48%' }}>
                                    <TextField id="outlined-basic" label="Nombre del evento" variant="outlined" />
                                </FormControl>
                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={
                                {
                                    mt: '30px',
                                }
                            }>
                                <LoadingButton variant="contained" color="primary" loading={isLoading}>
                                    Save
                                </LoadingButton>
                            </Stack>
                        </Container>
                    </TabPanel>
                </Card>

            </Container>
        </>
    )
}
