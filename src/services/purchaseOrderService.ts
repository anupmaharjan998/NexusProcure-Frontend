import api from "../services/api";
import { PurchaseOrderDto, PurchaseOrderListResponseDto } from "@/types/purchaseOrder";

export const getPurchaseOrders = async (): Promise<PurchaseOrderListResponseDto> => {
    const response = await api.get("/PurchaseOrders");
    return response.data;
};

export const getPurchaseOrder = async (
    id: string
): Promise<PurchaseOrderDto> => {
    const response = await api.get(`/PurchaseOrders/${id}`);
    return response.data;
};