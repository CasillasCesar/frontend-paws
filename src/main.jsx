// src/main.jsx

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Estilos de Bootstrap (tomados de la opción incoming)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Importación crítica de AuthProvider (tomada de la opción current)
import { AuthProvider } from './auth/context/AuthContext.jsx';


// Obtenemos el contenedor del DOM
const root = createRoot(document.getElementById("root"));

// Renderizamos la aplicación
root.render(
  <StrictMode>
    {/* CRÍTICO: Envolver la aplicación en AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);