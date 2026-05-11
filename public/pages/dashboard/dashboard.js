/**
 * dashboard.js - לוגיקה של עמוד הדשבורד
 */

function initDashboardPage() {
  console.log('Dashboard page initialized');

  // טען נתונים מ-localStorage או מ-API
  loadDashboardData();

  // טען פעילויות אחרונות
  loadRecentActivities();

  // סט עדכון כל 30 שניות
  setInterval(loadDashboardData, 30000);
}

/**
 * טעינת נתוני הדשבורד
 */
async function loadDashboardData() {
  try {
    const user = getFromStorage('user');
    const userInfo = document.getElementById('userInfo');

    if (user && userInfo) {
      userInfo.innerHTML = `<h2>ברוכים הבאים, ${user.fullName}!</h2>`;
    }

    // טען נתונים מ-API (דוגמה)
    // const data = await apiGet('/api/dashboard');
    // עדכן את הנתונים בדף

    // במקום זאת, השתמש בנתונים מקומיים (דוגמה)
    document.getElementById('expensesCount').textContent = '₪1,250';
    document.getElementById('tasksCount').textContent = '3';
    document.getElementById('balanceAmount').textContent = '₪-450';
    document.getElementById('ticketsCount').textContent = '2';
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

/**
 * טעינת פעילויות אחרונות
 */
async function loadRecentActivities() {
  try {
    const activities = [
      'עודכנה הוצאה של ₪150 ל"חשמל"',
      'נוצרה משימה חדשה: "לקנות חלב"',
      'ָתְלּ שום שילם ₪500 עבור דירה',
      'עדכנה רים את רשימת הקניות',
    ];

    const activitiesList = document.getElementById('activitiesList');
    if (activitiesList) {
      activitiesList.innerHTML = activities
        .map((activity) => `<li>${activity}</li>`)
        .join('');
    }
  } catch (error) {
    console.error('Failed to load activities:', error);
  }
}
