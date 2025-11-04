import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavbarApp from "./pages/Navbar/NavbarApp.jsx";
import Productos from "./pages/Productos/productos.jsx";

const Inicio = () => (
  <div className="container mt-5 text-center">
    <h2>🌿 Bienvenido a Fressisimo</h2>
    <p>Selecciona una opción del menú para continuar.</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <NavbarApp /> {/* 🔹 Siempre visible */}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
      </Routes>
    </Router>
  );
}
