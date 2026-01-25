// models/quotation.ts

export interface QuotationItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatPercentage: number;
}

export interface QuotationFormData {
    companyName: string;
    contactPerson: string;
    email: string;

    quotationNumber: string;
    quotationDate: string;
    validUntil: string;

    items: QuotationItem[];

    agree: boolean;
}

// types/rfq.ts
export interface PublicRfqResponse {
    rfqNumber: string;
    createdAt: string;
    submissionDeadline: string;
    vendor: {
        vendorId: string;
        companyName: string;
        vendorName: string;
        email: string;
        phone: string;
        address: string;
        paymentTerms?: string;
    };
    items: {
        itemId: string;
        itemName: string;
        quantity: number;
    }[];
}
