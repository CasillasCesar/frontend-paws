// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavbarApp from "./pages/Navbar/NavbarApp.jsx";
import Productos from "./pages/Productos/productos.jsx";
import { useAuth } from './auth/context/AuthContext';
import { logoutUser } from './auth/actions/authActions'; 
import { LoginForm } from './components/Auth/LoginForm'; 
import { VerificationForm } from './components/Auth/VerificationForm'; 
import { ProtectedRoute } from "./components/Auth/ProtectedRoute.jsx";
import { GuestRoute } from "./components/Auth/GuestRoute.jsx";


// Importaciones de Recuperación de Contraseña (Comentadas para evitar errores de compilación)
// import { ForgotPasswordForm } from './components/Auth/ForgotPasswordForm'; 
// import { ResetPasswordForm } from './components/Auth/ResetPasswordForm'; 

// Componente simple de inicio
const Inicio = ({user}) => (
    <div className="container mt-5 text-center">
        <h2>Bienvenido a Fressisimo, {user?.name || 'Cesar'}</h2>
        <p>Selecciona una opción del menú para continuar.</p>
    </div>
);

// Componente que se muestra al usuario logueado (Dashboard)
const Dashboard = ({ user, handleLogout }) => (
    <div className="alert alert-success text-center mt-5">
        <h2>¡Bienvenido de vuelta, {user?.name || 'Usuario'}!</h2>
        <p>Tu rol actual es: **{user?.rol || 'No definido'}**</p>
        <button onClick={handleLogout} className="btn btn-danger mt-3">
            Cerrar Sesión
        </button>
    </div>
);

export default function App() {
    const { authState, dispatch } = useAuth();
    
    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        // Llama a la acción que limpia el estado y el token
        logoutUser(dispatch); 
        console.log("Hizo Logout"); // Puedes descomentar este log para verificar si el handler se ejecuta
    };
    
    // Vista DE 2FA: Credenciales correctas, pero falta el código de verificación.
    if (authState.needsVerification) {
        return (
            <Router>
                {/* <NavbarApp /> */}
                <div className="container">
                    {/* Solo mostramos el formulario de verificación. */}
                    <VerificationForm />
                </div>
            </Router>
        );
    } 
    
    // Vista Principal: Ahora gestiona el login y las rutas protegidas en un solo bloque
    return (
        <Router>
            <NavbarApp /> 
            <Routes>
                
                {/* 1. Ruta de Login - AHORA PROTEGIDA PARA USUARIOS LOGUEADOS */}
                <Route 
                    path="/login" 
                    element={
                        <GuestRoute>
                            <LoginForm />
                        </GuestRoute>
                    } 
                />
                
                {/* 2. Rutas Protegidas (Todas las demás) */}
                <Route 
                    path="*" 
                    element={
                        <ProtectedRoute>
                            <Routes>
                                {/* Las rutas "/" y "/productos" SÓLO se verán si ProtectedRoute da acceso */}
                                <Route path="/" element={<Inicio user={authState.user} />} />
                                <Route path="/dashboard" element={<Dashboard user={authState.user} handleLogout={handleLogout} />} />
                                <Route path="/productos" element={<Productos />} />
                                
                                {/* Opcional: Redirigir el login al home dentro de la vista autenticada */}
                                <Route path="/login" element={<Navigate to="/" replace />} />
                                
                            </Routes>
                        </ProtectedRoute>
                    } 
                />
                
            </Routes>
        </Router>
    );
}