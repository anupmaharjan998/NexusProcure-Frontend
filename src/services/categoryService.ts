import api from './api';
import {Category, CategoryRequest} from '../types/Category';
import {Vendor} from "@/types/Vendor.ts";

export const getAllCategories = async () => {
    const res = await api.get<Category[]>('/common/getAllCategories');
    return res.data;
};

export const createCategory = async (data: CategoryRequest): Promise<Category> => {
    const res = await api.post('/common/addCategory', data);
    return res.data;
};

export const updateCategory = async (id: string, data: CategoryRequest): Promise<Category> => {
    const res = await api.put(`/common/${id}/update-category`, data);
    return res.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await api.delete(`/common/${id}/delete-category`);
};

export const getCategoryById = async (id: string) => {
    const res = await api.get<Category>(`/common/get-category/${id}`);
    return res.data;
};