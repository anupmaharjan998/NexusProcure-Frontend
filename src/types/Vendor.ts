import {TaxType} from "@/types/TaxType.ts";

export interface Vendor {
    id: string;
    vendorName: string;
    companyName: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    categoryIds: string[];
    categoryNames: string[];
    taxType: TaxType;
    taxId?: string;
    category?: string;
    status: 'Pending' | 'Active' | 'Inactive' | 'Rejected';
    bankAccount?: string;
    bankName?: string;
    bankBranch?: string;
    paymentTerms?: number;
    documents?: VendorDocument[];
}

export interface VendorFormData {
    vendorName: string;
    companyName: string;
    email: string;
    phoneNumber: string;
    address: string;
    taxId: string;
    taxType: TaxType;
    categoryIds: string[];
    bankAccount?: string;
    bankName?: string;
    bankBranch?: string;
    paymentTerms: number;
    status: 'Active' | 'Inactive' | 'Pending' | 'Rejected';
}


export interface VendorDocument {
    id: string;
    vendorId: string;
    fileUrl: string;
    fileName?: string;
    fileType?: string;
    publicId?: string;
    expiryDate?: string;
    uploadedBy?: string;
    createdAt: string;
}
