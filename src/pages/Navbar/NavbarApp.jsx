import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { logoutUser } from "../../auth/actions/authActions";

// Importaciones CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function NavbarApp() {
  // OBTENER EL ESTADO Y EL DISPATCH
  const { authState, dispatch } = useAuth();
  const navigate = useNavigate();



  const handleLogout = () => {
    // Esta es la única línea que realmente limpia el estado global
    logoutUser(dispatch);

    // Opcional: navegar explícitamente al login o home
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          Fressisimo
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/productos">
                Productos
              </Link>
            </li>
          </ul>

          {/* LÓGICA CONDICIONAL: Mostrar Login o Logout */}
          <div className="d-flex">
            {authState.isAuthenticated ? (
              // Opción 1: Sesión Activa -> Mostrar Logout
              <button
                onClick={handleLogout}
                className="btn btn-outline-light d-flex align-items-center"
              >
                <i className="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
              </button>
            ) : (
              // Opción 2: Sesión Inactiva -> Mostrar Login
              <button
                onClick={handleLogin}
                className="btn btn-outline-light d-flex align-items-center"
              >
                <i className="bi bi-person-circle me-1"></i> Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
