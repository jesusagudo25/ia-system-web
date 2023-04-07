// @mui
import PropTypes from 'prop-types';
import { Box, Card, Paper, Typography, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
// ----------------------------------------------------------------------

AppShortCuts.propTypes = {
  list: PropTypes.array.isRequired,
};

export default function AppShortCuts({ list, ...other }) {
  const [roleId, setRoleId] = localStorage.getItem('role_id');
  const [userRole, setUserRole] = localStorage.getItem('role_id');

  return (
    <Card {...other}>

      <CardContent>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: JSON.parse(userRole) === 1 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
          }}
        >
          {list.map((site, index) => (
            site.role.includes(JSON.parse(roleId)) ?
            <Link
            to={site.path}
            style={{ textDecoration: 'none', color: 'inherit' }}
            key={index}
            >
              <Paper key={site.name} variant="outlined" sx={{ py: 2.5, textAlign: 'center' }}>
                <Box sx={{ mb: 0.5 }}>{site.icon}</Box>

                <Typography variant="body1" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                  {site.name}
                </Typography>
              </Paper>
            </Link>
            : null
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
