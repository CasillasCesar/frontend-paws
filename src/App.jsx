// src/App.jsx

import React from 'react';
import { useAuth } from './auth/context/AuthContext';
import { logoutUser } from './auth/actions/authActions';
import { LoginForm } from './components/Auth/LoginForm'; 

export default function App() {
  const { authState, dispatch } = useAuth();
  const handleLogout = () => {
    logoutUser(dispatch);
  };

  return (
    // Clase container de Bootstrap para centrar el contenido
    <div className="container mt-5"> 
      <h1 className="text-center mb-4">Sistema de Autenticación React</h1>
      <hr className="mb-5"/>

      {authState.isAuthenticated ? (
        // --- 🔑 VISTA AUTENTICADA 🔑 ---
        <div className="alert alert-success text-center">
          <h2>¡Bienvenido, {authState.user?.name || 'Usuario'}!</h2>
          <p>El estado global está en **Autenticado**. Token activo.</p>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-danger mt-3" // Botón rojo para cerrar sesión
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        // --- 🔒 VISTA NO AUTENTICADA 🔒 ---
        <>
          <h5 className="text-center mb-4">Por favor, inicia sesión para continuar.</h5>
          <LoginForm />
        </>
      )}
    </div>
  );
}