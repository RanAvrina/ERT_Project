/**
 * join-apartment.js - לוגיקה של עמוד הצטרפות לדירה
 */

function initJoinApartmentPage() {
  console.log('Join apartment page initialized');

  document.getElementById('joinApartmentForm')?.addEventListener('submit', handleJoinApartment);
}

async function handleJoinApartment(e) {
  e.preventDefault();

  const inviteCode = document.getElementById('inviteCode').value.trim();
  const errorEl = document.getElementById('inviteError');

  if (!inviteCode) {
    errorEl.textContent = 'קוד הזמנה נדרש';
    return;
  }

  try {
    const joinBtn = document.getElementById('joinBtn');
    joinBtn.disabled = true;
    joinBtn.textContent = 'מטען...';

    // בדוק את קוד ההזמנה (דוגמה)
    if (inviteCode.startsWith('INVITE-')) {
      // שמור בدוגמה
      saveToStorage('apartmentInvite', inviteCode);
      saveToStorage('userRole', 'tenant');

      alert('הצטרפת לדירה בהצלחה!');
      setTimeout(() => {
        window.location.href = './pages/dashboard/dashboard.html';
      }, 500);
    } else {
      errorEl.textContent = 'קוד הזמנה לא תקין';
      joinBtn.disabled = false;
      joinBtn.textContent = 'הצטרף';
    }
  } catch (error) {
    console.error('Join failed:', error);
    errorEl.textContent = 'שגיאה בהצטרפות';
    const joinBtn = document.getElementById('joinBtn');
    joinBtn.disabled = false;
    joinBtn.textContent = 'הצטרף';
  }
}
