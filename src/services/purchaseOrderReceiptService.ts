import api from './api';

export const getReceivingDeliveries = async (params?: {
    date?: string;
    search?: string;
    status?: string;
}) => {
    const res = await api.get('/PurchaseOrderReceipt/today', {
        params,
    });

    return res.data;
};

export const receivePurchaseOrderDelivery = async (
    purchaseOrderId: string,
    data: ReceivePurchaseOrderDto
) => {
    const res = await api.post(
        `/PurchaseOrderReceipt/${purchaseOrderId}/receive`,
        data
    );

    return res.data;
};

export interface ReceivePurchaseOrderDto {
    purchaseOrderId: string;
    receivedDate?: string;
    notes?: string;
    items: ReceivePurchaseOrderItemDto[];
}

export interface ReceivePurchaseOrderItemDto {
    purchaseOrderItemId: string;
    quantityReceived: number;
    location?: string;
    condition?: string;
    notes?: string;
}