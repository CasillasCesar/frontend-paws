// src/auth/reducers/authReducer.js

// 1. Tipos de Acciones (Buenas prácticas: evitamos errores de tipeo)
export const AuthActionTypes = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  // Podríamos añadir CHECK_AUTH (para verificar el token en localStorage al iniciar la app)
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
  REHYDRATE_SESSION: 'REHYDRATE_SESSION'
};

// 2. Estado Inicial (Define la forma de nuestro estado de sesión)
export const initialAuthState = {
  isAuthenticated: false, // Por defecto, no hay sesión activa
  token: null,            // El token JWT
  user: null,             // La información del usuario (nombre, email, roles, etc.)
  needsVerification: false, // Propiedad que indica si necesita 2FA
  tempUserId: null          // ID del usuario para enviar la
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
    case AuthActionTypes.VERIFICATION_REQUIRED:
            return {
                ...state,
                needsVerification: true,
                tempUserId: action.payload.userId,
            };
    case AuthActionTypes.LOGIN_SUCCESS:
      // Cuando el login es exitoso, actualizamos el estado
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        needsVerification: false,
        tempUserId: null,
      };

    case AuthActionTypes.REHYDRATE_SESSION:
        // Esta acción simplemente restaura el estado desde localStorage al inicio.
        return {
            ...state,
            isAuthenticated: true,
            user: action.payload.user,
            token: action.payload.token,
            // No tocamos needsVerification ni tempUserId
        };

    case AuthActionTypes.LOGOUT:
      // Cuando se cierra sesión, reseteamos el estado
      return {
        ...initialAuthState
      };

    default:
      // Si la acción no es reconocida, retornamos el estado sin cambios.
      return state;
  }
};