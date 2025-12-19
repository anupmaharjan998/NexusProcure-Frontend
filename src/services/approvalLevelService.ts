import api from './api';

export const getApprovalLevels = async () => {
    const res = await api.get('/ApprovalLevel/get-all-level');
    return res.data;
};

export const createApprovalLevel = async (data: any) => {
    const res = await api.post('/ApprovalLevel/create-approval-level', data);
    return res.data;
};

export const updateApprovalLevel = async (id: string, data: any) => {
    const res = await api.put(`/ApprovalLevel/${id}`, data);
    return res.data;
};

export const deleteApprovalLevel = async (id: string) => {
    const res = await api.delete(`/ApprovalLevel/${id}`);
    return res.data;
};
