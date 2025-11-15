import api from './api.ts';
import {Role, RoleFormData} from '../types/Role.ts';

export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get<Role[]>('/roles');
    return response.data;
  } catch (error) {
    return [
      { id: 'r-1', name: 'Admin', description: 'System administrator' },
      { id: 'r-2', name: 'Employee', description: 'Regular employee' },
      { id: 'r-3', name: 'Department Head', description: 'Leads a department' },
      { id: 'r-4', name: 'Procurement Officer', description: 'Handles procurement' },
    ];
  }
};

export const getRoleById = async (id: string): Promise<Role> => {
  const response = await api.get<Role>(`/roles/${id}`);
  return response.data;
};

export const createRole = async (data: RoleFormData): Promise<Role> => {
  const response = await api.post<Role>('/roles', data);
  return response.data;
};

export const updateRole = async (id: string, data: RoleFormData): Promise<Role> => {
  const response = await api.put<Role>(`/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/roles/${id}`);
};