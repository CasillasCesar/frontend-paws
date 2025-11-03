// src/auth/actions/authActions.js

import { AuthActionTypes } from '../reducers/authReducers';
import { login } from '../../api/authService'; // Función para llamar a la API
import { saveToken, removeToken } from '../../utils/tokenUtils'; // Funciones para localStorage

/**
 * Acción principal para iniciar sesión (Login).
 * Maneja la llamada a la API y el side effect de guardar el token.
 * * @param {function} dispatch - La función dispatch obtenida del Contexto.
 * @param {object} credentials - Las credenciales del usuario { email, password }.
 * @returns {Promise<boolean>} Retorna true si el login fue exitoso.
 */
export const loginUser = async (dispatch, credentials) => {
  try {
    // 1. Llamar a la API de autenticación
    const { token, user } = await login(credentials);

    // 2. Persistir el token en el navegador (para recargas)
    saveToken(token);

    // 3. Notificar al Reducer (actualiza el estado de la sesión en Context)
    dispatch({
      type: AuthActionTypes.LOGIN_SUCCESS,
      payload: { token, user },
    });
    
    return true; // Éxito
  } catch (error) {
    // Si falla (ej. credenciales incorrectas), registramos y relanzamos el error.
    console.error('Error durante el inicio de sesión:', error);
    
    // Relanzamos el error para que el componente (LoginForm) lo capture
    throw error; 
  }
};

/**
 * 🚪 Acción para cerrar sesión (Logout).
 * Limpia el token y dispara la acción de cierre de sesión.
 * @param {function} dispatch - La función dispatch del Contexto.
 */
export const logoutUser = (dispatch) => {
  // 1. Limpiar el token del navegador (destruye la persistencia)
  removeToken();

  // 2. Disparar la acción al Reducer (resetea el estado global)
  dispatch({
    type: AuthActionTypes.LOGOUT,
  });
};