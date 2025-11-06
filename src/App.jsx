// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavbarApp from "./pages/Navbar/NavbarApp.jsx";
import Productos from "./pages/Productos/productos.jsx";
import { useAuth } from './auth/context/AuthContext';
import { logoutUser } from './auth/actions/authActions'; 
import { LoginForm } from './components/Auth/LoginForm'; 
import { VerificationForm } from './components/Auth/VerificationForm'; 

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

    // 1. Vista AUTENTICADA: El usuario ha pasado el 2FA y está logueado.
    if (authState.isAuthenticated) {
        
        return (
            <Router>
                <NavbarApp />
                <Routes>
                    <Route path="/" element={<Inicio user={authState.user} />} />
                    <Route path="/dashboard" element={<Dashboard user={authState.user} handleLogout={handleLogout} />} />
                    <Route path="/productos" element={<Productos />} />
                    
                    {/* Redirige Login o cualquier otra ruta a la vista del Dashboard/Inicio */}
                    <Route path="/login" element={<Dashboard user={authState.user} handleLogout={handleLogout} />} />
                    <Route path="*" element={<Dashboard user={authState.user} handleLogout={handleLogout} />} /> 
                </Routes>
            </Router>
        );
    } 
    
    // 2. Vista PENDIENTE DE 2FA: Credenciales correctas, pero falta el código de verificación.
    else if (authState.needsVerification) {
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
    
    // 3. Vista NO AUTENTICADA: Todas las rutas redirigen al Login.
    else {
        console.log("Aqui");
        
        return (
            <Router>
                {/* <NavbarApp /> */}
                <Routes>
                    
                    {/* Única ruta explícitamente permitida sin autenticación */}
                    <Route path="/login" element={<LoginForm />} />
                    
                    {/* Rutas de Recuperación de Contraseña (Comentadas) */}
                    {/* <Route path="/forgot-password" element={<ForgotPasswordForm />} /> */}
                    {/* <Route path="/reset-password/:token" element={<ResetPasswordForm />} /> */}

                    {/* Cualquier otra ruta (incluyendo /, /productos, /dashboard) lleva al login */}
                    <Route path="*" element={<LoginForm />} />
                </Routes>
            </Router>
        );
    }
}