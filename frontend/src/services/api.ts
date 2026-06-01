import axios from 'axios';

// Determinar a URL da API baseado no ambiente
const getApiUrl = () => {
  // Em produção no Vercel, usar a mesma origem
  if (import.meta.env.PROD) {
    return '/api';
  }
  // Em desenvolvimento, usar a URL configurada ou localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const preferencesService = {
  get: () => api.get('/preferences'),
  update: (preferences: string[]) =>
    api.put('/preferences', { preferences }),
};

export const feedService = {
  get: () => api.get('/feed'),
  refresh: () => api.post('/feed/refresh'),
};

export default api;
