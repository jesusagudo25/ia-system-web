import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
// @mui
import { Container, Breadcrumbs, Link, Typography, Grid } from '@mui/material';
import {
    AppShortCuts,
} from '../sections/@dashboard/app';
import Iconify from '../components/iconify';

export const ManagePage = () => {
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
                <title> Management panel | IA System </title>
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
                        Manage
                    </Link>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ mb: 5, mt: 3 }}>
                    Management panel
                </Typography>

                <Grid item xs={12} md={6} lg={4}>
                    <AppShortCuts
                        list={[
                            {
                                name: 'Interpreters',
                                path: '/dashboard/manage/interpreters',
                                icon: <Iconify icon={'mdi:account-group'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Users',
                                path: '/dashboard/manage/users',
                                icon: <Iconify icon={'mdi:folder-account'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Languages',
                                path: '/dashboard/manage/lenguages',
                                icon: <Iconify icon={'mdi:translate'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Invoices',
                                path: '/dashboard/manage/invoices',
                                icon: <Iconify icon={'mdi:invoice'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Agencies',
                                path: '/dashboard/manage/agencies',
                                icon: <Iconify icon={'mdi:company'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Descriptions',
                                path: '/dashboard/manage/descriptions',
                                icon: <Iconify icon={'mdi:text-box-multiple'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'C&R Wizard Log',
                                path: '/dashboard/manage/cr-wizard-log',
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