// src/pages/CreateUser/CreateUserForm.jsx
import React, { useState } from 'react';
import { createUserAction } from '../../auth/actions/authActions';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const CreateUserForm = () => {
  const { authState, dispatch } = useAuth();
  const navigate = useNavigate();

  // Verificar permisos de administrador
  if (authState.user?.rol !== 'Administrador') {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow">
              <div className="card-body text-center p-5">
                <i className="bi bi-shield-lock display-1 text-danger mb-4"></i>
                <h3 className="card-title text-danger">Acceso Restringido</h3>
                <p className="card-text text-muted mb-4">
                  Solo los usuarios con rol de <strong>Administrador</strong> pueden crear nuevos usuarios.
                </p>
                <div className="alert alert-info">
                  <small>
                    <strong>Tu rol actual:</strong> {authState.user?.rol || 'No definido'}
                  </small>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="btn btn-primary mt-3"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estados del formulario - PRIMERO todos los hooks
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Empleado');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [usuarioCreado, setUsuarioCreado] = useState(null);
  const [backendErrors, setBackendErrors] = useState({});


  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendErrors({});
    setIsLoading(true);
    setQrCode(null);
    setUsuarioCreado(null);

    try {
      const response = await createUserAction(dispatch, {
        nombre,
        email,
        password,
        rol
      });

      if (response.qrUrl) {
        setQrCode(response.qrUrl);
        setUsuarioCreado(response.usuario);
        toast.success(`✅ Usuario ${response.usuario.nombre} creado exitosamente!`);
      }

      // Limpiar formulario
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('Empleado');

    } catch (error) {
      console.error('Error del backend:', error);

      const errorMessage = error.message || 'Error al crear usuario';

      // Detectar errores específicos del backend Joi
      if (errorMessage.includes('nombre') || errorMessage.includes('Nombre')) {
        setBackendErrors({ nombre: errorMessage });
      } else if (errorMessage.includes('correo') || errorMessage.includes('email') || errorMessage.includes('Email')) {
        setBackendErrors({ email: errorMessage });
      } else if (errorMessage.includes('contraseña') || errorMessage.includes('password') || errorMessage.includes('Contraseña')) {
        setBackendErrors({ password: errorMessage });
      } else if (errorMessage.includes('rol') || errorMessage.includes('Rol')) {
        setBackendErrors({ rol: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    }

    setIsLoading(false);
  };

  const handleCreateAnother = () => {
    setQrCode(null);
    setUsuarioCreado(null);
    setBackendErrors({});
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (backendErrors[field]) {
      setBackendErrors({
        ...backendErrors,
        [field]: ''
      });
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header de administración */}
          <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
            <i className="bi bi-shield-check text-success me-2 fs-4"></i>
            <div>
              <h4 className="text-success mb-0">Panel de Administración</h4>
              <small className="text-muted">
                Crear nuevos usuarios del sistema
              </small>
            </div>
          </div>

          {qrCode && usuarioCreado ? (
            <div className="success-container text-center">
              <div className="alert alert-success">
                <h4>✅ Usuario Creado Exitosamente</h4>
                <p><strong>Nombre:</strong> {usuarioCreado.nombre}</p>
                <p><strong>Email:</strong> {usuarioCreado.email}</p>
                <p><strong>Rol:</strong> {usuarioCreado.rol}</p>
              </div>

              <div className="qr-section mt-4">
                <h5>Configuración de Autenticación de Dos Factores (2FA)</h5>
                <p className="text-muted">
                  Escanea este código QR con tu app de autenticación
                </p>
                <img
                  src={qrCode}
                  alt="Código QR para 2FA"
                  className="img-fluid border rounded"
                  style={{ maxWidth: '300px' }}
                />
                <div className="mt-3">
                  <button
                    onClick={handleCreateAnother}
                    className="btn btn-primary me-2"
                  >
                    Crear Otro Usuario
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="btn btn-secondary"
                  >
                    Ir al Inicio
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="login-form-container">
              <form onSubmit={handleSubmit} className="login-form">
                <h2 className="form-title">Crear Nuevo Usuario</h2>
                <p className="form-subtitle">Complete la información del usuario</p>

                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo *</label>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={handleInputChange(setNombre, 'nombre')}
                    placeholder="Ej: Juan Pérez"
                    required
                    className={`form-control ${backendErrors.nombre ? 'is-invalid' : ''}`}
                    disabled={isLoading}
                  />
                  {backendErrors.nombre && (
                    <div className="invalid-feedback d-block">
                      <strong>Error:</strong> {backendErrors.nombre}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleInputChange(setEmail, 'email')}
                    placeholder="ejemplo@gmail.com"
                    required
                    className={`form-control ${backendErrors.email ? 'is-invalid' : ''}`}
                    disabled={isLoading}
                  />
                  {backendErrors.email && (
                    <div className="invalid-feedback d-block">
                      <strong>Error:</strong> {backendErrors.email}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Contraseña *</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handleInputChange(setPassword, 'password')}
                    placeholder="Mínimo 8 caracteres"
                    required
                    className={`form-control ${backendErrors.password ? 'is-invalid' : ''}`}
                    disabled={isLoading}
                  />
                  {backendErrors.password && (
                    <div className="invalid-feedback d-block">
                      <strong>Error:</strong> {backendErrors.password}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rol">Rol *</label>
                  <select
                    id="rol"
                    value={rol}
                    onChange={handleInputChange(setRol, 'rol')}
                    // className={`form-control ${backendErrors.rol ? 'is-invalid' : ''}`}
                    className={`form-select ${backendErrors.rol ? 'is-invalid' : ''}`}
                    required
                    disabled={isLoading}
                  >
                    <option value="Empleado">Empleado</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                  {backendErrors.rol && (
                    <div className="invalid-feedback d-block">
                      <strong>Error:</strong> {backendErrors.rol}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-button btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creando Usuario...
                    </>
                  ) : (
                    'Crear Usuario'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Estilos específicos para este formulario */}
      <style>{`
        .login-form-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
        }
        .login-form {
          width: 100%;
          padding: 2rem;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid #dee2e6;
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
        .submit-button {
          padding: 0.85rem;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .submit-button:disabled {
          background-color: #aaa !important;
          cursor: not-allowed;
        }
        .qr-section {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }
        .invalid-feedback {
          display: block;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default CreateUserForm;