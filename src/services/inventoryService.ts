import api from './api';
import {string} from "yup";

/* ================= STOCK / CATALOG ================= */

export const getInventoryStocks = async (params?: InventoryStockQueryParams) => {
    const res = await api.get('/inventory/stocks', { params });
    return res.data;
};

export const createInventoryStock = async (data: CreateInventoryStockDto) => {
    const res = await api.post('/inventory/stocks', data);
    return res.data;
};

export const updateInventoryStock = async (id: string, data: UpdateInventoryStockDto) => {
    const res = await api.put(`/inventory/stocks/${id}`, data);
    return res.data;
};

export const adjustInventoryStock = async (id: string, data: AdjustInventoryStockDto) => {
    const res = await api.post(`/inventory/stocks/${id}/adjust`, data);
    return res.data;
};

export const getAvailableInventoryStocks = async () => {
    const res = await api.get('/inventory/stocks/available');
    return res.data;
};

/* ================= ASSETS ================= */

export const getInventory = async (params?: any) => {
    const res = await api.get('/inventory/assets', { params });
    return res.data;
};

export const getInventoryItemById = async (id: string) => {
    const res = await api.get(`/inventory/assets/${id}`);
    return res.data;
};

export const createInventoryItem = async (data: CreateInventoryItemDto) => {
    const res = await api.post('/inventory/assets', data);
    return res.data;
};

export const updateInventoryItem = async (id: string, data: UpdateInventoryItemDto) => {
    const res = await api.put(`/inventory/assets/${id}`, data);
    return res.data;
};

export const getAvailableAssetsByStock = async (stockId: string) => {
    const res = await api.get(`/inventory/assets/by-stock/${stockId}`);
    return res.data;
};

export const assignItem = async (id: string, userId: string, notes?: string) => {
    const res = await api.post(`/inventory/assets/${id}/assign`, {
        userId,
        notes,
    });
    return res.data;
};

export const unassignItem = async (id: string) => {
    const res = await api.post(`/inventory/assets/${id}/unassign`);
    return res.data;
};

/* ================= CATEGORIES ================= */

export const getCategories = async (params?: CategoryQueryParams) => {
    const res = await api.get('/inventory/categories', { params });
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

export const getLeafCategories = async () => {
    const res = await api.get('/inventory/categories/leaf');
    return res.data;
};

export const getLeafCategoriesDropdown = async () => {
    const res = await api.get('/inventory/categories/leaf-dropdown');
    return res.data;
};

/* ================= USERS ================= */

export const searchUsers = async (search: string) => {
    const res = await api.get('/users/search', {
        params: { search },
    });
    return res.data;
};

/* ================= TYPES ================= */

export interface CategoryQueryParams {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    riskWeight: number;
    isAssetTracked: boolean;
    parentCategoryId?: string | null;
}

export interface UpdateCategoryDto {
    name: string;
    categoryCode?: string;
    description?: string;
    riskWeight: number;
    isAssetTracked: boolean;
}

export interface InventoryStockQueryParams {
    search?: string;
    categoryId?: string;
    status?: 'InStock' | 'LowStock' | 'OutOfStock' | '';
    pageNumber?: number;
    pageSize?: number;
}

export interface InventoryStockDto {
    id: string;
    name: string;
    sku: string;
    quantityAvailable: number;
    categoryId: string;
    categoryName: string;
    unit: string;
    reorderLevel: number;
    isAssetTracked: boolean;
    estimatedUnitCost?: number;
    status: string;
}

export interface CreateInventoryStockDto {
    name: string;
    categoryId: string;
    openingQuantity: number;
    unit: string;
    reorderLevel: number;
}

export interface UpdateInventoryStockDto {
    name: string;
    categoryId: string;
    unit: string;
    reorderLevel: number;
}

export interface AdjustInventoryStockDto {
    quantityChange: number;
    remarks?: string;
}

export interface CreateInventoryItemDto {
    name: string;
    stockId: string;
    description?: string;
    serialNumber?: string;
    location?: string;
}

export interface UpdateInventoryItemDto {
    name: string;
    description?: string;
    serialNumber?: string;
    location?: string;
    status: number | string;
    condition: number | string;
}

export interface InventoryItemDto {
    id: string;
    sku: string;
    name: string;

    category: string;
    inventoryCategoryId: string;

    serialNumber?: string | null;
    barcode?: string | null;

    status: number | string;
    condition: number | string;

    description?: string | null;

    assignedTo?: string | null;
    location: string;
}

export interface InventoryCategoryDto  {
    id: string;
    name: string;
    parentId?: string;
}