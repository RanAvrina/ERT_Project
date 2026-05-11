/**
 * apartment-info.js - לוגיקה של עמוד מידע הדירה
 */

function initApartmentInfoPage() {
  console.log('Apartment info page initialized');

  document.getElementById('editApartmentBtn')?.addEventListener('click', () => {
    document.getElementById('editApartmentDialog').style.display = 'flex';
  });

  document.getElementById('cancelEdit')?.addEventListener('click', () => {
    document.getElementById('editApartmentDialog').style.display = 'none';
  });

  document.getElementById('apartmentForm')?.addEventListener('submit', handleSaveApartment);

  loadApartmentInfo();
}

function loadApartmentInfo() {
  const apartment = getFromStorage('apartment') || {
    address: 'תל אביב, רחוב הרצל 42',
    size: 85,
    rooms: 3,
    rent: 3500,
    description: 'דירה מודרנית עם נוף למדינה',
    amenities: ['חניה', 'מעלית', 'גן', 'מטבח מצויד'],
  };

  document.getElementById('apartmentAddress').textContent = apartment.address;
  document.getElementById('apartmentSize').textContent = apartment.size + ' מ"ר';
  document.getElementById('apartmentRooms').textContent = apartment.rooms + ' חדרים';
  document.getElementById('apartmentRent').textContent = '₪' + apartment.rent;
  document.getElementById('apartmentDescription').textContent = apartment.description;

  const amenitiesList = document.getElementById('amenitiesList');
  amenitiesList.innerHTML = apartment.amenities.map((a) => `<li>${a}</li>`).join('');
}

function handleSaveApartment(e) {
  e.preventDefault();

  const apartment = {
    address: document.getElementById('address').value,
    size: document.getElementById('size').value,
    rooms: document.getElementById('rooms').value,
    rent: document.getElementById('rent').value,
    description: (getFromStorage('apartment') || {}).description || '',
    amenities: (getFromStorage('apartment') || {}).amenities || [],
  };

  saveToStorage('apartment', apartment);
  document.getElementById('editApartmentDialog').style.display = 'none';
  loadApartmentInfo();
}
