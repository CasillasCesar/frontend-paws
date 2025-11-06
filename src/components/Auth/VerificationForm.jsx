// src/components/Auth/VerificationForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { verifyCodeUser } from '../../auth/actions/authActions'; // La nueva acción

export const VerificationForm = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtenemos dispatch y las propiedades del 2FA del estado global
  const { authState, dispatch } = useAuth(); 
  const { tempUserId } = authState; // ID del usuario que requiere verificación

  if (!tempUserId) {
    // Esto previene que el componente se renderice si no hay un usuario temporal
    return (
      <div className="alert alert-warning text-center mx-auto mt-5" style={{ maxWidth: '400px' }}>
        No hay una sesión pendiente de verificación.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Llamar a la acción que usa el servicio API
      const message = await verifyCodeUser(dispatch, tempUserId, code);
      
      // Si tiene éxito, el dispatch en la acción ya actualizó el estado a isAuthenticated: true
      console.log('Verificación exitosa:', message);

    } catch (err) {
      // 2. Manejar errores del código 2FA (ej. Código inválido/expirado)
      const errorMessage = err.message || 'Código inválido o de conexión.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow-lg p-4 mx-auto mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="card-title text-center mb-4">Verificación de Dos Pasos 🛡️</h2>
      <p className="text-center text-muted mb-4">
        Se ha enviado un código a tu correo electrónico. Por favor, ingrésalo para continuar.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        
        {/* Campo del Código 2FA */}
        <div className="mb-4">
          <label htmlFor="code" className="form-label">Código de 6 dígitos</label>
          <input
            type="text"
            className="form-control form-control-lg text-center" // Input más grande y centrado
            id="code"
            name="code"
            maxLength="6"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Botón de Submit */}
        <button 
          type="submit" 
          className="btn btn-success w-100" // Botón verde para éxito
          disabled={isLoading || code.length !== 6} // Deshabilitar si está cargando o el código no tiene 6 dígitos
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {' '}Verificando...
            </>
          ) : 'Verificar y Entrar'}
        </button>
      </form>
    </div>
  );
};