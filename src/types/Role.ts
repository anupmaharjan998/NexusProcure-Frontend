import { Permission } from '../types/Permission.ts';

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissionCount?: number;
    permissions?: Permission[];
    createdAt?: string;
    updatedAt?: string;
}

export interface RoleFormData {
    name: string;
    description?: string;
}