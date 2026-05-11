/**
 * roommates.js - לוגיקה של עמוד שותפים
 */

function initRoommatesPage() {
  console.log('Roommates page initialized');

  document.getElementById('generateInviteBtn')?.addEventListener('click', generateInviteCode);
  loadRoommates();
}

function generateInviteCode() {
  const code = 'INVITE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const input = document.getElementById('inviteCode');
  input.value = code;
  input.select();
  document.execCommand('copy');
  alert('קוד ההזמנה הועתק!');
}

function loadRoommates() {
  const roommates = [
    { name: 'דוד כהן', email: 'david@example.com', role: 'משכיר' },
    { name: 'רים שוורץ', email: 'rim@example.com', role: 'שותף' },
    { name: 'ניר לוי', email: 'nir@example.com', role: 'שותף' },
  ];

  const list = document.getElementById('roommatesList');
  list.innerHTML = roommates
    .map(
      (r) => `
    <div class="roommate-card">
      <div class="roommate-avatar">${r.name.charAt(0)}</div>
      <div class="roommate-name">${r.name}</div>
      <div class="roommate-email">${r.email}</div>
      <div class="roommate-role">${r.role}</div>
    </div>
  `,
    )
    .join('');
}
