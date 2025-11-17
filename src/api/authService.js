// src/api/authService.js
import axios from 'axios';

// Obtenemos la URL base de las variables de entorno de Vite
// Esto garantiza que se use la URL correcta (dev o prod)
const API_URL = import.meta.env.VITE_API_BASE_URL; 
console.log('API_URL:', API_URL);

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

/**
 * Llama al endpoint de verificación 2FA
 * @param {object} data - Contiene { userId, code }.
 * @returns {Promise<object>} Promesa que resuelve a { token, user, message } o lanza un error.
 */
export const verifyCode = async (data) => {
  try {
    // El endpoint de verificación es '/verify-2fa'
    const response = await axios.post(`${API_URL}/verify-2fa`, data);
    
    // Asumimos que el servidor devuelve { token, user, message }
    return response.data; 
    
  } catch (error) {
    console.error("Fallo la llamada a la API de verificación:", error.response?.data || error.message);
    throw error.response?.data || error.message; 
  }
};


// src/api/authService.js
export const createUser = async (userData) => {
  try {
    // CAMBIA ESTA LÍNEA - quita el /api/v1 extra
    const response = await axios.post(`${API_URL}/usuarios/nuevo`, userData);
    return response.data;
  } catch (error) {
    console.error("Error creando usuario:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};