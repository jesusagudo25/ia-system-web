import React, { useEffect, useState } from 'react'
import { Stack, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import axios from 'axios';

export const InterpreterData = ({
    setInterpreterPhoneNum,
    interpreterPhoneNum,
    setInterpreterEmail,
    interpreterEmail,
    setInterpreterSSN,
    interpreterSSN,
    setInterpreterAddress,
    interpreterAddress,
    setInterpreterCity,
    interpreterCity,
    setInterpreterState,
    interpreterState,
    setInterpreterZipCode,
    interpreterZipCode,
    interpreterSelected
}) => {
    /* get data external */
    const [states, setStates] = useState([]);

    const getStates = () => {
        axios.get('https://api.countrystatecity.in/v1/countries/US/states', {
            headers: {
                'X-CSCAPI-KEY': 'N3NXRVN4V1Y1YVJmSTd6ZHR3b1NlMDlMRkRRVFQ2c0JWWmcxbmNUWg=='
            }
        })
            .then((response) => {
                setStates(response.data);
            })
            .catch((error) => {
                console.log(error);
            }
            );
    }

    useEffect(() => {
        getStates();
    }, []);

    return (
        <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControl sx={{ marginTop: '20px', width: '37%' }}>
                <TextField label="Phone number" variant="outlined" value={interpreterPhoneNum} onChange={(e) => setInterpreterPhoneNum(e.target.value)} disabled={interpreterSelected} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '61%' }}>
                <TextField label="Email" variant="outlined" value={interpreterEmail} onChange={(e) => setInterpreterEmail(e.target.value)} disabled={interpreterSelected} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '37%' }}>
                <TextField label="Social Security Number" variant="outlined" value={interpreterSSN} onChange={(e) => setInterpreterSSN(e.target.value)} disabled={interpreterSelected} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '61%' }}>
                <TextField label="Address" variant="outlined" value={interpreterAddress} onChange={(e) => setInterpreterAddress(e.target.value)} disabled={interpreterSelected} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '37%' }}>
                <TextField label="City" variant="outlined" value={interpreterCity} onChange={(e) => setInterpreterCity(e.target.value)} disabled={interpreterSelected} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '34%' }}>
                <InputLabel id="customer-select-label"
                            sx={{ width: 400 }}
                        >State</InputLabel>
                        <Select
                            labelId="customer-select-label"
                            id="customer-select"
                            label="State"
                            value={interpreterState}
                            onChange={(e) => setInterpreterState(e.target.value)}
                            disabled={interpreterSelected}
                        >
                            <MenuItem disabled value="none">
                                <em style={{ color: 'gray' }}>Choose</em>
                            </MenuItem>
                            {states.map((state) => (
                                <MenuItem key={state.iso2} value={state.name}>{state.name}</MenuItem>
                            ))}
                        </Select>
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '25%' }}>
                <TextField label="Zip Code" variant="outlined" value={interpreterZipCode} onChange={(e) => setInterpreterZipCode(e.target.value)} disabled={interpreterSelected} />
            </FormControl>
        </Stack>
    )
}
