export interface DashboardStats {
    totalUsers: number;
    totalDepartments: number;
    totalRoles: number;
    totalPermissions: number;
    totalVendors: number;

    totalInventoryItems: number;
    totalStockQuantity: number;
    lowStockItems: number;
    assignedItems: number;

    totalRequisitions: number;
    pendingRequisitions: number;
    approvedRequisitions: number;

    totalPurchaseOrders: number;
    pendingPurchaseOrders: number;
    completedPurchaseOrders: number;

    activeProcurements: number;
}