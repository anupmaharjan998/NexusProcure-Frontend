import { User } from '@/types/User';

export interface RequisitionItemDto {
    id?: string;
    requisitionId?: string;

    inventoryStockId: string;
    itemName: string;
    sku?: string;
    categoryName?: string;
    unit?: string;

    quantity: number;
    estimatedCost: number;
    lineTotal?: number;
    remarks?: string | null;
}

export interface RequisitionDto {
    id?: string;
    requisitionNumber: string;

    requestedById: string;
    requestedByName?: string;
    requestedBy: User;

    requestedDate?: string;
    requiredDate?: string | null;

    status?: string;
    isUrgent: boolean;

    purpose: string;
    notes?: string | null;

    categoryName?: string;

    riskScore?: number;
    riskLevel?: string;

    items: RequisitionItemDto[];
    totalAmount: number;

    approvals: ApprovalsResponse[];
}

export interface RequisitionItemRequest {
    inventoryStockId: string;
    quantity: number;
    estimatedCost: number;
    remarks?: string;
}

export interface RequisitionFormItem {
    categoryId: string;
    inventoryStockId: string;
    quantity: number;
    estimatedCost: number;
    remarks?: string;
}

export interface RequisitionRequest {
    isUrgent: boolean;
    purpose: string;
    requiredDate?: string | null;
    notes?: string;
    items: RequisitionItemRequest[];
}

export interface RequisitionFormRequest {
    isUrgent: boolean;
    purpose: string;
    requiredDate?: string | null;
    notes?: string;
    items: RequisitionFormItem[];
}

export interface ApprovalsResponse {
    id?: string;
    approvedByName?: string;
    status: string;
    approvedDate?: string;
    actionedAt?: string;
    approvedBy?: {
        fullName: string;
    };
    decision?: string;
    comments?: string;
}