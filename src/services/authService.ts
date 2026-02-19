import api from './api.ts';
import {LoginCredentials, LoginResponse} from '../types/User.ts';
import {ResetPasswordRequest} from "@/types/ResetPasswordRequest.ts";


export const login = async (
    credentials: LoginCredentials
): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
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

export const sendResetEmail = async (email: string) => {
    const response = await api.post(`/auth/forgot-password`, {email});
    return response.data;
};

export const resetPassword = async (data: ResetPasswordRequest) => {
    const response = await api.post(`/auth/reset-password`, data);
    return response.data;
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
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword,
    };

    const response = await api.post('/auth/change-password', payload);
    return response.data;
};
