// 1. Tipos de Acciones
export const AuthActionTypes = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
  REHYDRATE_SESSION: 'REHYDRATE_SESSION'
};

// 2. Estado Inicial
export const initialAuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  needsVerification: false,
  tempUserId: null,
  verificationMethod: 'email' // <-- CAMBIO CLAVE: Estado inicial
};

// 3. Función Reducer
export const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.VERIFICATION_REQUIRED:
      return {
        ...state,
        needsVerification: true,
        tempUserId: action.payload.userId,
        verificationMethod: action.payload.method // <-- CAMBIO CLAVE: Guardamos el método
      };

    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        needsVerification: false,
        tempUserId: null,
        verificationMethod: 'email' // <-- CAMBIO CLAVE: Reseteamos el método
      };

    case AuthActionTypes.REHYDRATE_SESSION:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...initialAuthState
      };

    default:
      return state;
  }
};