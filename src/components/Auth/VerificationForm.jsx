// src/components/Auth/VerificationForm.jsx
import React, { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { verifyCodeUser } from "../../auth/actions/authActions";

export const VerificationForm = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { authState, dispatch } = useAuth();
  
  // OBTENEMOS EL MÉTODO DE VERIFICACIÓN DEL ESTADO
  const { tempUserId, verificationMethod } = authState;

  // CONFIGURACIÓN POR TIPO DE VERIFICACIÓN
  const verificationConfig = {
    totp: {
      title: "Autenticador App ",
      instructions: "Ingresa el código de 6 dígitos de tu aplicación de autenticación (Google Authenticator, Authy, etc.).",
      placeholder: "123456",
      maxLength: 6,
      inputType: "text",
    
    },
    email: {
      title: "Verificación por Email ",
      instructions: "Revisa tu correo electrónico. Hemos enviado un código de 6 dígitos.",
      placeholder: "Código de 6 dígitos",
      maxLength: 6,
      inputType: "text",
     
    },
    sms: {
      title: "Verificación por SMS ",
      instructions: "Revisa tus mensajes de texto. Hemos enviado un código de 6 dígitos a tu teléfono.",
      placeholder: "Código de 6 dígitos",
      maxLength: 6,
      inputType: "text",
     
    },
    backup: {
      title: "Código de Respaldo ",
      instructions: "Ingresa uno de tus códigos de respaldo de 8 dígitos.",
      placeholder: "Código de 8 dígitos",
      maxLength: 8,
      inputType: "text",
      
    }
  };

  // Obtenemos la configuración para el método actual o usamos uno por defecto
  const config = verificationConfig[verificationMethod] || {
    title: "Verificación de Seguridad ",
    instructions: "Ingresa tu código de verificación para continuar.",
    placeholder: "Código de verificación",
    maxLength: 6,
    inputType: "text",

  };

  if (!tempUserId) {
    return (
      <div className="alert alert-warning text-center mx-auto mt-5" style={{ maxWidth: "400px" }}>
        No hay una sesión pendiente de verificación.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validación básica del código
    if (code.length !== config.maxLength) {
      setError(`El código debe tener ${config.maxLength} dígitos`);
      return;
    }

    setIsLoading(true);

    try {
      const message = await verifyCodeUser(dispatch, tempUserId, code);
      console.log("Verificación exitosa:", message);
      // El código se limpia automáticamente en el success
    } catch (err) {
      const errorMessage = err.message || "Código inválido o error de conexión.";
      setError(errorMessage);
      setCode(""); // Limpiar el código en error
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Solo permitir números para todos los métodos
    if (/^\d*$/.test(value) && value.length <= config.maxLength) {
      setCode(value);
    }
  };

  return (
    <div className="card shadow-lg p-4 mx-auto mt-5" style={{ maxWidth: "400px" }}>
      {/* TÍTULO DINÁMICO */}
      <h2 className="card-title text-center mb-3">
        {config.icon} {config.title}
      </h2>
      
      {/* INSTRUCCIONES DINÁMICAS */}
      <p className="text-center text-muted mb-4 small">
        {config.instructions}
      </p>

      {/* MOSTRAR MÉTODO ACTUAL */}
      <div className="alert alert-info text-center py-2 mb-3">
        <small>
          <strong>Método:</strong> {verificationMethod?.toUpperCase() || "No especificado"}
        </small>
      </div>

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          <small>{error}</small>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="code" className="form-label fw-bold">
            Código de Verificación
          </label>
          <input
            type={config.inputType}
            className="form-control form-control-lg text-center fw-bold"
            id="code"
            name="code"
            maxLength={config.maxLength}
            placeholder={config.placeholder}
            value={code}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <div className="form-text text-end">
            {code.length}/{config.maxLength} dígitos
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100 py-2 fw-bold"
          disabled={isLoading || code.length !== config.maxLength}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Verificando...
            </>
          ) : (
            `Verificar ${config.icon}`
          )}
        </button>
      </form>

      {/* INFORMACIÓN ADICIONAL SEGÚN EL MÉTODO */}
      {verificationMethod === 'totp' && (
        <div className="mt-3 p-2 bg-light rounded">
          <small className="text-muted">
             <strong>Tip:</strong> El código se actualiza cada 30 segundos en tu app de autenticación.
          </small>
        </div>
      )}

    
    </div>
  );
};