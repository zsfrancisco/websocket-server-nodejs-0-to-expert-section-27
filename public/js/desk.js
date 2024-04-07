// HTML references
const lblPending = document.querySelector('#lbl-pending');
const deskHeader = document.querySelector('h1');
const noMoreAlert = document.querySelector('.alert');
const lblCurrentTicket = document.querySelector('small');

const btnDraw = document.querySelector('#btn-draw');
const btnDone = document.querySelector('#btn-done');

const searchParams = new URLSearchParams(window.location.search);
if (!searchParams.has('escritorio')) {
    window.location = 'index.html';
    throw new Error('Desk is mandatory');
}

const deskNumber = searchParams.get('escritorio');
let workingTicket = null;
deskHeader.innerText = deskNumber;

function checkTicketCount(currentCount = 0) {
    console.log(currentCount);
    if (currentCount > 0) {
        noMoreAlert.classList.add('d-none');
    } else {
        noMoreAlert.classList.remove('d-none');
    }
    lblPending.innerHTML = currentCount;
}

async function loadInitialCount() {
    const pendingTickets = await fetch('/api/ticket/pending').then(res => res.json());
    checkTicketCount(pendingTickets.length);
}

async function getTicket() {
    const {status, ticket, message} = await fetch(`/api/ticket/draw/${deskNumber}`).then(res => res.json());
    if (status === 'error') {
        lblCurrentTicket.innerText = message;
        return;
    }

    workingTicket = ticket;
    lblCurrentTicket.innerText = ticket.number;
}

async function finishTicket() {
    if (!workingTicket) {
        lblCurrentTicket.innerText = 'Nadie';
        return;
    }
    const {status, message} = await fetch(`/api/ticket/done/${workingTicket.id}`, {
        method: 'PUT',
    }).then(res => res.json())
    if (status === 'ok') {
        workingTicket = null;
        lblCurrentTicket.innerText = 'Nadie';
    }
}

function connectToWebSockets() {

    const socket = new WebSocket('ws://localhost:3000/ws');

    socket.onmessage = (event) => {
        //console.log(event.data); // on-ticket-count-changed
        const parsed = JSON.parse(event.data);
        const {type, payload} = parsed;
        if (type !== 'on-ticket-count-changed') return;
        checkTicketCount(payload);
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

btnDraw.addEventListener('click', getTicket);
btnDone.addEventListener('click', finishTicket);

loadInitialCount();
connectToWebSockets();