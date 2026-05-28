// src/services/procurementRequestService.ts

import api from "./api";

export interface ProcurementRequestListDto {
    id: string;
    inventoryRequestId: string;
    requestNumber: string;
    requestedBy: string;
    approvedByManager: string;
    approvedAt: string;
    createdAt: string;
    status: string;
    totalItems: number;
    totalQuantityToProcure: number;
    requisitionId?: string | null;
}

export interface ProcurementRequestItemDto {
    id: string;
    stockId: string;
    itemName: string;
    categoryName: string;
    requestedQuantity: number;
    availableQuantity: number;
    requiredProcurementQuantity: number;
    notes?: string | null;
}

export interface ProcurementRequestDetailDto {
    id: string;
    inventoryRequestId: string;
    requestNumber: string;
    requestedBy: string;
    department: string;
    approvedByManager: string;
    approvedAt: string;
    createdAt: string;
    status: string;
    managerRemarks?: string | null;
    requisitionId?: string | null;
    items: ProcurementRequestItemDto[];
}

export interface CreateRequisitionFromProcurementRequestDto {
    requiredDate?: string | null;
    notes?: string | null;
    items: {
        procurementRequestItemId: string;
        estimatedUnitCost: number;
        remarks?: string | null;
    }[];
}

export interface RejectProcurementRequestDto {
    reason: string;
}

export const procurementRequestService = {
    getAll: async (): Promise<ProcurementRequestListDto[]> => {
        const response = await api.get("/procurement-requests");
        return response.data;
    },

    getById: async (id: string): Promise<ProcurementRequestDetailDto> => {
        const response = await api.get(`/procurement-requests/${id}`);
        return response.data;
    },

    createRequisition: async (
        id: string,
        dto: CreateRequisitionFromProcurementRequestDto
    ): Promise<{ message: string; requisitionId: string }> => {
        const response = await api.post(
            `/procurement-requests/${id}/create-requisition`,
            dto
        );

        return response.data;
    },

    reject: async (
        id: string,
        dto: RejectProcurementRequestDto
    ): Promise<{ message: string }> => {
        const response = await api.post(`/procurement-requests/${id}/reject`, dto);
        return response.data;
    }
};