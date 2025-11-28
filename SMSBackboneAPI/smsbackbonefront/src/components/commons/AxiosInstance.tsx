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
      config.headers.Authorization = `Bearer ${token}`;    } else {
      console.warn('⚠️ No se encontró token en localStorage');
    }

    try {
      const client = JSON.parse(localStorage.getItem('selectedClient') || 'null');
      if (client?.id) {
        config.headers['X-Client-Id'] = client.id;
      } else {
        console.warn('⚠️ No se encontró selectedClient en localStorage');
      }
    } catch (e) {
      console.warn('⚠️ Error al leer selectedClient del localStorage', e);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
