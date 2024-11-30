import axios from 'axios';
import { app_url } from '@/constants';

const baseAxios = axios.create({
  baseURL: app_url,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

baseAxios.interceptors.request.use(undefined, (error) => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

export default baseAxios;
