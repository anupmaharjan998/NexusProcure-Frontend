export interface CategoryRequest {
    name: string;
    type?: string;
    riskWeight?: number;
    description?: string;
}


export interface Category {
    id: string;
    name: string;
    type?: string;
    riskWeight?: number;
    description?: string;
}