import api from './api.ts';
import {User, UserFormData} from '../types/User.ts';

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
                roleName: 'Admin',
                departmentId: 'd-1',
                departmentName: 'IT',
                isActive: true,
                createdAt: new Date().toISOString(),
                permissions: ["VIEW_USERS"]
            },
            {
                id: 'u-2',
                fullName: 'Bob Smith - Dummy',
                email: 'bob@example.com',
                username: 'bobsmith',
                roleId: 'r-2',
                roleName: 'Employee',
                departmentId: 'd-2',
                departmentName: 'Finance',
                isActive: false,
                createdAt: new Date().toISOString(),
                permissions: ["VIEW_USERS"]
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
    };
    const response = await api.post<User>('/users', payload);
    return response.data;
};

export const updateUser = async (id: string, data: Partial<UserFormData>): Promise<User> => {
    const payload: any = {
        ...(data.name !== undefined ? {fullName: data.name} : {}),
        ...(data.email !== undefined ? {email: data.email} : {}),
        ...(data.username !== undefined ? {username: data.username} : {}),
        ...(data.roleId !== undefined ? {roleId: data.roleId} : {}),
        ...(data.departmentId !== undefined ? {departmentId: data.departmentId} : {}),
        ...(data.isActive !== undefined ? {isActive: data.isActive} : {}),
    };
    const response = await api.put<User>(`/users/${id}`, payload);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/users', data);
    return response.data;
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("fileRequest", file);

    const response = await api.post("/users/upload-profile-picture", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data.imageUrl.url;
};


export const checkUsernameExists = async (
    username: string,
    excludeUserId?: string
): Promise<boolean> => {
    const response = await api.get('/users/check-username', {
        params: {
            username,
            excludeUserId,
        },
    });

    return response.data.exists;
};


