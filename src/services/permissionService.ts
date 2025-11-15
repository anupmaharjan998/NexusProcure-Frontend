import {Permission} from "@/types/Permission.ts";
import api from "@/services/api.ts";

export const getPermissions = async (): Promise<Permission[]> => {
    const response = await api.get<Permission[]>('/permissions');
    return response.data;
};

export const getRolePermissions = async (roleId: string): Promise<Permission[]> => {
    const response = await api.get<Permission[]>(`/permissions/role-permissions/${roleId}`);
    return response.data;
};

export const updateRolePermissions = async (roleId: string, permissionIds: string[]): Promise<string> => {
    const response = await api.post(`/permissions/assign/${roleId}`, permissionIds);
    return response.data;
};