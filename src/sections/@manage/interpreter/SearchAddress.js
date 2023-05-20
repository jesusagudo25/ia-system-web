import React, { useRef } from 'react';
import axios from 'axios';
// material
import { Autocomplete, TextField, createFilterOptions } from '@mui/material';
import config from '../../../config.json';

const filter = createFilterOptions();

export const SearchAddress = ({ 
    handleOnChangeAddress,
    setAddress,
    address,
    toast,
    handleClearAddress,
    errors
    }) => {

    const previousController = useRef();

    const [options, setOptions] = React.useState([]);

    const getDataAutocomplete = (searchTerm) => {
        if (previousController.current) {
            previousController.current.abort();
        }

        const controller = new AbortController();
        const signal = controller.signal;
        previousController.current = controller;

        axios.get(`${config.APPBACK_URL}/api/addresses/search/${searchTerm}`, { signal })
            .then((res) => {
                const data = res.data.map((item) => {
                    return {
                        label: item.label,
                        value: item.id,
                        address: item.address,
                        city: item.city,
                        state: item.state,
                        zipCode: item.zip_code,
                    }
                });
                setOptions(data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <Autocomplete
            id="address-search"
            options={options}
            value={address}
            onChange={(event, newValue) => {
                console.log(newValue);
                if (typeof newValue === 'string') {
                    setAddress(newValue);
                    toast.info('Please fill the address data');
                } else if (newValue && newValue.inputValue) {
                    setAddress(newValue.inputValue);

                    toast.info('Please fill the address data');
                } else if (newValue) {
                    handleOnChangeAddress({
                        id: newValue.value,
                        label: newValue.label,
                        address: newValue.address,
                        city: newValue.city,
                        state: newValue.state,
                        zipCode: newValue.zipCode,
                    });
                    setAddress(newValue.address);
                    toast.success('Address selected');
                }
            }}
            onInputChange={(event, newInputValue) => {
                if (newInputValue !== '') setAddress(newInputValue);
                if (event) {
                    handleClearAddress();
                    if (event.target.value) {
                        if (event.target.value.length > 3) getDataAutocomplete(event.target.value);
                    }
                    else {
                        if(newInputValue === '') toast.warning('The field is empty');
                        setAddress('');
                        setOptions([]);
                    }
                }
            }}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Sugerir la creación de un nuevo valor
                const isExisting = options.some((option) => inputValue === option.label);

                if (inputValue.length > 4) {
                    if (inputValue !== '' && !isExisting) {
                        filtered.push({
                            inputValue,
                            label: `Add "${inputValue}"`,
                        });
                    }
                }

                return filtered;
            }}
            getOptionLabel={(option) => {
                // Valor seleccionado con enter, directamente desde la entrada
                if (typeof option === 'string') {
                    return option;
                }
                // Agrega la opción "xxx" creada dinámicamente
                if (option.inputValue) {
                    return option.inputValue;
                }
                // Opción normal
                return option.label;
            }}
            noOptionsText="No Address Found"
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            clearOnEscape
            blurOnSelect
            freeSolo
            loading
            loadingText="Loading..."
            renderOption={(props, option) => <li {...props}>{option.label}</li>}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Address"
                    placeholder="Enter Address"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    error={errors.serviceAddress}
                    helperText={errors.serviceAddress ? 'Service address is required' : ''}
                />
            )}
        />
    )
}
