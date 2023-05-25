import { useState } from 'react';
import axios from 'axios';
import { Controller, useForm } from "react-hook-form";
// @mui
import { Stack,TextField  } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const RecoveryForm = ({ setSuccess, email, setEmail }) => {

  /* React Form Hook */

  const { control, handleSubmit, reset, setValue, getValues, formState: { errors }, } = useForm({
    reValidateMode: 'onBlur'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (event) => {
    setIsLoading(true)
    setEmail(event.email)
    await axios.post('/api/forgot-password', {
      email: event.email
    })
    .then((response) => {
        setIsLoading(false)
        setSuccess(true)
      }).catch((error) => {
        setSuccess(true)
        setIsLoading(false)
      })
  }

  return (
    <>
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Controller
          name="email"
          control={control}
          defaultValue=""
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
          render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
            <TextField
              name="email"
              label="Email"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              required
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit(handleClick)} loading={isLoading}>
        Send Email
      </LoadingButton>
    </>
  )
}

export default RecoveryForm