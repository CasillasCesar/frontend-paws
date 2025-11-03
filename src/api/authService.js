// src/api/authService.js
import axios from 'axios';

// Obtenemos la URL base de las variables de entorno de Vite
// Esto garantiza que se use la URL correcta (dev o prod)
const API_URL = import.meta.env.VITE_API_BASE_URL; 

/**
 * Llama al endpoint de login del servidor.
 * @param {object} credentials - Contiene { email, password }.
 * @returns {Promise<object>} Promesa que resuelve a { token, user } o lanza un error.
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials); //modificar a la url correcta <Si se le olvido a cesar dale un sape>
    return response.data; 
    
  } catch (error) {
    // Si hay un error , capturamos el mensaje del servidor.
    console.error("Fallo la llamada a la API de login:", error.response?.data || error.message);
    
    // Lanzamos el error para que la "Acción" (authActions.js) pueda capturarlo
    // y notificar al componente de interfaz de usuario.
    throw error.response?.data || error.message; 
  }
};

// Aquí podríamos añadir otras funciones como register, forgotPassword, etc.