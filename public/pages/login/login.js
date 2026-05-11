/**
 * login.js - לוגיקה של עמוד התחברות
 * 
 * מטרה: טיפול בטפסי התחברות, אימות נתונים, וטיפול בשגיאות
 */

/**
 * אתחול עמוד ההתחברות
 * קורא כאשר הדף נטען
 */
function initLoginPage() {
  console.log('Login page initialized');

  const loginForm = document.getElementById('loginForm');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const resetDialog = document.getElementById('resetDialog');
  const resetForm = document.getElementById('resetForm');
  const cancelReset = document.getElementById('cancelReset');

  // התחברות
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // שכחתי סיסמה
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      openResetDialog();
    });
  }

  // ביטול איפוס סיסמה
  if (cancelReset) {
    cancelReset.addEventListener('click', closeResetDialog);
  }

  // שליחת טופס איפוס סיסמה
  if (resetForm) {
    resetForm.addEventListener('submit', handleResetPassword);
  }

  // טעינת נתונים אם ישנם
  loadSavedEmail();
}

/**
 * טיפול בהתחברות
 * @param {Event} e - ה-event של הטופס
 */
async function handleLogin(e) {
  e.preventDefault();

  // קבלת הערכים
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const rememberMe = document.getElementById('rememberMe').checked;

  // אפס שגיאות
  clearErrors();

  // אימות
  const isValid = validateLoginForm(email, password);
  if (!isValid) return;

  try {
    // הצג loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'מתחבר...';

    // בצע בקשה להתחברות (דוגמה)
    const response = await apiPost('/api/auth/login', { email, password });

    // שמור את ה-token
    saveToStorage('authToken', response.token);
    saveToStorage('user', response.user);

    // זכור את האימייל
    if (rememberMe) {
      saveToStorage('rememberedEmail', email);
    } else {
      removeFromStorage('rememberedEmail');
    }

    // הפנה לדשבורד
    setTimeout(() => {
      window.location.href = './pages/dashboard/dashboard.html';
    }, 500);
  } catch (error) {
    console.error('Login failed:', error);
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = error.message || 'התחברות נכשלה. בדוק את הפרטים שלך.';
    errorMessage.style.display = 'block';

    // החזר את הכפתור
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'התחבר';
  }
}

/**
 * אימות טופס התחברות
 * @param {string} email - האימייל
 * @param {string} password - הסיסמה
 * @returns {boolean}
 */
function validateLoginForm(email, password) {
  let isValid = true;

  // בדוק אימייל
  if (!email) {
    setError('emailError', 'אימייל נדרש');
    isValid = false;
  } else if (!isValidEmail(email)) {
    setError('emailError', 'אימייל לא תקין');
    isValid = false;
  }

  // בדוק סיסמה
  if (!password) {
    setError('passwordError', 'סיסמה נדרשת');
    isValid = false;
  } else if (password.length < 6) {
    setError('passwordError', 'סיסמה חייבת להיות לפחות 6 תווים');
    isValid = false;
  }

  return isValid;
}

/**
 * הצגת הודעת שגיאה
 * @param {string} elementId - ה-ID של אלמנט ההודעה
 * @param {string} message - ההודעה
 */
function setError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
  }
}

/**
 * ניקוי כל הודעות השגיאה
 */
function clearErrors() {
  const errorElements = document.querySelectorAll('.error-text, #errorMessage');
  errorElements.forEach((el) => {
    if (el.id === 'errorMessage') {
      el.style.display = 'none';
      el.textContent = '';
    } else {
      el.textContent = '';
    }
  });
}

/**
 * פתיחת דיאלוג איפוס סיסמה
 */
function openResetDialog() {
  const resetDialog = document.getElementById('resetDialog');
  if (resetDialog) {
    resetDialog.style.display = 'flex';
  }
}

/**
 * סגירת דיאלוג איפוס סיסמה
 */
function closeResetDialog() {
  const resetDialog = document.getElementById('resetDialog');
  if (resetDialog) {
    resetDialog.style.display = 'none';
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
      resetForm.reset();
    }
    const resetMessage = document.getElementById('resetMessage');
    if (resetMessage) {
      resetMessage.textContent = '';
      resetMessage.className = 'reset-message';
    }
  }
}

/**
 * טיפול בבקשת איפוס סיסמה
 * @param {Event} e - ה-event של הטופס
 */
async function handleResetPassword(e) {
  e.preventDefault();

  const resetEmail = document.getElementById('resetEmail').value.trim();
  const resetMessage = document.getElementById('resetMessage');

  if (!resetEmail) {
    resetMessage.textContent = 'אימייל נדרש';
    resetMessage.className = 'reset-message error';
    return;
  }

  if (!isValidEmail(resetEmail)) {
    resetMessage.textContent = 'אימייל לא תקין';
    resetMessage.className = 'reset-message error';
    return;
  }

  try {
    // בצע בקשה להשלחת אימייל לאיפוס סיסמה (דוגמה)
    await apiPost('/api/auth/reset-password', { email: resetEmail });

    resetMessage.textContent = 'לינק לאיפוס הסיסמה נשלח לאימייל שלך';
    resetMessage.className = 'reset-message success';

    // סגור את הדיאלוג אחרי 3 שניות
    setTimeout(closeResetDialog, 3000);
  } catch (error) {
    console.error('Reset password failed:', error);
    resetMessage.textContent = error.message || 'שגיאה בהשלחת בקשת איפוס הסיסמה';
    resetMessage.className = 'reset-message error';
  }
}

/**
 * טעינת אימייל שנשמר (אם הוקליד "זכור אותי")
 */
function loadSavedEmail() {
  const rememberedEmail = getFromStorage('rememberedEmail');
  if (rememberedEmail) {
    const emailInput = document.getElementById('email');
    const rememberMe = document.getElementById('rememberMe');

    if (emailInput) {
      emailInput.value = rememberedEmail;
    }
    if (rememberMe) {
      rememberMe.checked = true;
    }
  }
}

// בדוק אם המשתמש כבר מחובר
const authToken = getFromStorage('authToken');
if (authToken) {
  // הפנה לדשבורד
  window.location.href = './pages/dashboard/dashboard.html';
}
