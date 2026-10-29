// src/components/commons/axiosInstance.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_SMS_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No se encontró token en localStorage');
    }

    try {
      const selectedClient = JSON.parse(
        localStorage.getItem('selectedClient') || 'null'
      );
      const userData = JSON.parse(
        localStorage.getItem('userData') || '{}'
      );

      const clientId =
        selectedClient?.id ??
        selectedClient?.idCliente ??
        userData?.idCliente;
      console.log('[Axios] selectedClient.id:', selectedClient?.id);
      console.log('[Axios] userData.idCliente:', userData?.idCliente);
      console.log('[Axios] idCliente calculado:', clientId);
      if (clientId != null) {
        config.headers['X-Client-Id'] = String(clientId);
      } else {
        console.warn('⚠️ No se encontró el idCliente en localStorage');
      }
    } catch (error) {
      console.warn(
        '⚠️ Error al leer el idCliente de localStorage',
        error
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;