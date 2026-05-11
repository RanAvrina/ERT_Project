/**
 * tickets.js - לוגיקה של עמוד כרטיסים
 */

function initTicketsPage() {
  console.log('Tickets page initialized');

  document.getElementById('addTicketBtn')?.addEventListener('click', () => {
    document.getElementById('addTicketDialog').style.display = 'flex';
  });

  document.getElementById('cancelTicket')?.addEventListener('click', () => {
    document.getElementById('addTicketDialog').style.display = 'none';
  });

  document.getElementById('ticketForm')?.addEventListener('submit', handleAddTicket);

  loadTickets();
}

function handleAddTicket(e) {
  e.preventDefault();

  const title = document.getElementById('ticketTitle').value;
  const description = document.getElementById('ticketDescription').value;
  const priority = document.getElementById('ticketPriority').value;

  const tickets = getFromStorage('tickets') || [];
  tickets.push({
    id: new Date().getTime(),
    title,
    description,
    priority,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
  saveToStorage('tickets', tickets);

  document.getElementById('addTicketDialog').style.display = 'none';
  e.target.reset();
  loadTickets();
}

function loadTickets() {
  const tickets = getFromStorage('tickets') || [];
  const list = document.getElementById('ticketsList');

  if (tickets.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #999;">אין כרטיסים עדיין</p>';
    return;
  }

  list.innerHTML = tickets
    .map(
      (t) => `
    <div class="ticket-card">
      <div class="ticket-header">
        <div class="ticket-title">#${t.id} - ${t.title}</div>
        <span class="ticket-status ${t.status}">${t.status}</span>
      </div>
      <p style="color: #666; margin-bottom: 0.75rem;">${t.description}</p>
      <div class="ticket-meta">
        <span>עדיפות: ${t.priority}</span>
        <span>${new Date(t.createdAt).toLocaleDateString('he-IL')}</span>
      </div>
    </div>
  `,
    )
    .join('');
}
