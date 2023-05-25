import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);
    
  
    // Renderizar el componente de ruta protegida si está autenticado
    return children;
}
