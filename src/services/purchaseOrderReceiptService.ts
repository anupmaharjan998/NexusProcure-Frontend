import api from "../services/api.ts";
import {CategoryQueryParams} from "@/services/inventoryService.ts";

export const getTodayPurchaseOrderDeliveries = async (
    search?: string,
    status?: string
) => {
    const res = await api.get('/PurchaseOrderReceipt/today', {
        params: {
            search,
            status
        }
    });

    return res.data;
};