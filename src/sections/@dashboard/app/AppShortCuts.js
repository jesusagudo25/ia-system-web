// @mui
import PropTypes from 'prop-types';
import { Box, Card, Paper, Typography, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import useResponsive from '../../../hooks/useResponsive';

// ----------------------------------------------------------------------

AppShortCuts.propTypes = {
  list: PropTypes.array.isRequired,
};

export default function AppShortCuts({ list, ...other }) {

  const lgDown = useResponsive('down', 'lg');

  return (
    <Card {...other}>

      <CardContent>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: lgDown ? '1fr' : 'repeat(3, 1fr)',
          }}
        >
          {list.map((site, index) => (
            <Link
            to={site.path}
            style={{ textDecoration: 'none', color: 'inherit' }}
            key={index}
            >
              
              <Paper key={site.name} variant="outlined" sx={{ py: 2.5, textAlign: 'center', ":hover": { backgroundColor: '#F9FAFB', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)', borderColor: '#4a77bd' } }}>
                <Box sx={{ mb: 0.5 }}>{site.icon}</Box>

                <Typography variant="body1" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                  {site.name}
                </Typography>
              </Paper>
            </Link>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
