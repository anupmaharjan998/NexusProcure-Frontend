import {RequisitionDto, RequisitionRequest} from '../types/requisition';

import api from "../services/api.ts";

export const getRequisitions = async (): Promise<RequisitionDto[]> => {
    const res = await api.get('/Requisitions');
    return res.data;
};

export const getRequisitionById = async (id: string): Promise<RequisitionDto> => {
    const res = await api.get(`/Requisitions/${id}`);
    return res.data;
};

export const createRequisition = async (
    data: RequisitionRequest
): Promise<RequisitionDto> => {
    const res = await api.post('/Requisitions', data);
    return res.data;
};

export const updateRequisition = async (
    id: string,
    data: RequisitionRequest
): Promise<RequisitionDto> => {
    const res = await api.put(`/Requisitions/${id}`, data);
    return res.data;
};

export const deleteRequisition = async (id: string) => {
    const res = await api.delete(`/Requisitions/${id}`);
    return res.data;
};

export const getLeafCategories = async () => {
    const res = await api.get('/inventory/get-leaf-categories-dropdown');
    return res.data;
};

export const getItemsByCategory = async (categoryId: string) => {
    const res = await api.get(`/inventory/items/by-category/${categoryId}`);
    return res.data;
};

export const createItem = async (payload: { name: string; categoryId: string, description: string}) => {
    const res = await api.post('/inventory/create-item', payload);
    return res.data;
};