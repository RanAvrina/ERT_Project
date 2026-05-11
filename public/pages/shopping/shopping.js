/**
 * shopping.js - לוגיקה של עמוד קניות
 */

function initShoppingPage() {
  console.log('Shopping page initialized');

  document.getElementById('addItemBtn')?.addEventListener('click', () => {
    document.getElementById('addItemDialog').style.display = 'flex';
  });

  document.getElementById('cancelItem')?.addEventListener('click', () => {
    document.getElementById('addItemDialog').style.display = 'none';
  });

  document.getElementById('itemForm')?.addEventListener('submit', handleAddItem);

  loadShoppingList();
}

function handleAddItem(e) {
  e.preventDefault();

  const name = document.getElementById('itemName').value;
  const quantity = document.getElementById('itemQuantity').value || 1;

  const items = getFromStorage('shoppingList') || [];
  items.push({
    id: new Date().getTime(),
    name,
    quantity,
    completed: false,
  });
  saveToStorage('shoppingList', items);

  document.getElementById('addItemDialog').style.display = 'none';
  e.target.reset();
  loadShoppingList();
}

function loadShoppingList() {
  const items = getFromStorage('shoppingList') || [];
  const list = document.getElementById('shoppingList');

  if (items.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #999;">רשימה ריקה</p>';
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
    <div class="shopping-item">
      <input type="checkbox" ${item.completed ? 'checked' : ''} />
      <span class="shopping-item-text ${item.completed ? 'completed' : ''}">
        ${item.name}
      </span>
      <span class="shopping-item-quantity">x${item.quantity}</span>
    </div>
  `,
    )
    .join('');
}
