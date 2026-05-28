import api from './api.ts';
import { Role, RoleFormData } from '../types/Role.ts';

export const getRoles = async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/roles');
    return response.data;
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

export const checkRoleNameExists = async (
    name: string,
    excludeRoleId?: string
): Promise<boolean> => {
    const response = await api.get('/roles/check-role-name', {
        params: {
            name,
            excludeRoleId,
        },
    });

    return response.data.exists;
};