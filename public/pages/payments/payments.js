/**
 * payments.js - לוגיקה של עמוד תשלומים
 */

function initPaymentsPage() {
  console.log('Payments page initialized');

  document.getElementById('recordPaymentBtn')?.addEventListener('click', () => {
    document.getElementById('recordPaymentDialog').style.display = 'flex';
  });

  document.getElementById('cancelPayment')?.addEventListener('click', () => {
    document.getElementById('recordPaymentDialog').style.display = 'none';
  });

  document.getElementById('paymentForm')?.addEventListener('submit', handleRecordPayment);

  loadPayments();
}

function handleRecordPayment(e) {
  e.preventDefault();

  const amount = document.getElementById('paymentAmount').value;
  const from = document.getElementById('paymentFrom').value;
  const to = document.getElementById('paymentTo').value;

  const payments = getFromStorage('payments') || [];
  payments.push({
    id: new Date().getTime(),
    amount: parseFloat(amount),
    from,
    to,
    date: new Date().toISOString(),
  });
  saveToStorage('payments', payments);

  document.getElementById('recordPaymentDialog').style.display = 'none';
  e.target.reset();
  loadPayments();
}

function loadPayments() {
  const payments = getFromStorage('payments') || [];
  const list = document.getElementById('paymentsList');

  if (payments.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #999;">אין תשלומים עדיין</p>';
    return;
  }

  list.innerHTML = payments
    .map(
      (p) => `
    <div class="payment-item">
      <div class="payment-info">
        <div class="payment-from-to">${p.from} → ${p.to}</div>
        <div class="payment-date">${new Date(p.date).toLocaleDateString('he-IL')}</div>
      </div>
      <div class="payment-amount">₪${p.amount.toFixed(2)}</div>
    </div>
  `,
    )
    .join('');

  // חשב יתרות
  const balance = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  document.getElementById('totalBalance').textContent = `₪${balance.toFixed(2)}`;
}
