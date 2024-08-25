import React, { useEffect, useState } from 'react'
import { Stack, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material'
import axios from 'axios';
import config from '../../../config.json';
import useResponsive from '../../../hooks/useResponsive';

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
    interpreterSelected,
    errors,
    setIsLoading
}) => {
    /* get data external */
    const [states, setStates] = useState([]);

    const getStates = () => {
        axios.get(`${config.APP_URL}/assets/json/states.json`, {
            headers: {
                'X-CSCAPI-KEY': 'N3NXRVN4V1Y1YVJmSTd6ZHR3b1NlMDlMRkRRVFQ2c0JWWmcxbmNUWg=='
            }
        })
            .then((response) => {
                const states = response.data.map((item) => {
                    return {
                        name: item.name,
                        iso2: item.iso2,
                    }
                }).sort((a, b) => a.name.localeCompare(b.name));
                setStates(states);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            }
            );
    }

    const lgDown = useResponsive('down', 'lg');

    useEffect(() => {
        setIsLoading(true);
        getStates();
    }, []);

    return (
        <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControl sx={{ marginTop: '20px', width: lgDown ? '100%' : '37%' }}>
                <TextField label="Phone number" variant="outlined" value={interpreterPhoneNum} onChange={(e) => setInterpreterPhoneNum(e.target.value)} disabled={interpreterSelected} error={errors.interpreterPhoneNum} helperText={errors.interpreterPhoneNum} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: lgDown ? '100%' : '61%' }}>
                <TextField label="Email" variant="outlined" value={interpreterEmail} onChange={(e) => setInterpreterEmail(e.target.value)} disabled={interpreterSelected} error={errors.interpreterEmail} helperText={errors.interpreterEmail} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: lgDown ? '100%' : '37%' }}>
                <TextField label="Social Security Number" variant="outlined" value={interpreterSSN} onChange={(e) => setInterpreterSSN(e.target.value)} disabled={interpreterSelected} error={errors.interpreterSSN} helperText={errors.interpreterSSN} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: lgDown ? '100%' : '61%' }}>
                <TextField label="Address" variant="outlined" value={interpreterAddress} onChange={(e) => setInterpreterAddress(e.target.value)} disabled={interpreterSelected} error={errors.interpreterAddress} helperText={errors.interpreterAddress} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: lgDown ? '100%' : '37%' }}>
                <TextField label="City" variant="outlined" value={interpreterCity} onChange={(e) => setInterpreterCity(e.target.value)} disabled={interpreterSelected} error={errors.interpreterCity} helperText={errors.interpreterCity} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: lgDown ? '100%' : '34%' }} 
                error={errors.interpreterState}
                >
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
                        <FormHelperText>{errors.interpreterState}</FormHelperText>
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: lgDown ? '100%' : '25%' }}>
                <TextField label="Zip Code" variant="outlined" value={interpreterZipCode} onChange={(e) => setInterpreterZipCode(e.target.value)} disabled={interpreterSelected} error={errors.interpreterZipCode} helperText={errors.interpreterZipCode} />
            </FormControl>
        </Stack>
    )
}
