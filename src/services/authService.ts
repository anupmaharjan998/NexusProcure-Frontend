import api from './api.ts';
import { LoginCredentials, LoginResponse } from '../types/User.ts';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/Auth/Login', credentials);
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const payload = {
    CurrentPassword: data.currentPassword,
    NewPassword: data.newPassword,
    ConfirmNewPassword: data.confirmPassword,
  };
  console.log(payload);
  const response = await api.post('/Auth/change-password', payload);
  return response.data;
};


