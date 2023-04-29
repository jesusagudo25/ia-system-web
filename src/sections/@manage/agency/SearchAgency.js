import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// material
import { Autocomplete, TextField } from '@mui/material';
import config from '../../../config.json';

export const SearchAgency = ({handleOnChangeAgency, setAgencyName, agencyName}) => {

    const previousController = useRef();

    const [options, setOptions] = React.useState([]);

    const getDataAutocomplete = (searchTerm) => {
        if (previousController.current) {
            previousController.current.abort();
        }

        const controller = new AbortController();
        const signal = controller.signal;
        previousController.current = controller;

        axios.get(`${config.APPBACK_URL}/api/agencies/search/${searchTerm}`, { signal })
            .then((res) => {
                const data = res.data.map((item) => {
                    return {
                        label: item.name,
                        value: item.id
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
            id="agency-search"
            value={agencyName}
            disablePortal={false}
            options={options}
            onChange={(event, newValue) => {
                handleOnChangeAgency({
                    id: newValue.value,
                });
                setAgencyName(newValue.label);
            }}
            onInputChange={(event, newInputValue) => {
                setAgencyName(newInputValue);
                if(event){
                    if(event.target.value.length > 0){
                        getDataAutocomplete(event.target.value);
                    }
                    else {
                        setOptions([]);
                    }
                }
            }}
            noOptionsText="No Agency Found"
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            clearOnEscape
            blurOnSelect
            freeSolo
            loading
            loadingText="Loading..."
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Agency"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    placeholder="Enter Agency Name"
                />
            )}
        />
    )
}
