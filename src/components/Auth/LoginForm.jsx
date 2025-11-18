// src/components/Auth/LoginForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { loginUser } from '../../auth/actions/authActions';


export const LoginForm = () => {
  const { authState, dispatch } = useAuth();

  // Estados para los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Manejador para el Paso 1 (Email/Password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginUser(dispatch, { email, password });
      // El reducer se encargará de cambiar authState.needsVerification
    } catch (error) {
      // El toast de error ya se muestra en authActions
      console.error(error);
    }
    setIsLoading(false);
  };

  // Manejador para el Paso 2 (Código 2FA)
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Usamos el tempUserId guardado en el estado
      await verifyCodeUser(dispatch, authState.tempUserId, code);
      // Si tiene éxito, el reducer cambiará isAuthenticated
      // y el router te redirigirá.
    } catch (error) {
      // El toast de error ya se muestra en authActions
      console.error(error);
    }
    setIsLoading(false);
  };

  // --- RENDERIZADO CONDICIONAL ---

  // VISTA 2: Mostrar si necesita verificación
  if (authState.needsVerification) {
    return (
      <div className="login-form-container">
        <form onSubmit={handleVerifySubmit} className="login-form">

          {/* ESTA ES LA LÓGICA QUE PIDES:
             Lee el método del estado y muestra el mensaje correcto.
          */}
          {authState.verificationMethod === 'email' ? (
            <>
              <h2 className="form-title">Verifica tu Email</h2>
              <p className="form-subtitle">Te hemos enviado un código de 6 dígitos a tu correo.</p>
            </>
          ) : (
            <>
              <h2 className="form-title">Error de Conexión</h2>
              <p className="form-subtitle">
                No se pudo enviar el correo. Por favor, usa el código de 6 dígitos de tu app de autenticación (Google Authenticator).
              </p>
            </>
          )}

          <div className="form-group">
            <label htmlFor="code">Código de Verificación</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          {/* --- CORRECCIÓN AQUÍ --- */}
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Verificar Código'}
          </button>
        </form>

      </div>
    );
  }

  // VISTA 1: Formulario de Login normal
  return (
    <div className="login-form-container">
      <form onSubmit={handleLoginSubmit} className="login-form">
        <h2 className="form-title">Iniciar Sesión</h2>
        <p className="form-subtitle">Ingresa tus credenciales.</p>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
        <div className="mt-3 text-center">
          <a href="/change-password" className="text-decoration-none small text-muted">
            Forgot Password?
          </a>
        </div>
      </form>
    </div>
  );
};

// Añadimos unos estilos básicos para que se vea bien
const styles = `
  .login-form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    font-family: Arial, sans-serif;
  }
  .login-form {
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
  .form-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #333;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .form-subtitle {
    font-size: 1rem;
    color: #666;
    text-align: center;
    margin-bottom: 2rem;
  }
  .form-group {
    margin-bottom: 1.5rem;
  }
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #555;
  }
  .form-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box; /* Importante para que el padding no rompa el layout */
  }
  .submit-button {
    width: 100%;
    padding: 0.85rem;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .submit-button:hover {
    background-color: #0056b3;
  }
  .submit-button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

// Inyectar estilos en el head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);