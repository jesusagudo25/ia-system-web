import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

export const PublicRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated) {
            axios.get('api/validate-token-access', {
                params: {
                    token: isAuthenticated,
                    id
                }
            })
                .then((response) => {
/*                     console.log(response.data) */
                    if(response.data.status === 'success'){
                        navigate('/dashboard/app');
                    }
                }).catch((error) => async () => {
                    console.log(error)
                    await axios.post('api/logout')
                    localStorage.removeItem('token')
                    localStorage.removeItem('name')
                    localStorage.removeItem('id')
                })

        }
    }, [isAuthenticated, id, navigate]);
    
  
    // Renderizar el componente de ruta protegida si está autenticado
    return children;
}
