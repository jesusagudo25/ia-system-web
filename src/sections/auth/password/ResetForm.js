import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Controller, useForm } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
// @mui
import {  Stack, IconButton, InputAdornment, TextField, Backdrop, CircularProgress } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';


const ResetForm = () => {

    /* React Form Hook */

    const { control, handleSubmit, reset, setValue, getValues, formState: { errors }, } = useForm({
        reValidateMode: 'onBlur'
    });

    /* Data */

    const { token } = useParams();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (event) => {
        setIsLoading(true)
        axios.post('api/reset-password', {
            token,
            password: event.password,
            password_confirmation: event.passwordConfirm
        })
            .then((response) => {
                setIsLoading(false)
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('id', response.data.id)
                localStorage.setItem('role_id', response.data.role_id)
                navigate('/login', { replace: true });
                setIsLoading(false)
            }).catch((error) => {
                console.log(error)
                setIsLoading(false)
            })
    }

    useEffect(() => {
        setIsLoading(true)
        axios.get('api/validate-token', {
            params: {
                token
            }
        })
            .then((response) => {
                setIsLoading(false)
            }).catch((error) => {
                navigate('/login', { replace: true });
                console.log(error)
                setIsLoading(false)
            })
    }, [])

    return (
        <>
            <Stack spacing={3} sx={{ mb: 4 }}>

                <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'The password must have at least 8 characters'
                        },
                        maxLength: {
                            value: 20,
                            message: 'The password must have a maximum of 20 characters'
                        },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                            message: 'The password must have at least one uppercase letter, one lowercase letter, one number and one special character'
                        }
                    }}
                    render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                        <TextField
                            label="New password"
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
                            onChange={onChange}
                            onBlur={onBlur}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                    )}
                />

                <Controller
                    name="passwordConfirm"
                    control={control}
                    defaultValue=""
                    rules={{
                        required: 'Password confirmation is required',
                        validate: (value) => value === getValues('password') || 'The passwords do not match'
                    }}
                    render={({ field: { onChange, onBlur, value, }, fieldState: { error } }) => (
                        <TextField
                            label="Confirm new password"
                            type={showPasswordConfirm ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} edge="end">
                                            <Iconify icon={showPasswordConfirm ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                    )}
                />

                <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit(handleClick)} loading={isLoading}>
                    Reset password
                </LoadingButton>
            </Stack>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    )
}

export default ResetForm