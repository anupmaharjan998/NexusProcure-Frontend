import {InventoryItemDto} from "@/types/InventoryItemDto.ts";

export interface InventoryItemDetailDto extends InventoryItemDto {
    barcode: string;
    categoryId: string;
    condition: number | string;
    assignedDate?: string | null;
    description?: string | null;
    createdAt: string;
    assignmentHistory: InventoryAssignmentHistoryDto[];
}

export interface InventoryAssignmentHistoryDto {
    userName?: string | null;
    assignedDate: string;
    returnedDate?: string | null;
}