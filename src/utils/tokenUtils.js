// src/utils/tokenUtils.js

// #region Token

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

//#endregion

//#region UserData
const USER_DATA_KEY = 'userData';
/**
 * Guarda los datos del usuario (name, rol, etc.) en localStorage.
 */
export const saveUserData = (userData) => {
  try {
    // Es CRÍTICO usar JSON.stringify para convertir el objeto a texto
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (e) {
    console.error("Error al guardar los datos del usuario", e);
  }
};

/**
 * Lee los datos del usuario de localStorage.
 */
export const loadUserData = () => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    // Si hay datos, se usa JSON.parse para convertir el texto a objeto
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error al cargar los datos del usuario", e);
    return null;
  }
};

/**
 * Remueve los datos del usuario de localStorage (CRÍTICO para Logout).
 */
export const removeUserData = () => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
  } catch (e) {
    console.error("Error al remover los datos del usuario", e);
  }
};
//#endregion