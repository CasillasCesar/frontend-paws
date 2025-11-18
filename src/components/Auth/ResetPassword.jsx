// src/components/Auth/ResetPassword.jsx

import React, { useState } from "react";
import { toast } from "react-toastify";
import { requestPasswordReset } from "../../api/authService";

/**
 * Componente para solicitar el restablecimiento de la contraseña.
 * Pide al usuario su correo electrónico para enviar un enlace/código de restablecimiento.
 */
export const ResetPasswordRequest = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Estado para validar
    const isEmailValid = emailRegex.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación simple
        if (!isEmailValid) {
            toast.error("Por favor, ingresa un correo electrónico válido.", { position: "bottom-center" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await requestPasswordReset(email);

            // Éxito: notificar al usuario (el mensaje está diseñado para ser seguro)
            toast.success(response.message, {
                position: "top-center",
                autoClose: 6000,
                theme: "colored",
            });
            // Opcional: limpiar el campo
            setEmail('');

        } catch (error) {
            // Error de conexión o servidor
            toast.error(error.message || "Ocurrió un error al procesar tu solicitud. Intenta más tarde.", {
                position: "bottom-center",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="card-body">
                    <div className="text-center mb-4">
                        <i className="bi bi-key-fill text-primary display-4"></i>
                        <h4 className="mt-3 card-title fw-bold">¿Olvidaste tu Contraseña?</h4>
                        <p className="text-muted small">Ingresa tu correo electrónico para recibir instrucciones de restablecimiento.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="emailInput" className="form-label fw-medium">Correo Electrónico</label>
                            <input
                                type="email"
                                id="emailInput"
                                className="form-control"
                                placeholder="tu.correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            {/* Mensaje de ayuda si el campo está vacío y se intentó enviar */}
                            {!isEmailValid && email.length > 0 && (
                                <div className="text-danger small mt-1">
                                    Por favor, introduce un correo válido.
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-bold"
                            disabled={isLoading || !isEmailValid}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Enviando...
                                </>
                            ) : (
                                'Solicitar Restablecimiento'
                            )}
                        </button>
                    </form>

                    <div className="mt-3 text-center">
                        <a href="/login" className="text-decoration-none small text-muted">
                            &larr; Volver al inicio de sesión
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
