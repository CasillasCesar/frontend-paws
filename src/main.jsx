// #region Imports
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import './index.css'
  import App from './App.jsx'
// #endregion

// #region ImportsOthers
  import { AuthProvider } from './auth/context/AuthContext.jsx';
// #endregion 

// Obtenemos el contenedor del DOM
const root = createRoot(document.getElementById('root'));

// Renderizamos la aplicación
root.render(
  <StrictMode>
    {/* 🔑 ¡Aquí es donde envolvemos el App con el Provider! 🔑 */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
