export interface Approval {
    id: string;
    requisitionId: string;
    approvedById: string;
    approvedByName: string;
    approvedByRole: string;
    approvedDate: string;
    decision: string;
    comments: string;
}

export interface RequisitionPendingApproval {
    id: string;
    requestedById: string;
    requisitionNumber: string;
    requestedByName: string;
    requestedDate: string;
    totalAmount: number;
    status: string;
}

// DTO for sending approval request
export interface ApprovalRequest {
    approverId: string;
    roleId: string;
    decision: 'Approved' | 'Rejected';
    comments: string;
}
