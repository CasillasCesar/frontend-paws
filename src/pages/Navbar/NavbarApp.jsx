import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { logoutUser } from "../../auth/actions/authActions";

// Importaciones CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function NavbarApp() {
  const { authState, dispatch } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser(dispatch);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark w-100 border-0">
      <div className="container-fluid px-4">
        {/* Logo y marca */}
        <Link className="navbar-brand fw-bold fs-3 d-flex align-items-center" to="/">
          <i className="bi bi-shop me-2"></i>
          Frescos
        </Link>

        {/* Botón toggle para móvil */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Navegación principal centrada */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center py-3" to="/">
                <i className="bi bi-house-door me-2"></i>
                Inicio
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center py-3" to="/productos">
                <i className="bi bi-box-seam me-2"></i>
                Productos
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link fw-semibold d-flex align-items-center py-3" to="/crearUsuario">
                <i className="bi bi-person-plus me-2"></i>
                Crear Usuario
              </Link>
            </li>
          </ul>

          {/* Botón de login/logout */}
          <div className="d-flex">
            {authState.isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="btn btn-outline-light d-flex align-items-center px-3 py-2 fw-semibold"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Cerrar Sesión
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="btn btn-outline-light d-flex align-items-center px-3 py-2 fw-semibold"
              >
                <i className="bi bi-person-circle me-2"></i>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estilos personalizados - AZUL MARINO */}
      <style>{`
        .navbar {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%) !important;
          box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
          min-height: 70px;
          border-bottom: 3px solid #3b82f6;
        }
        .nav-link {
          color: rgba(255,255,255,0.9) !important;
          transition: all 0.3s ease;
          border-radius: 8px;
          margin: 0 4px;
        }
        .nav-link:hover {
          color: #fff !important;
          background-color: rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .nav-link.active {
          background-color: #3b82f6;
          color: #fff !important;
        }
        .navbar-brand {
          color: #fff !important;
          transition: all 0.3s ease;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .navbar-brand:hover {
          transform: scale(1.05);
          color: #dbeafe !important;
        }
        .btn-outline-light {
          border: 2px solid #dbeafe;
          color: #dbeafe;
          transition: all 0.3s ease;
          font-weight: 600;
        }
        .btn-outline-light:hover {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        .navbar-toggler {
          border: 2px solid #dbeafe;
        }
        .navbar-toggler:focus {
          box-shadow: 0 0 0 3px rgba(219, 234, 254, 0.5);
        }
        .bi {
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
        }
      `}</style>
    </nav>
  );
}