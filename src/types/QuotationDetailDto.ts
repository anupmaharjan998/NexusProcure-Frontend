/* ================= Comparison Summary ================= */

export interface ComparisonSummaryDto {
    lowest: number;
    highest: number;
    average: number;
    priceRange: number;
}

/* ================= Quotation Item ================= */

export interface QuotationItemDto {
    id: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    vatAmount: number;   // renamed from taxPercentage
    total: number;
}

/* ================= Quotation Detail ================= */

export interface QuotationDetailResponseDto {
    id: string;

    vendorName: string;
    vendorEmail: string;
    contactPerson: string;

    submittedAt: string;       // ISO string from DateTime
    totalAmount: number;        // renamed from totalAmount

    paymentTerms: string;
    deliveryTime: string;      // DateTime from backend (ISO string)
    notes: string;

    items: QuotationItemDto[];
}

/* ================= Comparison Response ================= */

export interface QuotationComparisonResponseDto {
    summary: ComparisonSummaryDto;
    quotations: QuotationDetailResponseDto[];
}
