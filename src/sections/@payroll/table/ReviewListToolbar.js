import PropTypes from 'prop-types';
import axios from 'axios';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment } from '@mui/material';
import { format } from 'date-fns';

// component
import Iconify from '../../../components/iconify';
import config from '../../../config.json';

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

ReviewListToolbar.propTypes = {
    numSelected: PropTypes.number,
    filterName: PropTypes.string,
    onFilterName: PropTypes.func,
};

export default function ReviewListToolbar({ numSelected, filterName, onFilterName, setOpen, selected, getPayrolls, startDate, endDate, setDateRange, toast, setReview, setSelected, setPageReview }) {
    return (
        <StyledRoot
            sx={{
                ...(numSelected > 0 && {
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography component="div" variant="subtitle1">
                    {numSelected} selected
                </Typography>
            ) : (
                <StyledSearch
                    value={filterName}
                    onChange={onFilterName}
                    placeholder="Search assignment..."
                    startAdornment={
                        <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                        </InputAdornment>
                    }
                />
            )}

            {numSelected > 0 ? (
                <Tooltip title="Select all" onClick={
                    async () => {
                        await axios.post(`${config.APPBACK_URL}/api/payrolls`, {
                            services: selected,
                            start_date: format(startDate, 'yyyy-MM-dd'),
                            end_date: format(endDate, 'yyyy-MM-dd'),
                            user_id: 1,
                        });
                        setOpen(false);
                        getPayrolls();
                        setDateRange();
                        toast.success('Payroll generated successfully');
                        setSelected([]);
                        setPageReview(0);
                    }
                }>
                    <IconButton>
                        <Iconify icon="eva:checkmark-square-2-fill" />
                    </IconButton>
                </Tooltip>
            ) : (
                null
            )}
        </StyledRoot>
    );
}