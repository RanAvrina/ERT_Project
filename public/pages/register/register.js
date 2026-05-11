/**
 * register.js - לוגיקה של עמוד ההרשמה
 */

function initRegisterPage() {
  console.log('Register page initialized');

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}

/**
 * טיפול בהרשמה
 */
async function handleRegister(e) {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const agreeTerms = document.getElementById('agreeTerms').checked;

  clearErrors();

  // אימות
  if (!fullName) {
    setError('fullNameError', 'שם מלא נדרש');
    return;
  }

  if (!isValidEmail(email)) {
    setError('emailError', 'אימייל לא תקין');
    return;
  }

  if (password.length < 8) {
    setError('passwordError', 'סיסמה חייבת להיות לפחות 8 תווים');
    return;
  }

  if (password !== confirmPassword) {
    setError('confirmPasswordError', 'הסיסמות לא תואמות');
    return;
  }

  if (!agreeTerms) {
    setError('agreeTermsError', 'עליך להסכים לתנאי השימוש');
    return;
  }

  try {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'מתחבר...';

    await apiPost('/api/auth/register', {
      fullName,
      email,
      password,
      phone,
    });

    // הפנה להתחברות
    setTimeout(() => {
      window.location.href = './pages/login/login.html';
    }, 500);
  } catch (error) {
    console.error('Registration failed:', error);
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = error.message || 'הרשמה נכשלה';
    errorMessage.style.display = 'block';

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'הרשם';
  }
}

function clearErrors() {
  document.querySelectorAll('.error-text').forEach((el) => {
    el.textContent = '';
  });
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.style.display = 'none';
  }
}

function setError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
  }
}
