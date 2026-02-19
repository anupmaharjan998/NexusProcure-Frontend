import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';

const api = axios.create({
    baseURL: (import.meta as any).env?.VITE_API_URL || 'https://localhost:5255/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;


