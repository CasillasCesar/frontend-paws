// src/components/Auth/LoginForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { loginUser } from '../../auth/actions/authActions'; 

export const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuth(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginUser(dispatch, formData); 
      // Aquí se podría usar useNavigate() para redirigir
    } catch (err) {
      const errorMessage = err.message || 'Error de credenciales o de conexión.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Usamos clases de Bootstrap: 
    // card: para un contenedor con sombra
    // shadow-lg: sombra grande
    // p-4: padding (relleno) 4
    // mx-auto: margen horizontal automático (centrar)
    // mt-5: margen superior 5
    <div className="card shadow-lg p-4 mx-auto mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="card-title text-center mb-4">Iniciar Sesión 🚪</h2>

      {/* Alerta de error (Bootstrap) */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        
        {/* Campo de Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control" // Clase para estilos de input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* Campo de Contraseña */}
        <div className="mb-4">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control" // Clase para estilos de input
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* Botón de Submit */}
        <button 
          type="submit" 
          className="btn btn-primary w-100" // btn-primary para color azul, w-100 para ancho completo
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {' '}Cargando...
            </>
          ) : 'Entrar'}
        </button>
      </form>
    </div>
  );
};