import api from "./api";
import {
    GoodsReceiptResultDto,
    PurchaseOrderDeliveryListDto,
    PurchaseOrderDto,
    PurchaseOrderListResponse,
    ReceivePurchaseOrderRequest
} from "../types/purchaseOrder";

export const getPurchaseOrders = async (): Promise<PurchaseOrderListResponse> => {
    const response = await api.get("/purchaseorders");
    return response.data;
};

export const getPurchaseOrder = async (id: string): Promise<PurchaseOrderDto> => {
    const response = await api.get(`/purchaseorders/${id}`);
    return response.data;
};

export const getPurchaseOrderReceiptDetail = async (
    purchaseOrderId: string
): Promise<PurchaseOrderDeliveryListDto> => {
    const response = await api.get(`/purchaseorderreceipt/${purchaseOrderId}`);
    return response.data;
};

export const receivePurchaseOrder = async (
    purchaseOrderId: string,
    payload: ReceivePurchaseOrderRequest
): Promise<GoodsReceiptResultDto> => {
    const response = await api.post(
        `/purchaseorderreceipt/${purchaseOrderId}/receive`,
        payload
    );

    return response.data;
};

export const updatePurchaseOrderDeliveryDate = async (
    purchaseOrderId: string,
    newArrivalDate: string
): Promise<{ message: string }> => {
    const response = await api.put(
        `/purchaseorderreceipt/${purchaseOrderId}/delivery-date`,
        {
            newArrivalDate
        }
    );

    return response.data;
};