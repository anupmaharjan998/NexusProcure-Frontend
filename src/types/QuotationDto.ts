export interface QuotationDto {
    id: string;
    vendorName: string;
    vendorEmail: string;
    contactPerson: string;
    submittedAt: string;
    validUntil: string;
    totalAmount: number;
    status: string;
    isSelected: boolean;
}
