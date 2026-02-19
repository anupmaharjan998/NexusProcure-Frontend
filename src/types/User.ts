export interface User {
    id: string;
    fullName: string;
    email: string;
    username?: string;
    phoneNumber?: string;
    address?: string;
    roleId: string;
    roleName?: string;
    departmentId: string;
    departmentName?: string;
    isActive: boolean;
    permissions: string[];
    createdAt?: string;
    updatedAt?: string;
    profileImageUrl?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
    roleName: string;
    permissions: string[];
}

export interface UserFormData {
    name: string;
    email: string;
    username: string;
    roleId: string;
    departmentId: string;
    isActive: boolean;
}


