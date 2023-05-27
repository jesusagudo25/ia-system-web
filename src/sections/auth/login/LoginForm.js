import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Controller, useForm } from "react-hook-form";
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function LoginForm() {

  /* React Navigate */

  const navigate = useNavigate();

  /* React Form Hook */

  const { control, handleSubmit, reset, setValue, getValues, setError, clearErrors, formState: { errors }, } = useForm({
    reValidateMode: 'onBlur'
  });

  /* Data */

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleClick = async (event) => {
    setIsLoading(true)
    axios.get('sanctum/csrf-cookie')
      .then(response => {
        axios.post('api/login', {
          email: event.email,
          password: event.password
        }).then(response => {
          if (response.data.status === 'success') {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('id', response.data.id);

            navigate('/dashboard', { replace: true });
            setIsLoading(false)
          }
          else {
            setMessage(response.data.message)
            setIsLoading(false)
          }
        }).catch(error => {
          setError('backend', {
            type: 'manual',
            message: error.response.data.message
          });
          console.log(error.response.data.message);
          setIsLoading(false)
        })
      });
  }

  return (
    <>
      <Stack spacing={3}>
        <Controller
          name="email"
          control={control}
          defaultValue=""
          rules={{
            required: 'Email address is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email address is invalid'
            }
          }}
          render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
            <TextField
              label="Email address"
              value={value}
              onChange={
                (e) => {
                  onChange(e.target.value)
                  clearErrors('backend')
                }
              }
              onBlur={onBlur}
              required
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          defaultValue=""
          rules={{
            required: 'Password is required',
          }}
          render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={value}
              onChange={
                (e) => {
                  onChange(e.target.value)
                  clearErrors('backend')
                }
              }
              onBlur={onBlur}
              required
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
          <FormHelperText sx={{ color: 'error.main' }}>{errors.backend ? errors.backend.message : null
        }</FormHelperText>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 2 }}>

        <Link variant="subtitle2"
          underline="none"
          component="a" href="/forgot-password"
        >Forgot password?</Link>

      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit(handleClick)} loading={isLoading}>
        Sign in
      </LoadingButton>
    </>
  );
}
