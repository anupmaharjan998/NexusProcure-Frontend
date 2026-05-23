export interface InventoryItemDto {
    id: string;
    sku: string;
    name: string;
    category: string;
    serialNumber?: string | null;
    location?: string | null;
    status: number | string;
    assignedTo?: string | null;
}

