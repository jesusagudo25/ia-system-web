import React from 'react'
import { Stack, TextField, FormControl } from '@mui/material'

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
}) => {
    return (
        <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControl sx={{ marginTop: '20px', width: '37%' }}>
                <TextField label="Phone number" variant="outlined" value={interpreterPhoneNum} onChange={(e) => setInterpreterPhoneNum(e.target.value)} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '61%' }}>
                <TextField label="Email" variant="outlined" value={interpreterEmail} onChange={(e) => setInterpreterEmail(e.target.value)} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '37%' }}>
                <TextField label="Social Security Number" variant="outlined" value={interpreterSSN} onChange={(e) => setInterpreterSSN(e.target.value)} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '61%' }}>
                <TextField label="Address" variant="outlined" value={interpreterAddress} onChange={(e) => setInterpreterAddress(e.target.value)} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '37%' }}>
                <TextField label="City" variant="outlined" value={interpreterCity} onChange={(e) => setInterpreterCity(e.target.value)} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '34%' }}>
                <TextField label="State" variant="outlined" value={interpreterState} onChange={(e) => setInterpreterState(e.target.value)} />
            </FormControl>
            <FormControl sx={{ marginTop: '20px', width: '25%' }}>
                <TextField label="Zip Code" variant="outlined" value={interpreterZipCode} onChange={(e) => setInterpreterZipCode(e.target.value)} />
            </FormControl>
        </Stack>
    )
}
