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
        fullName: 'Alice Johnson - Dummy',
        email: 'alice@example.com',
        username: 'alicejohnson',
        roleId: 'r-1',
        role: 'Admin',
        departmentId: 'd-1',
        departmentName: 'IT',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u-2',
        fullName: 'Bob Smith - Dummy',
        email: 'bob@example.com',
        username: 'bobsmith',
        roleId: 'r-2',
        role: 'Employee',
        departmentId: 'd-2',
        departmentName: 'Finance',
        isActive: false,
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
  const payload = {
    fullName: data.name,
    email: data.email,
    username: data.username,
    roleId: data.roleId,
    departmentId: data.departmentId,
    isActive: data.isActive,
    ...(data.password ? { password: data.password } : {}),
  };
  const response = await api.post<User>('/users', payload);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<UserFormData>): Promise<User> => {
  const payload: any = {
    ...(data.name !== undefined ? { fullName: data.name } : {}),
    ...(data.email !== undefined ? { email: data.email } : {}),
    ...(data.username !== undefined ? { username: data.username } : {}),
    ...(data.roleId !== undefined ? { roleId: data.roleId } : {}),
    ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
  };
  if (data.password) {
    payload.password = data.password;
  }
  const response = await api.put<User>(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.put<User>('/users/profile', data);
  return response.data;
};


