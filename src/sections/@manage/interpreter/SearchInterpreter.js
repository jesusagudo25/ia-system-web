import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// material
import { Autocomplete, TextField, createFilterOptions } from '@mui/material';
import config from '../../../config.json';

const filter = createFilterOptions();

export const SearchInterpreter = ({ 
    handleOnChangeInterpreter, 
    serviceState, 
    interpreterLenguageId, 
    setInterpreterContainer, 
    setInterpreterName, 
    interpreterName, 
    toast, 
    handleClearInterpreter, 
    errors }) => {

    const previousController = useRef();

    const [options, setOptions] = React.useState([]);

    const getDataAutocomplete = (searchTerm) => {
        if (previousController.current) {
            previousController.current.abort();
        }

        const controller = new AbortController();
        const signal = controller.signal;
        previousController.current = controller;

        if (serviceState !== '' && interpreterLenguageId !== '') {

            axios.get(`${config.APPBACK_URL}/api/interpreters/${serviceState}/${interpreterLenguageId}/${searchTerm}`, { signal })
                .then((res) => {
                    const data = res.data.map((item) => {
                        return {
                            label: item.full_name,
                            value: item.id,
                            phone_number: item.phone_number,
                            ssn: item.ssn,
                            email: item.email,
                            address: item.address,
                            city: item.city,
                            state: item.state,
                            zip_code: item.zip_code,
                        }
                    });
                    setOptions(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        else {
            alert('Please select a state and a language');
        }
    };

    return (
        <Autocomplete
            id="interpreter-search"
            value={interpreterName}
            options={options}
            onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                    setInterpreterName(newValue);
                    toast.info('Please fill the interpreter data');
                } else if (newValue && newValue.inputValue) {
                    setInterpreterName(newValue.inputValue);
                    /* Se debe abrir el espacio para crear una nueva entrada */
                    setInterpreterContainer(true);
                    toast.info('Please fill the interpreter data');
                } else if (newValue) {
                    handleOnChangeInterpreter({
                        id: newValue.value,
                        phone_number: newValue.phone_number,
                        ssn: newValue.ssn,
                        email: newValue.email,
                        address: newValue.address,
                        city: newValue.city,
                        state: newValue.state,
                        zip_code: newValue.zip_code,
                        selected: true,
                    });
                    setInterpreterName(newValue.label); 
                    toast.success('Interpreter selected');
                }
            }}
            onInputChange={(event, newInputValue) => {
                if(newInputValue !== '') setInterpreterName(newInputValue);
                if (event) {
                    handleClearInterpreter();
                    if (event.target.value) {
                        if(event.target.value.length > 1) getDataAutocomplete(event.target.value);
                    }
                    else {
                        if(newInputValue === '') toast.warning('The field is empty');  
                        setInterpreterName('');
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
            noOptionsText="No interpreter found"
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
                    placeholder="Enter interpreter name"
                    label="Search Interpreter"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    error={errors.interpreter}
                    helperText={errors.interpreter}
                />
            )}
        />
    )
}