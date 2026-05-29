import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),

  getMe: () => api.get('/api/auth/me'),
};

// Cars API
export const carsApi = {
  getAll: (params?: { page?: number; limit?: number; sort?: string }) =>
    api.get('/api/cars', { params }),

  getOne: (id: string) =>
    api.get(`/api/cars/${id}`),

  create: (formData: FormData) =>
    api.post('/api/cars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    api.put(`/api/cars/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) =>
    api.delete(`/api/cars/${id}`),

  search: (q: string, params?: { page?: number; limit?: number }) =>
    api.get('/api/cars/search', { params: { q, ...params } }),

  getStats: () =>
    api.get('/api/cars/stats'),
};

export default api;
