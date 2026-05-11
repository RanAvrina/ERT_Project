/**
 * apartment.js - לוגיקה של עמוד ניהול הדירה
 */

function initApartmentPage() {
  console.log('Apartment page initialized');

  // בדוק אם המשתמש רשום לדירה
  const apartment = getFromStorage('apartment');
  if (!apartment) {
    alert('אתה צריך להצטרף או ליצור דירה קודם');
    window.location.href = './pages/join-apartment/join-apartment.html';
  }
}
