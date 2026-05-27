export interface DashboardSummaryDto {
    totalRequisitions: number;
    pendingApprovals: number;
    approvedRequisitions: number;
    rejectedRequisitions: number;

    totalRfqs: number;
    totalPurchaseOrders: number;
    totalPoValue: number;

    pendingDeliveries: number;
    completedDeliveries: number;
    lowStockItems: number;
}

export interface ChartReportDto {
    label: string;
    count: number;
}

export interface MonthlySpendDto {
    year: number;
    month: number;
    monthName: string;
    totalAmount: number;
}

export interface PurchaseOrderReportDto {
    id: string;

    poNumber: string;
    vendorName: string;
    requisitionNumber: string;

    createdAt: string;
    expectedDeliveryDate?: string | null;

    status: string;

    totalAmount: number;

    orderedQuantity: number;
    receivedQuantity: number;
    pendingQuantity: number;

    isTodayDelivery: boolean;
    isOverdue: boolean;
}

export interface LowStockReportDto {
    stockId: string;

    itemName: string;
    categoryName: string;
    unit: string;

    availableQuantity: number;
    reorderLevel: number;

    stockStatus: string;
}

export interface ReportsDashboardDto {
    summary: DashboardSummaryDto;

    requisitionStatus: ChartReportDto[];

    monthlySpend: MonthlySpendDto[];

    lowStockItems: LowStockReportDto[];

    todayDeliveries: PurchaseOrderReportDto[];

    overdueDeliveries: PurchaseOrderReportDto[];
}

export interface PagedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PurchaseOrderReportQuery {
    fromDate?: string;
    toDate?: string;
    status?: string;
    page?: number;
    pageSize?: number;
}