export interface DashboardPermissionDto {
    canViewDashboard: boolean;

    canViewEmployeeDashboard: boolean;
    canViewMyRequisitionStats: boolean;
    canViewMyAssignedItems: boolean;

    canViewManagerDashboard: boolean;
    canViewDepartmentRequisitionStats: boolean;
    canViewPendingApprovalStats: boolean;
    canViewDepartmentInventoryStats: boolean;

    canViewProcurementDashboard: boolean;
    canViewProcurementQueueStats: boolean;
    canViewRfqStats: boolean;
    canViewQuotationStats: boolean;
    canViewPurchaseOrderStats: boolean;
    canViewRecentPurchaseOrders: boolean;
    canViewTodayDeliveries: boolean;

    canViewInventoryDashboard: boolean;
    canViewStockStats: boolean;
    canViewLowStockAlerts: boolean;
    canViewInventoryAssignmentStats: boolean;
    canViewReceivingStats: boolean;

    canViewFinanceDashboard: boolean;
    canViewPurchaseCostStats: boolean;
    canViewBudgetStats: boolean;

    canViewExecutiveDashboard: boolean;
    canViewExecutiveProcurementStats: boolean;
    canViewDashboardCharts: boolean;
    canViewDashboardAlerts: boolean;

    canViewAdminDashboard: boolean;
    canViewSystemStats: boolean;

    canViewDashboardReports: boolean;
    canExportDashboardReports: boolean;
    canViewDashboardQuickActions: boolean;
}

export interface SystemDashboardStatsDto {
    totalUsers: number;
    totalDepartments: number;
    totalRoles: number;
    totalPermissions: number;
    totalVendors: number;
}

export interface EmployeeDashboardStatsDto {
    myTotalRequisitions: number;
    myPendingRequisitions: number;
    myApprovedRequisitions: number;
    myRejectedRequisitions: number;
    myAssignedItems: number;
}

export interface ManagerDashboardStatsDto {
    departmentTotalRequisitions: number;
    departmentPendingRequisitions: number;
    departmentApprovedRequisitions: number;
    departmentRejectedRequisitions: number;
    pendingRequisitionApprovals: number;
    pendingQuotationApprovals: number;
    departmentAssignedItems: number;
}

export interface ProcurementDashboardStatsDto {
    totalRequisitions: number;
    approvedWaitingForProcurement: number;
    totalRfqs: number;
    totalQuotations: number;
    pendingQuotationApprovals: number;
    totalPurchaseOrders: number;
    activePurchaseOrders: number;
    completedPurchaseOrders: number;
    partiallyReceivedPurchaseOrders: number;
    todayDeliveries: number;
}

export interface InventoryDashboardStatsDto {
    totalInventoryItems: number;
    totalStockQuantity: number;
    lowStockItems: number;
    assignedItems: number;
    itemsToReceive: number;
    returnedItems: number;
    damagedItems: number;
}

export interface FinanceDashboardStatsDto {
    totalPurchaseValue: number;
    activePurchaseValue: number;
    completedPurchaseValue: number;
    pendingApprovalValue: number;
}

export interface ExecutiveDashboardStatsDto {
    totalDepartments: number;
    totalVendors: number;
    totalRequisitions: number;
    activePurchaseOrders: number;
    completedPurchaseOrders: number;
    pendingApprovals: number;
    lowStockItems: number;
    totalPurchaseValue: number;
}

export interface RecentPurchaseOrderDto {
    id: string;
    poNumber: string;
    vendorName: string;
    totalAmount: number;
    totalItems: number;
    status: number;
}

export interface DeliveryDto {
    id: string;
    poNumber: string;
    vendorName: string;
    totalItems: number;
    expectedDeliveryDate?: string | null;
}

export interface DashboardQuickActionDto {
    label: string;
    path: string;
    permission: string;
}

export interface DashboardChartItemDto {
    name: string;
    value: number;
}

export interface DashboardAlertDto {
    title: string;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error' | string;
    path?: string | null;
}

export interface DashboardResponseDto {
    permissions: DashboardPermissionDto;

    systemStats?: SystemDashboardStatsDto | null;
    employeeStats?: EmployeeDashboardStatsDto | null;
    managerStats?: ManagerDashboardStatsDto | null;
    procurementStats?: ProcurementDashboardStatsDto | null;
    inventoryStats?: InventoryDashboardStatsDto | null;
    financeStats?: FinanceDashboardStatsDto | null;
    executiveStats?: ExecutiveDashboardStatsDto | null;

    recentPOs: RecentPurchaseOrderDto[];
    deliveries: DeliveryDto[];
    quickActions: DashboardQuickActionDto[];
    chartData: DashboardChartItemDto[];
    alerts: DashboardAlertDto[];
}