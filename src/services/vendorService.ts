import api from './api.ts';
import {Vendor, VendorFormData} from '../types/Vendor.ts';
import {Category, CategoryRequest} from "../types/Category.ts";
import {PaymentTerms} from "@/types/PaymentTerms.ts";

export const getVendors = async (params?: any) => {
    const res = await api.get<Vendor[]>('/vendors');
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
export const approveVendor = async (id: string) => {
    const res = await api.patch(`/vendors/${id}/status`);
    return res.data;
};

export const rejectVendor = async (id: string) => {
    const res = await api.patch(`/vendors/${id}/status`);
    return res.data;
};

export const updateVendorStatus = async (id: string, status: string) => {
    const res = await api.patch(`/vendors/${id}/status`, status);
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

export const getAllCategories = async () => {
    const res = await api.get<Category[]>('/common/getAllCategories');
    return res.data;
};

export const addCategory = async (name: string) => {
    const categoryRequest: CategoryRequest = {name: name, type: "Vendor"};
    const res = await api.post('/common/addCategory', categoryRequest);
    return res.data;
};


export const getAllPaymentTerms = async () => {
    const res = await api.get<PaymentTerms[]>('/vendors/get-payment-terms');
    return res.data;
};

export const downloadDocument = async (id: string) => {
    const res = await api.get(`/vendors/${id}/download-vendor-document`, {
        responseType: "blob",
    });
    return res.data;
};

