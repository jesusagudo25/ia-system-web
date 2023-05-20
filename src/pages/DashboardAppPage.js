import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import axios from 'axios';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppCurrentVisits,
  AppWebsiteVisits,
  AppWidgetSummary,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {

  const [agencyCount, setAgencyCount] = useState(0);
  const [interpreterCount, setInterpreterCount] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenditure, setMonthlyExpenditure] = useState(0);

  const getStatastics = () => {
    axios.get('/api/reports/dashboards')
      .then((response) => {
        setAgencyCount(response.data.total_agencies);
        setInterpreterCount(response.data.total_interpreters);
        setMonthlyIncome(response.data.total_income);
        setMonthlyExpenditure(response.data.total_expenses);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
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
    </>
  );
}
