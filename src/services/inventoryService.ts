import api from './api';

export const getInventory = (params: any) =>
    api.get('/inventory/get-all', { params }).then(res => res.data);


export const getCategories = async (params?: CategoryQueryParams) => {
    const res = await api.get('/inventory/get-categories', { params });
    return res.data;
};


export const createCategory = async (data: CreateCategoryDto) => {
    const res = await api.post('/inventory/categories', data);
    return res.data;
};


export const updateCategory = async (id: string, data: UpdateCategoryDto) => {
    const res = await api.put(`/inventory/categories/${id}`, data);
    return res.data;
};


export const deleteCategory = async (id: string) => {
    const res = await api.delete(`/inventory/categories/${id}`);
    return res.data;
};


export const createSubCategory = async (data: CreateCategoryDto) => {
    return createCategory({
        ...data,
        parentCategoryId: data.parentCategoryId
    });
};


export const createInventoryItem = async (data: any) => {
    const res = await api.post('/inventory/create-item', data); // ✅ correct endpoint
    return res.data;
};

export const getLeafCategories = async () => {
    const res = await api.get('/inventory/get-leaf-categories');
    return res.data;
};

export const previewSku = async (data: { name: string; categoryId: string }) => {
    const res = await api.get('/inventory/preview-sku', {
        params: data
    });
    return res.data;
};

export const getInventoryItemById = async (id: string) => {
    const res = await api.get(`/inventory/item/${id}`);
    return res.data;
};

export const updateInventoryItem = async (id: string, payload: any) => {
    const res = await api.put(`/inventory/update-item/${id}`, payload);
    return res.data;
};

export const assignItem = async (id: string, userId: string, notes?: string) => {
    const res = await api.post(`/inventory/${id}/assign`, {
        userId,
        notes,
    });
    return res.data;
};

export const unassignItem = async (id: string) => {
    const res = await api.post(`/inventory/${id}/unassign`);
    return res.data;
};

export const searchUsers = async (search: string) => {
    const res = await api.get('/users/search', {
        params: { search },
    });
    return res.data;
};


// 🔹 TYPES
export interface CategoryQueryParams {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    riskWeight: number;
    parentCategoryId?: null;
}

export interface UpdateCategoryDto {
    name: string;
    description?: string;
}



