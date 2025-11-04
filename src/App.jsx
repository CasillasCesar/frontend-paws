// src/App.jsx
import React from 'react';
import { useAuth } from './auth/context/AuthContext';
import { logoutUser } from './auth/actions/authActions';
import { LoginForm } from './components/Auth/LoginForm'; 
import { VerificationForm } from './components/Auth/VerificationForm';

export default function App() {
  const { authState, dispatch } = useAuth();
  const handleLogout = () => {
    logoutUser(dispatch);
  };

  // Lógica de Renderizado Condicional:
  let content;
  
  if (authState.isAuthenticated) {
    const userName = authState.user?.name || 'Usuario';
    // 1. Vista AUTENTICADA (Sesión Finalizada)
    content = (
      <div className="alert alert-success text-center">
        <h2>¡Bienvenido, {userName}!</h2>
        <p>El estado global está en **Autenticado**. Token activo.</p>
        <button onClick={handleLogout} className="btn btn-danger mt-3">
          Cerrar Sesión
        </button>
      </div>
    );
  } else if (authState.needsVerification) {
    // 2. Vista PENDIENTE DE 2FA
    content = <VerificationForm />; 
  } else {
    // 3. Vista NO AUTENTICADA (Inicio)
    content = (
      <>
        <h5 className="text-center mb-4">Por favor, inicia sesión para continuar.</h5>
        <LoginForm />
      </>
    );
  }

  return (
    <div className="container mt-5"> 
      <h1 className="text-center mb-4">Sistema de Autenticación React (2FA)</h1>
      <hr className="mb-5"/>
      {content}
    </div>
  );
}