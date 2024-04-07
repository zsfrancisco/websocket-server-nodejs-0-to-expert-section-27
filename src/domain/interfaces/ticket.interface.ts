export interface Ticket {
    id: string;
    number: number;
    createdAt: Date;
    done: boolean;
    handleAtDesk?: string; // Desk 1
    handleAt?: Date;
}