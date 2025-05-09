import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, Button, Stack } from '@mui/material';
// component
import { SearchAgency } from '../agency/SearchAgency';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

SpecialPriceListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

export default function SpecialPriceListToolbar({ toast }) {
  /* Agency */
  const [agencyName, setAgencyName] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [errors, setErrors] = useState({});

  /* Autocomplete agency */

  const handleOnChangeAgency = (agency) => {
    setAgencyId(agency.id);
  };

  return (
    <StyledRoot>
      <Stack direction="row" alignItems="center" justifyContent="space-between" width="30%">
      <SearchAgency
          handleOnChangeAgency={handleOnChangeAgency}
          setAgencyName={setAgencyName}
          agencyName={agencyName}
          setAgencyId={setAgencyId}
          errors={errors}
          toast={toast}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" my={2} mx={2}>
        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
          New Special Price
        </Button>
      </Stack>
    </StyledRoot>
  );
}
