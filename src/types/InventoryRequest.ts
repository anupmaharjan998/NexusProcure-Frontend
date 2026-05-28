export type RequestPriority = 1 | 2 | 3 | 4;

export interface CreateInventoryRequestItemRequest {
    stockId: string;
    quantity: number;
}

export interface CreateInventoryRequestRequest {
    purpose: string;
    priority: RequestPriority;
    items: CreateInventoryRequestItemRequest[];
}

export interface InventoryRequestSummary {
    id: string;
    requestedBy: string;
    department: string;
    purpose: string;
    priority: string;
    status: string;
    totalItems: number;
    itemNames?: string | null;
    createdAt: string;
}

export interface InventoryRequest {
    id: string;
    requestedById: string;
    requestedBy: string;
    department: string;
    purpose: string;
    priority: string;
    status: string;
    remarks?: string | null;
    createdAt: string;
    items: InventoryRequestItem[];
}

export interface InventoryRequestItem {
    id: string;
    stockId: string;
    stockName: string;
    categoryName: string;
    quantityRequested: number;
    quantityIssued: number;
    quantityAvailable: number;
    isAssetTracked: boolean;
    issuedItems: IssuedInventoryItem[];
}

export interface IssuedInventoryItem {
    inventoryItemId: string;
    sku: string;
    barcode: string;
    serialNumber: string;
}

export interface AvailableInventoryItem {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    serialNumber: string;
    status: string;
}

export interface ProcessInventoryRequestRequest {
    items: ProcessInventoryRequestItemRequest[];
}

export interface ProcessInventoryRequestItemRequest {
    inventoryRequestItemId: string;
    inventoryItemIds: string[];
}

export interface RejectInventoryRequestRequest {
    remarks?: string;
}

export interface MyAssignedInventoryItem {
    id: string;
    itemName: string;
    categoryName?: string | null;
    serialNumber?: string | null;
    department: string;
    barcode?: string | null;
    location?: string | null;
    condition?: string | null;
    assignedAt?: string | null;
}

export interface MyAssignedInventoryItemDetail {
    id: string;
    itemName: string;
    categoryName?: string | null;
    sku?: string | null;
    barcode?: string | null;
    serialNumber?: string | null;
    department?: string | null;
    assignedTo?: string | null;
    location?: string | null;
    condition?: string | null;
    status?: string | null;
    assignedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}