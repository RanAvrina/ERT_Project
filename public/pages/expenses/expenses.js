/**
 * expenses.js - לוגיקה של עמוד ההוצאות
 */

function initExpensesPage() {
  console.log('Expenses page initialized');

  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const cancelExpense = document.getElementById('cancelExpense');
  const expenseForm = document.getElementById('expenseForm');
  const addExpenseDialog = document.getElementById('addExpenseDialog');

  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => {
      addExpenseDialog.style.display = 'flex';
    });
  }

  if (cancelExpense) {
    cancelExpense.addEventListener('click', () => {
      addExpenseDialog.style.display = 'none';
    });
  }

  if (expenseForm) {
    expenseForm.addEventListener('submit', handleAddExpense);
  }

  loadExpenses();
}

async function handleAddExpense(e) {
  e.preventDefault();

  const amount = document.getElementById('expenseAmount').value;
  const category = document.getElementById('expenseCategory').value;
  const description = document.getElementById('expenseDescription').value;

  try {
    // שמור בדוגמה ל-localStorage
    const expenses = getFromStorage('expenses') || [];
    expenses.push({
      id: new Date().getTime(),
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString(),
    });
    saveToStorage('expenses', expenses);

    // סגור את הדיאלוג
    document.getElementById('addExpenseDialog').style.display = 'none';
    e.target.reset();

    // טען את ההוצאות שוב
    loadExpenses();
  } catch (error) {
    console.error('Failed to add expense:', error);
  }
}

async function loadExpenses() {
  try {
    const expenses = getFromStorage('expenses') || [];
    const expensesList = document.getElementById('expensesList');

    if (expenses.length === 0) {
      expensesList.innerHTML = '<p style="text-align: center; color: #999;">אין הוצאות עדיין</p>';
      return;
    }

    const html = expenses
      .map(
        (exp) => `
      <div class="expense-item">
        <div class="expense-info">
          <div class="expense-category">${exp.category}</div>
          <div class="expense-description">${exp.description || 'ללא תיאור'}</div>
        </div>
        <div class="expense-amount">₪${exp.amount.toFixed(2)}</div>
      </div>
    `,
      )
      .join('');

    expensesList.innerHTML = html;

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('totalExpenses').textContent = `₪${total.toFixed(2)}`;
  } catch (error) {
    console.error('Failed to load expenses:', error);
  }
}
