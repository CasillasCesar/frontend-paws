import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { logoutUser } from "../../auth/actions/authActions";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function NavbarApp() {
  const { authState, dispatch } = useAuth();
  const isAuthenticated = authState.isAuthenticated
  const userRole = authState?.user?.rol

  const isAdministrator = isAuthenticated && userRole === "Administrador";
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser(dispatch);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
      <div className="container-fluid">

        {/* Logo */}
        <Link className="navbar-brand fw-bold fs-3 d-flex align-items-center" to="/">
          <i className="bi bi-shop me-2"></i>
          Frescos
        </Link>

        {/* Toggle móvil */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido */}
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">

          {/* Menú centrado */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">

            <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/">
                <i className="bi bi-house-door me-2"></i>
                Inicio
              </Link>
            </li>

            {isAdministrator &&
              <li className="nav-item mx-2">
                <Link className="nav-link fw-semibold d-flex align-items-center" to="/proveedores">
                  <i className="bi bi-truck me-2"></i>
                  Proveedores
                </Link>
              </li>}


            {isAuthenticated && <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/movimientos">
                <i className="bi bi-arrow-left-right me-2"></i>
                Movimientos
              </Link>
            </li>}

            {isAdministrator && <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/clientes">
                <i className="bi bi-people me-2"></i>
                Clientes
              </Link>
            </li>}

            {isAdministrator && <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/GestorUsuarios">
                <i className="bi bi-person-gear me-2"></i>
                Gestión Usuarios
              </Link>
            </li>}

            {isAdministrator && <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/productos">
                <i className="bi bi-bag-check me-2"></i>
                Productos
              </Link>
            </li>}

            {isAdministrator && <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/crearUsuario">
                <i className="bi bi-person-plus me-2"></i>
                Crear Usuario
              </Link>
            </li>}
          </ul>

          {/* Botón login/logout */}
          <div className="d-flex">
            {authState.isAuthenticated ? (
              <button onClick={handleLogout} className="btn btn-outline-light fw-semibold px-3">
                <i className="bi bi-box-arrow-right me-2"></i>
                Cerrar Sesión
              </button>
            ) : (
              <button onClick={handleLogin} className="btn btn-outline-light fw-semibold px-3">
                <i className="bi bi-person-circle me-2"></i>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estilos */}
      <style>{`
        .custom-navbar {
          background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
          padding: 10px 0;
          box-shadow: 0 4px 15px rgba(30,58,138,0.3);
        }

        .nav-link {
          color: rgba(255,255,255,0.9) !important;
          transition: 0.3s;
          border-radius: 6px;
          padding: 10px 14px;
        }

        .nav-link:hover {
          background: rgba(59,130,246,0.25);
          transform: translateY(-2px);
        }

        .navbar-brand:hover {
          transform: scale(1.03);
        }

        .btn-outline-light:hover {
          background: #3b82f6;
          border-color: #3b82f6;
        }
      `}</style>
    </nav>
  );
}
