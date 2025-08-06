// axiosInstance.ts
import axios from 'axios';

const instance = axios.create({
  baseURL:  `${import.meta.env.VITE_SMS_API_URL}`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token agregado al header:', config.headers.Authorization);
    } else {
      console.warn('⚠️ No se encontró token en localStorage');
    }

    // Puedes ver todos los headers si quieres
    console.log('🧾 Headers finales del request:', config.headers);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
