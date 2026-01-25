import api from './api';


export const getRfq = (token: string) =>
    api.get(`/PublicRfq/${token}`);

export const submitQuotation = (token: string, data: any) =>
    api.post(`/PublicRfq/${token}/submit`, data);

export const downloadTemplate = (token: string) =>
    api.get(`/PublicRfq/${token}/template`, { responseType: "blob" });

export const uploadExcel = (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/PublicRfq/${token}/upload`, form);
};
