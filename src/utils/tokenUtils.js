// src/utils/tokenUtils.js

const TOKEN_KEY = 'authToken'; // La llave única para almacenar nuestro token

/**
 * Guarda el token de autenticación en localStorage.
 * @param {string} token - El JWT (JSON Web Token) recibido del servidor.
 */
export const saveToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error("Error al guardar el token en localStorage", e);
  }
};

// Remueve el token de autenticación de localStorage (usado para Logout).
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error("Error al remover el token de localStorage", e);
  }
};

/**
 * Lee el token de autenticación de localStorage.
 * @returns {string | null} El token o null si no existe.
 */
export const loadToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error("Error al cargar el token de localStorage", e);
    return null;
  }
};