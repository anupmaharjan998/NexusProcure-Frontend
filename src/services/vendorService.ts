import api from './api.ts';
import {Vendor, VendorFormData} from '../types/Vendor.ts';

export const getVendors = async (params?: any) => {
    const res = await api.get< Vendor[]>('/vendors');
    return res.data;
};

export const getVendorById = async (id: string) => {
    const res = await api.get<Vendor>(`/vendors/${id}`);
    return res.data;
};

export const createVendor = async (payload: VendorFormData) => {
    const res = await api.post<Vendor>('/vendors/add-vendor', payload);
    return res.data;
};

export const updateVendor = async (id: string, payload: VendorFormData) => {
    const res = await api.put<Vendor>(`/vendors/${id}`, payload);
    return res.data;
};
export const deleteVendor = async (id: string) => {
    const res = await api.delete<Vendor>(`/vendors/${id}`);
    return res.data;
};

export const activateVendor = async (id: string) => {
    const res = await api.post(`/vendors/${id}/activate`);
    return res.data;
};

export const deactivateVendor = async (id: string) => {
    const res = await api.post(`/vendors/${id}/deactivate`);
    return res.data;
};

export const uploadVendorDocument = async (vendorId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post(`/vendors/${vendorId}/documents`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};