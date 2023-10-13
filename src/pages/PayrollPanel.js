import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
// @mui
import { Container, Breadcrumbs, Link, Typography, Grid } from '@mui/material';
import {
    AppShortCuts,
} from '../sections/@dashboard/app';
import Iconify from '../components/iconify';

export const PayrollPanel = () => {
    const [openFilter, setOpenFilter] = useState(false);

    const handleOpenFilter = () => {
        setOpenFilter(true);
    };

    const handleCloseFilter = () => {
        setOpenFilter(false);
    };

    return (
        <>
            <Helmet>
                <title> Payroll panel | IA System </title>
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
                    Payroll panel
                </Typography>

                <Grid item xs={12} md={6} lg={4}>
                    <AppShortCuts
                        list={[
                            {
                                name: 'Requests',
                                path: '/dashboard/payroll-panel/requests',
                                icon: <Iconify icon={'mdi:document'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Payments',
                                path: '/dashboard/payroll-panel/payments',
                                icon: <Iconify icon={'mdi:bank'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'C&R Wizard',
                                path: '/dashboard/payroll-panel/cr-wizard',
                                icon: <Iconify icon={'mdi:wizard-hat'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            }
                        ]}
                    />
                </Grid>
            </Container>
        </>
    );

};