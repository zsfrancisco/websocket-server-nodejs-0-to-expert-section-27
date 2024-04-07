const currentTicketLbl = document.querySelector('span');
const createTicketBtn = document.querySelector('button');

async function getLastTicket() {
    currentTicketLbl.innerText = await fetch('/api/ticket/last').then(res => res.json());
}

async function createTicket() {
    const newTicket = await fetch('/api/ticket', {
        method: 'POST',
    }).then(res => res.json());

    currentTicketLbl.innerText = newTicket.number;
}

createTicketBtn.addEventListener('click', createTicket);

getLastTicket();