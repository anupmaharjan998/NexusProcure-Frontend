export interface PurchaseOrderDto {
    id: string;
    poNumber: string;
    reqNumber?: string;

    vendorName: string;
    vendorEmail?: string;
    vendorPhoneNumber?: string;
    vendorAddress?: string;
    vendorContactPerson?: string;

    poDate: string;
    deliveryDate: string | null;

    status: string;
    deliveryStatus: string;

    paymentTerms?: string;
    deliveryTerms?: string;
    quotationReference?: string;

    subTotal?: number;
    vat?: number;
    totalAmount: number;

    items?: PurchaseOrderItemDto[];
}

export interface PurchaseOrderItemDto {
    id?: string;
    itemName: string;
    taxPercentage: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    unit?: string;
}

export interface PurchaseOrderListResponse {
    totalPOs: number;
    totalValue: number;
    inTransit: number;
    delivered: number;
    orders: PurchaseOrderDto[];
}

export interface PurchaseOrderDeliveryListDto {
    id: string;
    purchaseOrderNumber: string;
    vendorName: string;
    expectedDate: string | null;
    status: string;
    location: string;
    totalItems: number;
    items: PurchaseOrderDeliveryItemDto[];
}

export interface PurchaseOrderDeliveryItemDto {
    purchaseOrderItemId: string;
    itemName: string;
    sku?: string | null;
    quantity: number;
    inventoryCategoryId?: string | null;
    inventoryCategoryName?: string | null;
    isAssetTracked: boolean;
    orderedQty: number;
    receivedQty: number;
    remainingQty: number;
    unitPrice: number;
}

export interface ReceivePurchaseOrderItemRequest {
    purchaseOrderItemId: string;
    quantityReceived: number;
    location?: string | null;
    condition?: string | null;
    notes?: string | null;
    assetDetails?: ReceiveAssetDetailRequest[];
}

export interface ReceivePurchaseOrderRequest {
    purchaseOrderId: string;
    receivedDate?: string | null;
    nextExpectedDeliveryDate?: string | null;
    notes?: string | null;
    items: ReceivePurchaseOrderItemRequest[];
}

export interface GoodsReceiptResultDto {
    goodsReceiptId: string;
    purchaseOrderId: string;
    purchaseOrderNumber: string;
    deliveryStatus: string;
    inventoryProcessingStatus: string;
    nextExpectedDeliveryDate?: string | null;
    message: string;
}

export interface ReceiveAssetDetailRequest {
    serialNumber?: string | null;
    barcode?: string | null;
    description?: string | null;
    location?: string | null;
    condition?: string | null;
}