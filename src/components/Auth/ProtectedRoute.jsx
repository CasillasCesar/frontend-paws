// src/components/Auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

/**
 * Componente de ruta protegida.
 * Redirige a /login si el usuario no está autenticado.
 * @param {object} children - El componente que se quiere renderizar (e.g., <Dashboard />).
 */
export const ProtectedRoute = ({ children }) => {
    const { authState } = useAuth();

    // Si el usuario NO está autenticado, lo redirigimos al login
    if (!authState.isAuthenticated) {
        // 'replace' borra la entrada de la ruta actual del historial de navegación
        return <Navigate to="/login" replace />; 
    }

    // Si el usuario SÍ está autenticado, renderizamos el componente hijo
    return children;
};