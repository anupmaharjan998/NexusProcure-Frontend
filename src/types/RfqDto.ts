export interface RfqDto {
    id: string;
    rfqNumber: string;
    CreatedAt: Date;
    SubmissionDeadline: Date;
    TotalQuotationsRecieved: number;
    status: number | string;
}



