export interface ApprovalLevel {
    id: string;
    levelName: string;
    minAmount: number;
    maxAmount: number;
    roleId: string;
    roleName: string;
}