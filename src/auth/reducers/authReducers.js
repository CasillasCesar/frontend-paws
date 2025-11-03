// src/auth/reducers/authReducer.js

// 1. Tipos de Acciones (Buenas prácticas: evitamos errores de tipeo)
export const AuthActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  // Podríamos añadir CHECK_AUTH (para verificar el token en localStorage al iniciar la app)
};

// 2. Estado Inicial (Define la forma de nuestro estado de sesión)
export const initialAuthState = {
  isAuthenticated: false, // Por defecto, no hay sesión activa
  token: null,            // El token JWT
  user: null,             // La información del usuario (nombre, email, roles, etc.)
};

/**
 * 3. Función Reducer
 * Función pura que recibe el estado actual y una acción, y devuelve el nuevo estado.
 * @param {object} state - El estado actual del contexto de autenticación.
 * @param {object} action - La acción a ejecutar ({ type: string, payload: any }).
 * @returns {object} El nuevo estado.
 */
export const authReducer = (state, action) => {
  switch (action.type) {

    case AuthActionTypes.LOGIN_SUCCESS:
      // Cuando el login es exitoso, actualizamos el estado
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
      };

    case AuthActionTypes.LOGOUT:
      // Cuando se cierra sesión, reseteamos el estado a los valores iniciales
      return {
        isAuthenticated: initialAuthState.isAuthenticated, // false
        token: initialAuthState.token,                     // null
        user: initialAuthState.user,                       // null
      };

    default:
      // Si la acción no es reconocida, retornamos el estado sin cambios.
      return state;
  }
};