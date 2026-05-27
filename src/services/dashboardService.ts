import api from './api';
import {DashboardResponseDto} from "@/types/dashboard.ts";

export const getDashboardStats = async (): Promise<DashboardResponseDto> => {
    const response = await api.get<DashboardResponseDto>('/Dashboard/stats');
    return response.data;
};
