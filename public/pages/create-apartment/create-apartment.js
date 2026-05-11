/**
 * create-apartment.js - לוגיקה של עמוד יצירת דירה
 */

function initCreateApartmentPage() {
  console.log('Create apartment page initialized');

  document.getElementById('createApartmentForm')?.addEventListener('submit', handleCreateApartment);
}

async function handleCreateApartment(e) {
  e.preventDefault();

  const address = document.getElementById('address').value;
  const size = document.getElementById('size').value;
  const rooms = document.getElementById('rooms').value;
  const rent = document.getElementById('rent').value;
  const description = document.getElementById('description').value;

  const amenities = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
    .map((cb) => cb.value)
    .filter((v) => v);

  const apartmentData = {
    id: new Date().getTime(),
    address,
    size,
    rooms,
    rent,
    description,
    amenities,
    createdAt: new Date().toISOString(),
  };

  try {
    // שמור בدוגמה ל-localStorage
    saveToStorage('apartment', apartmentData);

    alert('דירה נוצרה בהצלחה!');
    setTimeout(() => {
      window.location.href = './pages/apartment-info/apartment-info.html';
    }, 500);
  } catch (error) {
    console.error('Failed to create apartment:', error);
    alert('שגיאה ביצירת הדירה');
  }
}
