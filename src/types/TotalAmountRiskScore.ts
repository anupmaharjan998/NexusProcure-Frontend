export interface TotalAmountRiskScore {
    id: string;
    minAmount: number;
    maxAmount: number;
    riskPoints: number;
    isActive: boolean;
}

export interface TotalAmountRiskScoreRequest {
    minAmount: number;
    maxAmount: number;
    riskPoints: number;
    isActive: boolean;
}