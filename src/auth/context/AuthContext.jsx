// src/auth/context/AuthContext.jsx
import { createContext, useContext, useReducer } from 'react';
import { initialAuthState, authReducer } from '../reducers/authReducer';

// 1. Crear el Contexto
// Tendrá el estado actual (state) y la función para enviar acciones (dispatch)
export const AuthContext = createContext();

// 2. Crear el Provider (El componente que usaremos en main.jsx)
// Aquí es donde se inicializa el Reducer y se provee el valor.
export const AuthProvider = ({ children }) => {
  
  // Inicializamos el useReducer con el Reducer y el Estado Inicial
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

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