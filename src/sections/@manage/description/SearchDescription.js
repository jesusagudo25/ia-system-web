import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// material
import { Autocomplete, TextField, createFilterOptions } from '@mui/material';
import config from '../../../config.json';

const filter = createFilterOptions();

export const SearchDescription = ({handleOnChangeDescription}) => {
    const previousController = useRef();

    const [options, setOptions] = React.useState([]);
    const [name, setName] = React.useState('');

    const getDataAutocomplete = (searchTerm) => {
        if (previousController.current) {
            previousController.current.abort();
        }

        const controller = new AbortController();
        const signal = controller.signal;
        previousController.current = controller;

        axios.get(`${config.APPBACK_URL}/api/descriptions/search/${searchTerm}`, { signal })
            .then((res) => {
                const data = res.data.map((item) => {
                    return {
                        label: item.title,
                        value: item.id,
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
            id="description-search"
            options={options}
            value={name}
            onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                    setName(newValue);
                } else if (newValue && newValue.inputValue) {
                    setName(newValue.inputValue);
                } else {
                    handleOnChangeDescription({
                        title: newValue.label,
                        id: newValue.value,
                    });
                    setName(newValue.label);
                }
            }}
            onInputChange={(event, newInputValue) => {
                if (newInputValue !== '') {
                    setName(newInputValue);
                }
                if (event) {
                    if (event.target.value.length > 3) {
                        getDataAutocomplete(event.target.value);
                    }
                    else {
                        setName('');
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
            noOptionsText="No Description Found"
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
                    label="Search Description"
                    placeholder="Enter Description"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            )}
        />
    )
}
