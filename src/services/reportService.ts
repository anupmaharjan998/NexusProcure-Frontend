import api from './api';
import {
    LowStockReportDto,
    MonthlySpendDto,
    PagedResult,
    PurchaseOrderReportDto,
    PurchaseOrderReportQuery,
    ReportsDashboardDto,
} from '../types/reports';

export const getReportsDashboard = async (): Promise<ReportsDashboardDto> => {
    const response = await api.get<ReportsDashboardDto>('/reports/dashboard');
    return response.data;
};

export const getPurchaseOrderReport = async (
    query: PurchaseOrderReportQuery
): Promise<PagedResult<PurchaseOrderReportDto>> => {
    const response = await api.get<PagedResult<PurchaseOrderReportDto>>(
        '/reports/purchase-orders',
        {
            params: query,
        }
    );

    return response.data;
};

export const getLowStockReport = async (): Promise<LowStockReportDto[]> => {
    const response = await api.get<LowStockReportDto[]>('/reports/low-stock');
    return response.data;
};

export const getMonthlySpendReport = async (
    year: number
): Promise<MonthlySpendDto[]> => {
    const response = await api.get<MonthlySpendDto[]>(
        '/reports/monthly-spend',
        {
            params: { year },
        }
    );

    return response.data;
};