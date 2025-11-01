// src/auth/reducers/authReducer.js

// 1. Estado Inicial
// Por defecto, nadie está autenticado, no hay token ni información del usuario.
const initialAuthState = {
  isAuthenticated: false, // El usuario no está logueado
  token: null,            // No hay token de autenticación
  user: null,             // No hay datos del usuario
};

/**
 * Función Reducer
 * @param {*} state 
 * @param {*} action 
 * @returns 
 */
export const authReducer = (state, action) => {
  // El 'type' de la acción es la instrucción que recibimos.
  switch (action.type) {
    // Caso 1: Instrucción de éxito de login
    case 'LOGIN_SUCCESS':
      return {
        // ...state: Mantenemos el estado actual por si acaso
        ...state,
        // Los cambios:
        isAuthenticated: true,
        token: action.payload.token, // Guardamos el token que viene en la acción
        user: action.payload.user,   // Guardamos la info del usuario
      };

    // Caso 2: Instrucción de cierre de sesión
    case 'LOGOUT':
      return {
        // Limpiamos todo y volvemos al estado inicial
        isAuthenticated: false,
        token: null,
        user: null,
      };

    // Caso por defecto: si la instrucción no se reconoce, devolvemos el estado sin cambios
    default:
      return state;
  }
};
