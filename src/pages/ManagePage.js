import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
// @mui
import { Container, Breadcrumbs, Link, Typography, Grid } from '@mui/material';
// mock
import PRODUCTS from '../_mock/products';
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
                <title> Management board | IA System </title>
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
                    Management board
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
                                name: 'Lenguages',
                                path: '/dashboard/manage/observations',
                                icon: <Iconify icon={'mdi:file-document-edit'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Invoices',
                                path: '/dashboard/manage/invoices',
                                icon: <Iconify icon={'mdi:cash'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Agencies',
                                path: '/dashboard/manage/agencies',
                                icon: <Iconify icon={'mdi:ticket-account'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                            {
                                name: 'Descriptions',
                                path: '/dashboard/manage/techexpenses',
                                icon: <Iconify icon={'mdi:currency-usd-off'} color="#2065D1" width={32} />,
                                role: [1, 2, 3]
                            },
                        ]}
                    />
                </Grid>
            </Container>
        </>
    );

};