# ERT - ניהול דירת שותפים
## הנחיות בנייה של הפרוייקט HTML/CSS/JS

### 📁 מבנה התיקיות המוסדר

```
public/
├── index.html                      # דף הבית הראשי
├── assets/
│   ├── css/
│   │   └── main.css               # CSS עולמי לכל הדף
│   ├── js/
│   │   └── main.js                # JS ראשי - כלים ופונקציות משותפות
│   └── images/
│       └── (תמונות יישום)
│
└── pages/                          # כל עמוד בתיקייה נפרדת
    ├── login/
    │   ├── login.html             # HTML של דף התחברות
    │   ├── login.css              # סטיילים של דף התחברות
    │   └── login.js               # לוגיקה של דף התחברות
    │
    ├── register/
    │   ├── register.html
    │   ├── register.css
    │   └── register.js
    │
    ├── dashboard/
    │   ├── dashboard.html
    │   ├── dashboard.css
    │   └── dashboard.js
    │
    ├── expenses/
    │   ├── expenses.html
    │   ├── expenses.css
    │   └── expenses.js
    │
    ├── tasks/
    │   ├── tasks.html
    │   ├── tasks.css
    │   └── tasks.js
    │
    ├── shopping/
    │   ├── shopping.html
    │   ├── shopping.css
    │   └── shopping.js
    │
    ├── roommates/
    │   ├── roommates.html
    │   ├── roommates.css
    │   └── roommates.js
    │
    ├── payments/
    │   ├── payments.html
    │   ├── payments.css
    │   └── payments.js
    │
    ├── tickets/
    │   ├── tickets.html
    │   ├── tickets.css
    │   └── tickets.js
    │
    ├── apartment/
    │   ├── apartment.html
    │   ├── apartment.css
    │   └── apartment.js
    │
    ├── apartment-info/
    │   ├── apartment-info.html
    │   ├── apartment-info.css
    │   └── apartment-info.js
    │
    ├── create-apartment/
    │   ├── create-apartment.html
    │   ├── create-apartment.css
    │   └── create-apartment.js
    │
    └── join-apartment/
        ├── join-apartment.html
        ├── join-apartment.css
        └── join-apartment.js
```

---

## 🎯 מטרת כל קובץ

### 📄 HTML Files (קבצי תוכן)
- **מטרה**: מרכז המבנה וההתאומה של הדף
- **מכיל**: טפסים, קלט משתמש, תצוגת נתונים
- **דוגמה**: `login.html` מכיל טופס התחברות

### 🎨 CSS Files (קבצי עיצוב)
- **מטרה**: עיצוב וסגנונות של הדף
- **מכיל**: צבעים, תמרורים, responsive design
- **דוגמה**: `login.css` עוצב את דף התחברות

### ⚙️ JS Files (קבצי לוגיקה)
- **מטרה**: בקרה על התנהגות הדף
- **מכיל**: מטפלים אירועים, בקשות API, תקשורת עם localStorage
- **דוגמה**: `login.js` מטפל בהתחברות וברגזור פרטים

---

## 🚀 איך להתחיל

### 1. פתיחת הדף הראשי
```
open public/index.html
```

### 2. ניווט בין עמודים
- כל הלינקים בתפריט הניווט מוביל לדפים שונים
- הניווט אוטומטי טוען את הדף המתאים

### 3. הוספת עמוד חדש
1. צור תיקייה חדשה ב-`pages/[page-name]/`
2. צור שלושה קבצים:
   - `[page-name].html`
   - `[page-name].css`
   - `[page-name].js`
3. הוסף קישור בתפריט הניווט ב-`index.html`

---

## 📚 קבצים משותפים

### `main.css` - סטיילים עולמיים
מכיל:
- משתנים צבעים (`:root`)
- רכיבים זולי שימוש חוזר (כפתורים, קלט, קלפים)
- עיצוב תפריט הניווט
- עיצוב responsive

### `main.js` - פונקציות עולמיות
מכיל:
- טעינה דינמית של דפים
- שמירתקריאה מ-localStorage
- בקשות API (GET, POST, PUT, DELETE)
- בדיקות תקינות (אימייל, סיסמה)

---

## 💾 אחסון נתונים

### localStorage
נתונים מאוחסנים בכלי האחסון המקומי של הדפדפן:
```javascript
// שמור
saveToStorage('key', value);

// קרא
const value = getFromStorage('key');

// מחק
removeFromStorage('key');
```

### דוגמה של מבנה נתונים
```javascript
// משתמש
{
  id: 123,
  email: 'user@example.com',
  fullName: 'דוד כהן'
}

// הוצאה
{
  id: 456,
  amount: 150,
  category: 'rent',
  date: '2024-01-15'
}
```

---

## 🎨 מבנה הדף (HTML Pattern)

כל עמוד עוקב אחרי דפוס זה:

```html
<!-- [PAGE NAME] -->

<div class="container page-container">
  <h1 class="page-title">כותרת הדף</h1>
  
  <!-- תוכן ספציפי לעמוד -->
  
</div>

<!-- דיאלוגים/modal windows -->
<div class="dialog-overlay" id="dialogName" style="display: none;">
  <!-- טופס או תוכן -->
</div>
```

---

## ⚙️ מבנה ה-JS (JS Pattern)

כל קובץ JS עוקב אחרי דפוס זה:

```javascript
/**
 * pageName.js - תיאור של העמוד
 */

// 1. אתחול כשהעמוד נטען
function initPageNamePage() {
  console.log('Page initialized');
  
  // הוסף event listeners
  // טען נתונים ראשוניים
}

// 2. מטפלים אירועים
function handleEventName(e) {
  e.preventDefault();
  // טיפול בלוגיקה
}

// 3. פונקציות עזר
function helperFunction() {
  // עזר עבור הדף
}
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 480px
- **Tablet**: < 768px
- **Desktop**: 768px+

### דוגמה
```css
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔐 קבצים נפרדים = ארגון ברור

### יתרונות
```
✓ קל למצוא קוד מסוים
✓ קל לתחזוק וללמוד
✓ אפשר לעבוד עלי' כמה קבצים בו-זמנית
✓ כל קובץ עושה משימה אחת בלבד
```

### מבנה המנהיר
```
כל אחד יודע מיד:
- HTML = מה מוצג
- CSS = איך זה נראה
- JS = למה זה עובד
```

---

## 🛠️ עיצוח טיפים

### צבעים שימושיים
```css
--primary-color: #2EC4B6      /* צבע ראשי */
--secondary-color: #FF6B6B    /* צבע משני */
--success-color: #51CF66      /* ירוק - הצלחה */
--danger-color: #FF6B6B       /* אדום - שגיאה */
--warning-color: #FFD93D      /* צהוב - אזהרה */
```

### רכיבים זולים שימוש חוזר
```html
<!-- כפתור -->
<button class="button button-primary">לחץ</button>

<!-- קלף -->
<div class="card">תוכן</div>

<!-- טופס -->
<div class="form-group">
  <label for="input">תיוג</label>
  <input type="text" id="input" />
</div>
```

---

## 📝 הערות חשובות

1. **כל קובץ HTML חייב לראות:**
   ```html
   <link rel="stylesheet" href="./[pagename].css" />
   <script src="./[pagename].js"></script>
   ```

2. **כל קובץ JS חייב לתחילו:**
   ```javascript
   function initPageNamePage() {
     console.log('Page initialized');
   }
   ```

3. **שמור את ה-RTL כיוון:**
   ```html
   <html dir="rtl" lang="he">
   ```

---

## ✅ Checklist לתוספת עמוד חדש

- [ ] יצור תיקייה חדשה ב-`pages/`
- [ ] צור `pagename.html` עם תוכן
- [ ] צור `pagename.css` עם סגנונות
- [ ] צור `pagename.js` עם לוגיקה
- [ ] הוסף קישור ב-`index.html`
- [ ] בדוק שהדף ניתן לטעינה
- [ ] בדוק responsive design
- [ ] בדוק שהנתונים נשמרו בנכון

---

**המבנה המוסדר הזה מקל על הבנה וקריאה של הקוד!** 🎉
