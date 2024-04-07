import {Ticket} from "../../domain/interfaces/ticket.interface";
import {UuidAdapter} from "../../config/uuid.adapter";
import {WssService} from "./wss.service";

export class TicketService {
    constructor(
        private readonly wssService = WssService.instance,
    ) {
    }

    public tickets: Ticket[] = [
        {id: UuidAdapter.v4(), number: 1, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 2, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 3, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 4, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 5, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 6, createdAt: new Date(), done: false},
    ];
    private readonly workingOnTickets: Ticket[] = [];

    public get pendingTickets(): Ticket[] {
        return this.tickets.filter(ticket => !ticket.handleAtDesk);
    }

    public get lastWorkingOnTickets(): Ticket[] {
        return this.workingOnTickets.slice(0, 4);
    }

    public get lastTicketNumber(): number {
        return this.tickets.length > 0 ? this.tickets.at(-1.)!.number : 0;
    }

    public createTicket(): Ticket {
        const ticket: Ticket = {
            id: UuidAdapter.v4(),
            number: this.lastTicketNumber + 1,
            createdAt: new Date(),
            done: false
        };
        this.tickets.push(ticket);
        this.onTicketNumberChange();
        return ticket;
    }

    public drawTicket(desk: string) {
        const ticket = this.tickets.find(t => !t.handleAtDesk);
        if (!ticket) {
            return {
                status: ' error',
                message: 'There are no pending tickets'
            }
        }
        ticket.handleAtDesk = desk;
        ticket.handleAt = new Date();

        this.workingOnTickets.unshift({...ticket});
        this.onTicketNumberChange();
        this.onWorkingOnChange();

        return {
            status: 'ok',
            ticket
        };
    }

    public onFinishedTicket(ticketId: string) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) {
            return {
                status: 'error',
                message: 'Ticket not found'
            }
        }
        this.tickets = this.tickets.map(t => {
            if (ticket.id === ticketId) {
                ticket.done = true;
            }
            return ticket;
        });

        return {
            status: 'ok',
            ticket
        };
    }

    private onTicketNumberChange() {
        this.wssService.sendMessage('on-ticket-count-changed', this.pendingTickets.length);
    }

    private onWorkingOnChange() {
        this.wssService.sendMessage('on-working-on-changed', this.lastWorkingOnTickets);
    }
}