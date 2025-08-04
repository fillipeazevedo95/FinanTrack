import axios, { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Criar instância do axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Tratar erros de autenticação
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Sessão expirada. Faça login novamente.');
      return Promise.reject(error);
    }

    // Tratar outros erros HTTP
    if (error.response?.status === 403) {
      toast.error('Acesso negado.');
    } else if (error.response?.status === 404) {
      toast.error('Recurso não encontrado.');
    } else if (error.response?.status === 422) {
      toast.error('Dados inválidos.');
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Tempo limite excedido. Verifique sua conexão.');
    } else if (!error.response) {
      toast.error('Erro de conexão. Verifique sua internet.');
    }

    return Promise.reject(error);
  }
);

// Tipos para respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Funções utilitárias
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Erro desconhecido';
};

export const isApiResponse = (data: any): data is ApiResponse => {
  return data && typeof data === 'object' && 'success' in data;
};

export default api;
