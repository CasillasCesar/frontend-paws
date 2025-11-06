// src/auth/actions/authActions.js

import { AuthActionTypes } from '../reducers/authReducers';
import { login, verifyCode } from '../../api/authService';
import { saveToken, removeToken, saveUserData, removeUserData} from '../../utils/tokenUtils';

/**
 * ACCIÓN PRINCIPAL: Maneja el Envío de Credenciales.
 * Determina si el login es directo o requiere 2FA.
 * * @param {function} dispatch - La función dispatch obtenida del Contexto.
 * @param {object} credentials - Las credenciales del usuario { email, password }.
 */
export const loginUser = async (dispatch, credentials) => {
  try {
    // 1. Llamar a la API de autenticación (el Backend devuelve { token, user } O { needsVerification, userId })
    const response = await login(credentials); 
    
    // Manejo de la Respuesta del 2FA 
    if (response.needsVerification) {
      console.log('-> Login OK. Requiere verificación 2FA. Disparando VERIFICATION_REQUIRED.');

      // Notificar al Reducer que muestre el formulario 2FA
      dispatch({
        type: AuthActionTypes.VERIFICATION_REQUIRED,
        payload: { userId: response.userId } // Guardamos el ID para el paso siguiente
      });

      // Retornamos un objeto para que el LoginForm sepa que no hubo un éxito final.
      return { needsVerification: true };
    }

    // 2. Si el Backend devuelve token (LOGIN DIRECTO sin 2FA)
    const { token, user } = response;

    saveToken(token);
    
    dispatch({
      type: AuthActionTypes.LOGIN_SUCCESS,
      payload: { token, user },
    });
    
    return { needsVerification: false }; // Éxito de login directo
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    throw error; 
  }
};


/**
 * NUEVA ACCIÓN: Maneja el Envío del Código 2FA.
 * Si tiene éxito, dispara el LOGIN_SUCCESS final.
 * * @param {function} dispatch 
 * @param {number} userId - El ID temporal del usuario pendiente de verificación.
 * @param {string} code - El código de 6 dígitos.
 */
export const verifyCodeUser = async (dispatch, userId, code) => {
    try {
        // 1. Llamar a la API de verificación (el Backend devuelve { token, user, message })
        const response = await verifyCode({ userId, code });
        
        const { token, user, message } = response;

        // 2. Persistir el token (¡Solo si es el éxito final!)
        saveToken(token);
        saveUserData(user);
        
        // 3. Disparar el éxito final del login
        dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { token, user }
        });
        
        return message; // Retornamos el mensaje de éxito para la UI
    } catch (error) {
        console.error('Error durante la verificación 2FA:', error);
        // El error relanzado será capturado por el VerificationForm
        throw error; 
    }
};

/**
 * 🚪 Acción para cerrar sesión (Logout). (MANTENER IGUAL)
 * Limpia el token y dispara la acción de cierre de sesión.
 * @param {function} dispatch - La función dispatch del Contexto.
 */
export const logoutUser = (dispatch) => {
  removeToken();
  removeUserData();
  dispatch({
    type: AuthActionTypes.LOGOUT,
  });
};