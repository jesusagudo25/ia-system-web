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

export default function ReviewListToolbar({
    numSelected,
    filterAssignment,
    onFilterAssignment,
    setOpen,
    selected,
    getRequests,
    startDate,
    endDate,
    setDateRange,
    toast,
    setReview,
    setSelected,
    setPageReview,
    setIsLoading,
    setRequest,
    setOpenRequest,
}) {
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
                    value={filterAssignment}
                    onChange={onFilterAssignment}
                    placeholder="Search assignment..."
                    startAdornment={
                        <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                        </InputAdornment>
                    }
                />
            )}

            {numSelected > 0 ? (
                <Tooltip
                    title="Select all"
                    onClick={() => {
                        setIsLoading(true);
                        setOpen(false);
                        axios.post(`${config.APPBACK_URL}/api/requests`, {
                            services: selected,
                            start_date: format(startDate, 'yyyy-MM-dd'),
                            end_date: format(endDate, 'yyyy-MM-dd'),
                            user_id: localStorage.getItem('id'),
                        }).then(({ data }) => {
                            setRequest(data.request);
                            setOpenRequest(true);
                            setIsLoading(false);
                            getRequests();
                            setDateRange();
                            toast.success('Request generated successfully');
                            setSelected([]);
                            setPageReview(0);
                        }).catch((error) => {
                            setIsLoading(false);
                            toast.error(error.response.data.message);
                        }
                        );
                    }}
                >
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