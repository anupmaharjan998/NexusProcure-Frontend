import api from './api';
import {TotalAmountRiskScore, TotalAmountRiskScoreRequest} from "../types/TotalAmountRiskScore.ts";



export const getTotalAmountRiskScores = async () => {
    const res = await api.get<TotalAmountRiskScore[]>('/TotalAmountRiskScore');
    return res.data;
};

export const createTotalAmountRiskScore = async (data: TotalAmountRiskScoreRequest): Promise<TotalAmountRiskScore> => {
    const res = await api.post('/TotalAmountRiskScore', data);
    return res.data;
};

export const updateTotalAmountRiskScore = async (id: string, data: TotalAmountRiskScoreRequest): Promise<TotalAmountRiskScore> => {
    const res = await api.put(`/TotalAmountRiskScore/${id}`, data);
    return res.data;
};

export const deleteTotalAmountRiskScore = async (id: string): Promise<void> => {
    await api.delete(`/TotalAmountRiskScore/${id}`);
};

export const getTotalAmountRiskScoresById = async (id: string) => {
    const res = await api.get<TotalAmountRiskScore>(`/TotalAmountRiskScore/${id}`);
    return res.data;
};