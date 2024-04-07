function renderTickets(tickets = []) {
    for (let i = 0; i < tickets.length; i++) {
        if (i > 4) break;
        const ticket = tickets[i];
        if (!ticket) continue;

        const lblTicket = document.querySelector(`#lbl-ticket-0${i + 1}`);
        const lblDesk = document.querySelector(`#lbl-desk-0${i + 1}`);

        lblTicket.innerText = `Ticket ${ticket.number}`;
        lblDesk.innerText = ticket.handleAtDesk;
    }
}

async function loadCurrentTickets() {
    const tickets = await fetch('/api/ticket/working-on').then(res => res.json());
    renderTickets(tickets);
}

function connectToWebSockets() {

    const socket = new WebSocket('ws://localhost:3000/ws');

    socket.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        const {type, payload} = parsed;

        if (type !== 'on-working-on-changed') return;

        renderTickets(payload);
    };

    socket.onclose = (event) => {
        console.log('Connection closed');
        setTimeout(() => {
            console.log('retrying to connect');
            connectToWebSockets();
        }, 1500);

    };

    socket.onopen = (event) => {
        console.log('Connected');
    };

}


loadCurrentTickets();
connectToWebSockets();
