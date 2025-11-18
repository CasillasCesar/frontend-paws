/* src/components/Auth/ResetPasswordForm.jsx */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Importamos la función de API (aún no la llamaremos en el submit)
import { resetPassword } from '../../api/authService.js'; 

/**
 * Componente que se carga en la ruta /reset-password/:token
 * Muestra el formulario para establecer la nueva contraseña.
 */
export const ResetPasswordForm = () => {
    // 1. Obtener el token de la URL usando useParams
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // [VALIDACIÓN DE BACKEND IMPLEMENTADA EN EL FRONTEND]
    // Joi Regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    const COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    const MIN_LENGTH = 8;
    const MAX_LENGTH = 30;

    // Validación de complejidad (mayúscula, minúscula, número)
    const isComplex = COMPLEXITY_REGEX.test(newPassword);
    // Validación de longitud y coincidencia
    const isLengthValid = newPassword.length >= MIN_LENGTH && newPassword.length <= MAX_LENGTH;
    const isMatch = newPassword === confirmPassword;

    // Validación final
    const isFormValid = isLengthValid && isMatch && isComplex;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            // Este mensaje ya no es tan específico, los toasts individuales se encargarán
            toast.error("Por favor, corrige los errores en los campos de contraseña.", { 
                position: "bottom-center" 
            });
            return;
        }

        if (!token) {
            toast.error("Token de restablecimiento no encontrado. Solicita un nuevo enlace.", { 
                position: "bottom-center" 
            });
            return;
        }

        setIsLoading(true);

        /* * [LÓGICA PENDIENTE DE IMPLEMENTACIÓN]
         * Cuando estés listo, descomenta y utiliza la función resetPassword.
        */
        
        try {
            console.log(token);
            console.log(newPassword);
            
            const response = await resetPassword(token, newPassword );
            
            // (Eliminar cuando se use la API real)
            // console.log(`[SIMULACIÓN] Token recibido: ${token}. Nueva contraseña lista para ser enviada: ${newPassword}`);
            // toast.success("Tu contraseña se ha restablecido exitosamente. Redirigiendo...", {
            //     position: "top-center",
            //     autoClose: 3000,
            // });

            // Redirigir al login después del éxito
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            // Manejo de error (token inválido/expirado o error del servidor)
            toast.error(error.message || "No se pudo restablecer la contraseña. El enlace pudo haber expirado.", {
                position: "bottom-center",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Mensaje de error si el token falta
    if (!token) {
        return (
            <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="card shadow-lg p-5 text-center" style={{ maxWidth: '400px' }}>
                    <i className="bi bi-x-circle text-danger display-4 mb-3"></i>
                    <h5 className="card-title fw-bold">Error de Acceso</h5>
                    <p className="text-muted">Parece que el enlace está incompleto. Asegúrate de usar el enlace completo proporcionado en tu correo electrónico.</p>
                    <a href="/change-password" className="btn btn-sm btn-outline-primary mt-3">
                        Solicitar un Nuevo Enlace
                    </a>
                </div>
            </div>
        );
    }

    // Componente principal del formulario
    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="card-body">
                    <div className="text-center mb-4">
                        <i className="bi bi-shield-lock-fill text-success display-4"></i>
                        <h4 className="mt-3 card-title fw-bold">Establecer Nueva Contraseña</h4>
                        <p className="text-muted small">Ingresa y confirma tu nueva contraseña. Debe cumplir con los requisitos de seguridad.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Campo Nueva Contraseña */}
                        <div className="mb-3">
                            <label htmlFor="newPasswordInput" className="form-label fw-medium">Nueva Contraseña</label>
                            <input
                                type="password"
                                id="newPasswordInput"
                                className={`form-control ${
                                    newPassword.length > 0 && !isLengthValid || 
                                    (newPassword.length >= MIN_LENGTH && !isComplex) 
                                        ? 'is-invalid' : ''}`}
                                placeholder={`Mínimo ${MIN_LENGTH} y Máximo ${MAX_LENGTH} caracteres`}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                minLength={MIN_LENGTH}
                                maxLength={MAX_LENGTH}
                            />
                            {/* Mensajes de feedback basados en las reglas de Joi */}
                            {newPassword.length > 0 && !isLengthValid && (
                                <div className="invalid-feedback">
                                    La contraseña debe tener entre {MIN_LENGTH} y {MAX_LENGTH} caracteres.
                                </div>
                            )}
                            {newPassword.length >= MIN_LENGTH && newPassword.length <= MAX_LENGTH && !isComplex && (
                                <div className="invalid-feedback">
                                    Debe contener al menos una mayúscula, una minúscula y un número.
                                </div>
                            )}
                        </div>
                        
                        {/* Campo Confirmar Contraseña */}
                        <div className="mb-4">
                            <label htmlFor="confirmPasswordInput" className="form-label fw-medium">Confirmar Contraseña</label>
                            <input
                                type="password"
                                id="confirmPasswordInput"
                                className={`form-control ${confirmPassword.length > 0 && !isMatch ? 'is-invalid' : ''}`}
                                placeholder="Repite la nueva contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                minLength={MIN_LENGTH}
                            />
                            {confirmPassword.length > 0 && !isMatch && (
                                <div className="invalid-feedback">
                                    Las contraseñas no coinciden.
                                </div>
                            )}
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-success w-100 py-2 fw-bold"
                            disabled={isLoading || !isFormValid}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Cambiando...
                                </>
                            ) : (
                                'Cambiar Contraseña'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};