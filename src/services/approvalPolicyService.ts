import api from './api';

export const getApprovalPolicies = async () => {
    const res = await api.get('/ApprovalPolicy');
    return res.data;
};

export const createApprovalPolicy = async (data: any) => {
    const res = await api.post('/ApprovalPolicy', data);
    return res.data;
};

export const deleteApprovalPolicy = async (id: string) => {
    const res = await api.delete(`/ApprovalPolicy/${id}`);
    return res.data;
};
