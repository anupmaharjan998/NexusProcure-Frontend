import api from './api.ts';
import { User, UserFormData } from '../types/User.ts';

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>('/users');
    return response.data;
  } catch (error) {
    // Dummy data for testing when API is not available
    return [
      {
        id: 'u-1',
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '1234567890',
        roleId: 'r-1',
        role: 'Admin',
        departmentId: 'd-1',
        departmentName: 'IT',
        status: 'Active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u-2',
        fullName: 'Bob Smith',
        email: 'bob@example.com',
        phone: '9876543210',
        roleId: 'r-2',
        role: 'Employee',
        departmentId: 'd-2',
        departmentName: 'Finance',
        status: 'Inactive',
        createdAt: new Date().toISOString(),
      },
    ];
  }
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: UserFormData): Promise<User> => {
  const response = await api.post<User>('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<UserFormData>): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.put<User>('/users/profile', data);
  return response.data;
};


