export interface RequisitionItemDto {
    id?: string;
    itemName: string;
    quantity: number;
    estimatedCost: number;
}

export interface RequisitionDto {
    id?: string;
    requestedById: string;
    requestedByName?: string;
    categoryName?: string;
    requestedDate?: string;
    status?: string;
    items: RequisitionItemDto[];
    totalAmount: number;
    approvals: ApprovalsResponse[];
}

export interface RequisitionRequest {
    categoryId: string;
    isUrgent: boolean;
    requestedById: string;
    items: RequisitionItemDto[];
}

export interface ApprovalsResponse {
    id?: string;
    approvedByName: string;
    status: string;
    approvedDate?: string;
    approvedBy: {
        fullName: string;
    };
    decision: string;
    comments: string;


}