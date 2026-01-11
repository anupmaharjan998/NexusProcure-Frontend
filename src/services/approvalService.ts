import { Approval, RequisitionPendingApproval } from '../types/approval';
import api from "../services/api.ts";

export const getPendingRequisitions = async (): Promise<RequisitionPendingApproval[]> => {
    const res = await api.get(`/RequisitionApproval/pending`);
    return res.data;
};

export const approveRequisition = async (id: string, payload: { decision: 'Approved' | 'Rejected', comments : string }) => {
    const res = await api.post(`/RequisitionApproval/${id}/approve`, payload);
    return res.data;
};

export const getRequisitionApprovals = async (requisitionId: string): Promise<Approval[]> => {
    const res = await api.get(`/RequisitionApproval/${requisitionId}/approvals`);
    return res.data;
};
