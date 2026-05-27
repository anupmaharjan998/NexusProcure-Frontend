import api from './api';

export type DelegationPermissionsDto = {
    canManageAll: boolean;
    canCreateOwn: boolean;
};

export type DelegationDto = {
    id: string;

    delegatorUserId: string;
    delegatorName: string;
    delegatorEmail?: string | null;

    delegateUserId: string;
    delegateName: string;
    delegateEmail?: string | null;

    startDate: string;
    endDate: string;

    scope: string;
    reason?: string | null;

    isActive: boolean;
    isExpired: boolean;
    status: string;

    createdAt: string;
};

export type CreateDelegationDto = {
    userId?: string;
    delegateUserId: string;
    startDate: string;
    endDate: string;
    scope: string;
    reason?: string;
};

export const getDelegationPermissions = async () => {
    const res = await api.get<DelegationPermissionsDto>('/delegations/permissions');
    return res.data;
};

export const getDelegations = async () => {
    const res = await api.get<DelegationDto[]>('/delegations');
    return res.data;
};

export const createDelegation = async (payload: CreateDelegationDto) => {
    const res = await api.post<DelegationDto>('/delegations', payload);
    return res.data;
};

export const deactivateDelegation = async (id: string) => {
    const res = await api.put(`/delegations/${id}/deactivate`);
    return res.data;
};