export interface InventoryCategoryDto {
    id: string;
    name: string;
    categoryCode: string;
    description?: string | null;
    riskWeight: number;
    isAssetTracked: boolean;
    totalItems: number;
    subCategories: InventoryCategoryDto[];
}