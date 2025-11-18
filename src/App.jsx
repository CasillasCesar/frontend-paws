import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavbarApp from "./pages/Navbar/NavbarApp.jsx";
import Productos from "./pages/Productos/productos.jsx";
import CreateUserForm from './pages/CreateUser/CreateUserForm.jsx';
import { useAuth } from './auth/context/AuthContext';
import { logoutUser } from './auth/actions/authActions';
import { LoginForm } from './components/Auth/LoginForm';
import { VerificationForm } from './components/Auth/VerificationForm';
import { ProtectedRoute } from "./components/Auth/ProtectedRoute.jsx";
import { GuestRoute } from "./components/Auth/GuestRoute.jsx";
import Proveedores from "./pages/Proveedores/provedores.jsx"
import Movimientos from './pages/Movimientos/movimientos.jsx';
import { ToastContainer } from "react-toastify";
import Clientes from './pages/Clientes/Clientes.jsx';
import Usuarios from './pages/Usuarios/Usuarios.jsx';
import 'react-toastify/dist/ReactToastify.css';

// Componente de inicio MEJORADO que ocupa toda la pantalla
const Inicio = ({ user }) => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div className="text-center px-4">
      {/* Icono o imagen de bienvenida */}
      <div className="mb-4">
        <i className="bi bi-shop display-1 text-primary"></i>
      </div>
      
      {/* Título principal */}
      <h1 className="display-4 fw-bold text-dark mb-3">
        Bienvenido a <span className="text-primary">Frescos</span>
      </h1>
      
      {/* Saludo personalizado */}
      <h2 className="h3 text-muted mb-4">
        {user?.nombre ? `¡Hola, ${user.nombre}!` : '¡Bienvenido!'}
      </h2>
      
      {/* Descripción */}
      <p className="lead text-muted mb-5 max-w-2xl mx-auto">
        Gestiona tu inventario de manera eficiente. 
        Accede a las opciones del menú para comenzar a administrar productos, 
        usuarios y mucho más.
      </p>

      {/* Información del usuario si está logueado */}
      {user && (
        <div className="alert alert-info mx-auto mb-4" style={{maxWidth: '500px'}}>
          <div className="d-flex align-items-center justify-content-center">
            <i className="bi bi-person-check me-2"></i>
            <span>
              Has iniciado sesión como: <strong>{user.rol || 'Usuario'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Cards de acciones rápidas */}
      <div className="row g-4 justify-content-center mt-5">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <i className="bi bi-box-seam display-6 text-primary mb-3"></i>
              <h5 className="card-title fw-bold">Gestión de Productos</h5>
              <p className="card-text text-muted">
                Administra tu inventario, consulta stock y revisa alertas.
              </p>
              <a href="/productos" className="btn btn-primary mt-3">
                Ir a Productos
              </a>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <i className="bi bi-people display-6 text-success mb-3"></i>
              <h5 className="card-title fw-bold">Gestión de Usuarios</h5>
              <p className="card-text text-muted">
                Crea y administra usuarios del sistema con diferentes roles.
              </p>
              <a href="/crearUsuario" className="btn btn-success mt-3">
                Crear Usuario
              </a>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <i className="bi bi-graph-up display-6 text-info mb-3"></i>
              <h5 className="card-title fw-bold">Dashboard</h5>
              <p className="card-text text-muted">
                Visualiza reportes y estadísticas de tu negocio.
              </p>
              <a href="/dashboard" className="btn btn-info text-white mt-3">
                Ver Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer de la página de inicio */}
      <div className="mt-5 pt-5">
        <p className="text-muted small">
          Sistema de Gestión Fressisimo v1.0
        </p>
      </div>
    </div>

    {/* Estilos personalizados */}
    <style>{`
      .min-vh-100 {
        min-height: 100vh;
      }
      .max-w-2xl {
        max-width: 600px;
      }
      .hover-card {
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .hover-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
      }
      .display-1 {
        font-size: 4rem;
      }
      .bg-light {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      }
    `}</style>
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
    logoutUser(dispatch);
    console.log("Hizo Logout");
  };

  return (
    <Router>
      {/* CONTENEDOR DE TOASTS */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* RENDERIZADO CONDICIONAL DEL CONTENIDO PRINCIPAL */}
      {authState.needsVerification ? (
        <div className="container">
          <VerificationForm />
        </div>
      ) : (
        <>
          <NavbarApp />
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginForm />
                </GuestRoute>
              }
            />

            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Inicio user={authState.user} />} />
                    <Route path="/dashboard" element={<Dashboard user={authState.user} handleLogout={handleLogout} />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/proveedores" element={<Proveedores />} />
                    <Route path="/movimientos" element={<Movimientos />} />
                    <Route path="/GestorUsuarios" element={<Usuarios />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/crearUsuario" element={<CreateUserForm />} />
                    <Route path="/login" element={<Navigate to="/" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </>
      )}
    </Router>
  );
}