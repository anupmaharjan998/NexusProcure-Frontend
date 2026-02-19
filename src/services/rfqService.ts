import api from './api';
import {RfqDto} from "@/types/RfqDto.ts";


export const getRfq = (token: string) =>
    api.get(`/PublicRfq/${token}`);

export const submitQuotation = (token: string, data: any) =>
    api.post(`/PublicRfq/${token}/submit`, data);

export const downloadTemplate = (token: string) =>
    api.get(`/PublicRfq/${token}/template`, {responseType: "blob"});

export const uploadExcel = (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/PublicRfq/${token}/upload`, form);
};

export const getRfqs = async (params?: any) => {
    const res = await api.get<RfqDto[]>('/Rfq');
    return res.data;
};

export const getQuotationsByRfq = async (rfqId: string) => {
    const res = await api.get(`/Rfq/${rfqId}/quotations`);
    return res.data;
};

export const getQuotationById = async (id: string) => {
    const res = await api.get(`/Rfq/${id}/quotations-details`);
    return res.data;
};

export const compareQuotations = async (ids: string[]) => {
    const res = await api.post('/Rfq/compare', ids);
    return res.data;
};


export const selectQuotationForApproval = async (
    rfqId: string,
    quotationId: string
) => {
    return api.post(
        `/Rfq/${rfqId}/select-quotation`,
        quotationId // not wrapped in object
    );
};

export const clearSelectedQuotation = async (rfqId: string) => {
    return api.post(`/Rfq/${rfqId}/clear-selection`);
};


