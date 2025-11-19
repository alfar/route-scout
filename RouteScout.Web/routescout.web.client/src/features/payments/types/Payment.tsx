export interface Payment {
    id: string;
    csvLineHash: string;
    message: string;
    amount: number;
    timestamp: string;
    confirmed: boolean;
    rejected: boolean;
    originalId: string;
}
