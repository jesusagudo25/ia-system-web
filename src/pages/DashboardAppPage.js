import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import axios from 'axios';
// @mui
import { Grid, Container, Typography, Backdrop, CircularProgress } from '@mui/material';
// components
// sections
import {
  AppWidgetSummary,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function DashboardAppPage() {

  const [agencyCount, setAgencyCount] = useState(0);
  const [interpreterCount, setInterpreterCount] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenditure, setMonthlyExpenditure] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getStatastics = () => {
    setIsLoading(true);
    axios.get('/api/reports/dashboards')
      .then((response) => {
        setAgencyCount(Number(response.data.total_agencies));
        setInterpreterCount(Number(response.data.total_interpreters));
        setMonthlyIncome(USDollar.format(response.data.total_income));
        setMonthlyExpenditure(USDollar.format(response.data.total_expenses));
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getStatastics();
  }, []);

  return (
    <>
      <Helmet>
        <title> Dashboard | IA System </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Agencies" total={agencyCount} icon={'ant-design:android-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Interpreters" total={interpreterCount} color="info" icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Monthly income" total={monthlyIncome} color="warning" icon={'ant-design:windows-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Monthly expenditure" total={monthlyExpenditure} color="error" icon={'ant-design:bug-filled'} />
          </Grid>

        </Grid>
      </Container>


      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
