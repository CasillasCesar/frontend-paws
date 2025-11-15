// src/auth/actions/authActions.js
import { AuthActionTypes } from '../reducers/authReducers';
import { login, verifyCode } from '../../api/authService';
import { saveToken, removeToken, saveUserData, removeUserData } from '../../utils/tokenUtils';
import { toast } from 'react-toastify';

export const loginUser = async (dispatch, credentials) => {
  try {
    const response = await login(credentials);

    if (response.needsVerification) {
      console.log(`-> Login OK. Requiere 2FA por: ${response.method}`);

      toast.info("Se requiere código de verificación de doble factor.", {
        position: "bottom-center",
        autoClose: 5000,
      });

      // Notificar al Reducer que muestre el formulario 2FA
      dispatch({
        type: AuthActionTypes.VERIFICATION_REQUIRED,
        // ¡CAMBIO CLAVE AQUÍ!
        payload: {
          userId: response.userId,
          method: response.method // <-- AÑADIMOS EL MÉTODO
        }
      });

      return { needsVerification: true };
    }

    // (Login directo sin 2FA - si tu backend lo soportara)
    const { token, user } = response;
    saveToken(token);
    saveUserData(user);

    // CORREGIDO: user.nombre
    toast.success(`👋 Login Exitoso. ¡Bienvenido, ${user.nombre || 'Usuario'}!`, {
      position: "top-center",
      autoClose: 3000,
      theme: "colored",
    });

    dispatch({
      type: AuthActionTypes.LOGIN_SUCCESS,
      payload: { token, user },
    });

    return { needsVerification: false };
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    toast.error(error.message || "Credenciales inválidas o error de servidor.", {
      position: "bottom-center",
    });
    throw error;
  }
};


export const verifyCodeUser = async (dispatch, userId, code) => {
  try {
    const response = await verifyCode({ userId, code });
    const { token, user, message } = response;

    saveToken(token);
    saveUserData(user);

    // CORREGIDO: user.nombre
    toast.success(`👋 Login Exitoso. ¡Bienvenido, ${user.nombre || 'Usuario'}!`, {
      position: "top-center",
      autoClose: 3000,
      theme: "colored",
    });

    dispatch({
      type: AuthActionTypes.LOGIN_SUCCESS,
      payload: { token, user }
    });

    return message;
  } catch (error) {
    console.error('Error durante la verificación 2FA:', error);
    toast.error(error.message || "El código de verificación es incorrecto.", {
      position: "bottom-center",
    });
    throw error;
  }
};

export const logoutUser = (dispatch) => {
  removeToken();
  removeUserData();
  dispatch({
    type: AuthActionTypes.LOGOUT,
  });
  toast.info("Sesión cerrada correctamente. ¡Vuelve pronto!", {
    position: "top-right",
    autoClose: 2000,
    theme: "dark",
  });
};