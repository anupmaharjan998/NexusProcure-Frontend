import api from './api';

import {
    AvailableInventoryItem,
    CreateInventoryRequestRequest,
    InventoryRequest,
    InventoryRequestSummary,
    MyAssignedInventoryItem, MyAssignedInventoryItemDetail,
    ProcessInventoryRequestRequest,
    RejectInventoryRequestRequest,
} from '../types/InventoryRequest';

export const createInventoryRequest = async (
    data: CreateInventoryRequestRequest
) => {
    const res = await api.post('/inventory-requests', data);
    return res.data;
};

export const getMyInventoryRequests = async (): Promise<InventoryRequestSummary[]> => {
    const res = await api.get('/inventory-requests/my');
    return res.data;
};

export const getManagerPendingInventoryRequests = async (): Promise<InventoryRequestSummary[]> => {
    const res = await api.get('/inventory-requests/manager-pending');
    return res.data;
};

export const getInventoryManagerPendingRequests = async (): Promise<InventoryRequestSummary[]> => {
    const res = await api.get('/inventory-requests/inventory-pending');
    return res.data;
};

export const getInventoryRequestById = async (
    requestId: string
): Promise<InventoryRequest> => {
    const res = await api.get(`/inventory-requests/${requestId}`);
    return res.data;
};

export const approveInventoryRequestByManager = async (requestId: string) => {
    const res = await api.post(`/inventory-requests/${requestId}/manager-approve`);
    return res.data;
};

export const rejectInventoryRequestByManager = async (
    requestId: string,
    data: RejectInventoryRequestRequest
) => {
    const res = await api.post(
        `/inventory-requests/${requestId}/manager-reject`,
        data
    );
    return res.data;
};

export const processInventoryRequest = async (
    requestId: string,
    data: ProcessInventoryRequestRequest
) => {
    const res = await api.post(`/inventory-requests/${requestId}/process`, data);
    return res.data;
};

export const getAvailableAssetsByStock = async (
    stockId: string
): Promise<AvailableInventoryItem[]> => {
    const res = await api.get(
        `/inventory-requests/stocks/${stockId}/available-assets`
    );
    return res.data;
};

export const getManagerShortagePendingInventoryRequests = async () => {
    const res = await api.get('/inventory-requests/manager-shortage-pending');
    return res.data;
};

export const sendInventoryShortageToProcurement = async (
    requestId: string,
    remarks?: string
) => {
    const res = await api.post(
        `/inventory-requests/${requestId}/shortage/send-procurement`,
        { remarks }
    );
    return res.data;
};

export const rejectInventoryShortage = async (
    requestId: string,
    remarks?: string
) => {
    const res = await api.post(
        `/inventory-requests/${requestId}/shortage/reject`,
        { remarks }
    );
    return res.data;
};


export const getMyAssignedInventoryItems = async (): Promise<MyAssignedInventoryItem[]> => {
    const response = await api.get<MyAssignedInventoryItem[]>('/inventory-requests/my-assigned');
    return response.data;
};

export const getMyAssignedInventoryItemDetail = async (
    itemId: string
): Promise<MyAssignedInventoryItemDetail> => {
    const response = await api.get<MyAssignedInventoryItemDetail>(
        `/inventory-requests/my-assigned/${itemId}`
    );

    return response.data;
};