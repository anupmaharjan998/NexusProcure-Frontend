export interface PurchaseOrderItemDto {
    itemName: string
    quantity: number
    unitPrice: number
    taxPercentage:number
}

export interface PurchaseOrderDto {

    id: string

    poNumber: string

    vendorName: string
    vendorEmail?: string | null
    vendorPhoneNumber?: string | null
    vendorAddress?: string | null
    vendorContactPerson?: string | null

    reqNumber?: string | null

    poDate: string
    deliveryDate?: string | null

    status: string
    deliveryStatus: string

    subTotal: number
    vat: number
    totalAmount: number

    items: PurchaseOrderItemDto[]
}

export interface PurchaseOrderListResponseDto {

    totalPOs: number
    totalValue: number
    inTransit: number
    delivered: number

    orders: PurchaseOrderDto[]
}