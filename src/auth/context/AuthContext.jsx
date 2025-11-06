// src/auth/context/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { initialAuthState, authReducer, AuthActionTypes } from '../reducers/authReducers';
import { loadToken, loadUserData, removeToken, removeUserData } from "../../utils/tokenUtils";

// 1. Crear el Contexto
// Tendrá el estado actual (state) y la función para enviar acciones (dispatch)
export const AuthContext = createContext();

// 2. Crear el Provider (El componente que usaremos en main.jsx)
// Aquí es donde se inicializa el Reducer y se provee el valor.
export const AuthProvider = ({ children }) => {
  
  // Inicializamos el useReducer con el Reducer y el Estado Inicial
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // Lógica de Rehidratación de Sesión
  useEffect(() => {
    // 1. Intentar cargar el token de localStorage
    const token = loadToken();
    const user = loadUserData()

    if (token && user) {
      // Si hay un token, asumimos que es válido (o lo validaremos más tarde)
      // y disparamos una acción para RESTAURAR el estado de autenticación.
      
      // NOTA: En una aplicación real, se haría una llamada a la API 
      // aquí para validar si el token aún es válido antes de restaurar la sesión.

      dispatch({
        // Usamos la misma acción que LOGIN_SUCCESS, pero sin la contraseña (payload)
        type: AuthActionTypes.REHYDRATE_SESSION, 
        payload: { token, user }, 
      });

      console.log('Sesión rehidratada desde localStorage.');
    } else {
      if (token) { 
        removeToken(); 
        removeUserData();
      }
      console.log('No se encontró token. La sesión permanece cerrada.');
    }
  // El useEffect se ejecuta una sola vez al montar el componente (array de dependencia vacío)
  }, []);

  // El valor que se compartirá con todos los componentes que usen el contexto
  const contextValue = {
    // Estado (lo que los componentes quieren leer: isAuthenticated, token, user)
    authState,
    // La función 'dispatch' (lo que los componentes usarán para ejecutar acciones)
    dispatch,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Crear un Hook Personalizado para facilitar el consumo del contexto
// Esto hace que la lectura del contexto sea más limpia en los componentes.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};