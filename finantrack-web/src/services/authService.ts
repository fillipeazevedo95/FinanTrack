import axios from 'axios';
import { User, RegisterFormData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configurar interceptor para adicionar token automaticamente
axios.interceptors.request.use(
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

// Interceptor para lidar com respostas de erro
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao fazer login');
    }

    return response.data.data;
  },

  // Registro
  async register(data: RegisterFormData): Promise<AuthResponse> {
    const { confirmPassword, firstName, lastName, acceptTerms, ...rest } = data;

    // Validar se as senhas coincidem
    if (data.password !== confirmPassword) {
      throw new Error('As senhas não coincidem');
    }

    // Criar objeto com o formato esperado pelo backend
    const registerData = {
      name: `${firstName} ${lastName}`,
      email: rest.email,
      password: rest.password
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, registerData);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao criar conta');
    }

    return response.data.data;
  },

  // Obter perfil do usuário
  async getProfile(): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao obter perfil');
    }

    return response.data.data;
  },

  // Atualizar perfil
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axios.put(`${API_BASE_URL}/auth/profile`, data);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao atualizar perfil');
    }

    return response.data.data;
  },

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await axios.put(`${API_BASE_URL}/auth/change-password`, {
      currentPassword,
      newPassword,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao alterar senha');
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Obter token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Logout
  logout(): void {
    localStorage.removeItem('token');
  },
};
