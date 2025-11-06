// src/components/Auth/GuestRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

/**
 * Componente de ruta de Invitado (para rutas públicas como /login).
 * Redirige al Home (/) si el usuario YA está autenticado.
 * @param {object} children - El componente que se quiere renderizar (e.g., <LoginForm />).
 */
export const GuestRoute = ({ children }) => {
    const { authState } = useAuth();

    // Si el usuario SÍ está autenticado, lo redirigimos a la página principal
    if (authState.isAuthenticated) {
        // Redirige al home
        return <Navigate to="/" replace />;
    }

    // Si el usuario NO está autenticado, renderizamos el componente hijo (LoginForm)
    return children;
};