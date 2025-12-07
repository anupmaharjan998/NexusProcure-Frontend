export interface Vendor {
    id: string;
    vendorName: string;
    companyName: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    taxId?: string;
    category?: string;
    status: 'Pending' | 'Active' | 'Inactive' | 'Rejected';
    bankAccount?: string;
    paymentTerms?: string;
    documents?: VendorDocument[];
}

export interface VendorFormData {
    vendorName: string;
    companyName?: string;
    email: string;
    phoneNumber: string;
    address: string;
    taxId?: string;
    category: string;
    bankAccount?: string;
    paymentTerms?: string;
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
}
