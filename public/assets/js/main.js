/**
 * main.js - קובץ ראשי שמחבר את כל העמודים
 * 
 * מטרה: טעינה דינמית של עמודים וניהול ניווט
 */

// ====== GLOBAL UTILITIES ======

/**
 * טוען עמוד חדש
 * @param {string} pagePath - נתיב קובץ ה-HTML של העמוד
 */
async function loadPage(pagePath) {
  try {
    const response = await fetch(pagePath);
    if (!response.ok) throw new Error(`Failed to load page: ${pagePath}`);
    
    const html = await response.text();
    const rootElement = document.getElementById('root');
    
    if (rootElement) {
      rootElement.innerHTML = html;
      
      // קרא לפונקציית ה-init של העמוד אם קיימת
      const pageNameMatch = pagePath.match(/\/([^\/]+)\/\1\.html$/);
      if (pageNameMatch) {
        const pageName = pageNameMatch[1];
        
        // טעין את CSS קബצ העמוד
        loadPageCSS(pageName);
        
        // טעין את JS קבצ העמוד
        loadPageJS(pageName, () => {
          // קרא לפונקציית ה-init לאחר טעינת ה-JS
          const initFunctionName = `init${convertPageNameToFunctionName(pageName)}Page`;
          
          if (typeof window[initFunctionName] === 'function') {
            window[initFunctionName]();
          }
        });
      }
    }
  } catch (error) {
    console.error('Error loading page:', error);
    document.getElementById('root').innerHTML = '<p>שגיאה בטעינת העמוד</p>';
  }
}

/**
 * טוען קובץ CSS של עמוד
 * @param {string} pageName - שם העמוד
 */
function loadPageCSS(pageName) {
  const cssPath = `./pages/${pageName}/${pageName}.css`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssPath;
  link.id = `css-${pageName}`;
  
  // הסר CSS קדום אם קיים
  const oldLink = document.getElementById(`css-${pageName}`);
  if (oldLink) oldLink.remove();
  
  document.head.appendChild(link);
}

/**
 * טוען קובץ JS של עמוד
 * @param {string} pageName - שם העמוד
 * @param {Function} callback - קולבק להרצה אחרי טעינה
 */
function loadPageJS(pageName, callback) {
  const jsPath = `./pages/${pageName}/${pageName}.js`;
  const script = document.createElement('script');
  script.src = jsPath;
  script.id = `js-${pageName}`;
  script.onload = callback;
  script.onerror = () => {
    console.error(`Failed to load script: ${jsPath}`);
    if (callback) callback();
  };
  
  // הסר JS קדום אם קיים
  const oldScript = document.getElementById(`js-${pageName}`);
  if (oldScript) oldScript.remove();
  
  document.body.appendChild(script);
}

/**
 * המר שם עמוד לשם פונקציה
 * "apartment-info" -> "ApartmentInfo"
 * @param {string} pageName - שם העמוד
 * @returns {string} שם הפונקציה
 */
function convertPageNameToFunctionName(pageName) {
  return pageName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * הופך מילה לאותיות גדולות בתחילה
 * @param {string} str - המילה
 * @returns {string}
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * שמירת ערך ב-LocalStorage
 * @param {string} key - המפתח
 * @param {*} value - הערך
 */
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * קריאת ערך מ-LocalStorage
 * @param {string} key - המפתח
 * @returns {*}
 */
function getFromStorage(key) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

/**
 * מחיקת ערך מ-LocalStorage
 * @param {string} key - המפתח
 */
function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// ====== EVENT LISTENERS ======

document.addEventListener('DOMContentLoaded', () => {
  console.log('Main app initialized');
  
  // הוסף event listeners לכל הלינקים בניווט
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      
      // טען את העמוד
      loadPage(href);
      
      // סמן את הלינק הפעיל
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
});

// ====== API HELPER FUNCTIONS ======

/**
 * בצע בקשת GET
 * @param {string} url - ה-URL
 * @returns {Promise<Object>}
 */
async function apiGet(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('GET Error:', error);
    throw error;
  }
}

/**
 * בצע בקשת POST
 * @param {string} url - ה-URL
 * @param {Object} data - הנתונים
 * @returns {Promise<Object>}
 */
async function apiPost(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('POST Error:', error);
    throw error;
  }
}

/**
 * בצע בקשת PUT
 * @param {string} url - ה-URL
 * @param {Object} data - הנתונים
 * @returns {Promise<Object>}
 */
async function apiPut(url, data) {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('PUT Error:', error);
    throw error;
  }
}

/**
 * בצע בקשת DELETE
 * @param {string} url - ה-URL
 * @returns {Promise<Object>}
 */
async function apiDelete(url) {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('DELETE Error:', error);
    throw error;
  }
}

// ====== VALIDATION HELPERS ======

/**
 * בדוק אם אימייל תקין
 * @param {string} email - האימייל
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * בדוק אם סיסמה חזקה
 * @param {string} password - הסיסמה
 * @returns {boolean}
 */
function isStrongPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

console.log('Global utilities loaded');
