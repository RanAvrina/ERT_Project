# 📖 הנחיות - כיצד להוסיף עמוד חדש

## שלב 1: צור תיקייה חדשה

```bash
public/pages/[page-name]/
```

**דוגמה:**
```bash
public/pages/my-new-page/
```

---

## שלב 2: צור שלושה קבצים בתיקייה

### 2.1 קובץ HTML - `[page-name].html`

```html
<!-- MY NEW PAGE -->

<div class="container page-container">
  <h1 class="page-title">כותרת הדף</h1>

  <!-- תוכן הדף כאן -->
  
</div>
```

**חוקים:**
- השתמש בתחזוקת `<h1>` עם `class="page-title"`
- עטוף את התוכן עם `<div class="container page-container">`
- החזק את כל רכוב עביי HTML בתוך קובץ זה

---

### 2.2 קובץ CSS - `[page-name].css`

```css
/* ====== MY NEW PAGE STYLES ====== */

.my-element {
  background: white;
  padding: 1rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .my-element {
    padding: 0.5rem;
  }
}
```

**חוקים:**
- התחל עם תיאור של העמוד בתמונה
- קבע סגנונות ספציפיים לעמוד זה בלבד
- תמיד הוסף `@media` queries עבור mobile
- תמיד השתמש בש"קים משותפים מ-`main.css`

---

### 2.3 קובץ JS - `[page-name].js`

```javascript
/**
 * myNewPage.js - תיאור של מה הדף עושה
 * 
 * מטרה: הסבר כללי
 */

/**
 * אתחול של עמוד זה
 * קורא כאשר הדף נטען
 */
function initMyNewPagePage() {
  console.log('My New Page initialized');

  // הוסף event listeners
  const button = document.getElementById('myButton');
  if (button) {
    button.addEventListener('click', handleButtonClick);
  }

  // טעין נתונים
  loadData();
}

/**
 * מטפל בלחיצה על כפתור
 * @param {Event} e - האירוע
 */
function handleButtonClick(e) {
  e.preventDefault();
  console.log('Button clicked');
  // קוד כאן
}

/**
 * טוען נתונים מהאחסון המקומי
 */
function loadData() {
  const data = getFromStorage('myData');
  if (data) {
    console.log('Data loaded:', data);
  }
}
```

**חוקים:**
- התחל עם `function init[PageName]Page() { ... }`
- שא תיאורים בפונקציות עם `/** ... */`
- השתמש בפונקציות משותפות מ-`main.js`:
  - `saveToStorage(key, value)`
  - `getFromStorage(key)`
  - `apiGet(url)`, `apiPost(url, data)`, וכו'
- תמיד בדוק ערכים לפני שימוש

---

## שלב 3: הוסף קישור בתפריט הראשי

ערוך את `public/index.html` והוסף קישור בתפריט:

```html
<nav class="main-nav">
  <!-- קישורים חדשים שלך -->
  <a href="./pages/my-new-page/my-new-page.html" class="nav-link">🎯 הדף החדש</a>
</nav>
```

---

## דוגמה מלאה

### שלב 1: יצור תיקייה
```
public/pages/products/
```

### שלב 2: צור קבצים

**products.html:**
```html
<!-- PRODUCTS PAGE -->

<div class="container page-container">
  <div class="page-header">
    <h1 class="page-title">מוצרים</h1>
    <button class="button button-primary" id="addProductBtn">הוסף</button>
  </div>

  <div id="productsList" class="products-list">מטען...</div>
</div>

<!-- ADD PRODUCT DIALOG -->
<div class="dialog-overlay" id="addProductDialog" style="display: none;">
  <div class="dialog-content">
    <h2>הוסף מוצר</h2>
    <form id="productForm">
      <div class="form-group">
        <label for="productName">שם</label>
        <input type="text" id="productName" required />
      </div>
      <div class="form-group">
        <label for="productPrice">מחיר</label>
        <input type="number" id="productPrice" required />
      </div>
      <div class="dialog-buttons">
        <button type="submit" class="button button-primary">שמור</button>
        <button type="button" class="button button-secondary" id="cancelProduct">ביטול</button>
      </div>
    </form>
  </div>
</div>
```

**products.css:**
```css
/* ====== PRODUCTS PAGE STYLES ====== */

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  transition: var(--transition);
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .products-list {
    grid-template-columns: 1fr;
  }
}
```

**products.js:**
```javascript
/**
 * products.js - ניהול מוצרים
 */

function initProductsPage() {
  document.getElementById('addProductBtn')?.addEventListener('click', () => {
    document.getElementById('addProductDialog').style.display = 'flex';
  });

  document.getElementById('cancelProduct')?.addEventListener('click', () => {
    document.getElementById('addProductDialog').style.display = 'none';
  });

  document.getElementById('productForm')?.addEventListener('submit', handleAddProduct);

  loadProducts();
}

function handleAddProduct(e) {
  e.preventDefault();

  const name = document.getElementById('productName').value;
  const price = document.getElementById('productPrice').value;

  const products = getFromStorage('products') || [];
  products.push({
    id: new Date().getTime(),
    name,
    price,
  });

  saveToStorage('products', products);
  document.getElementById('addProductDialog').style.display = 'none';
  e.target.reset();
  loadProducts();
}

function loadProducts() {
  const products = getFromStorage('products') || [];
  const list = document.getElementById('productsList');

  if (products.length === 0) {
    list.innerHTML = '<p>אין מוצרים עדיין</p>';
    return;
  }

  list.innerHTML = products
    .map(
      (p) => `
    <div class="product-card">
      <h3>${p.name}</h3>
      <p>₪${p.price}</p>
    </div>
  `,
    )
    .join('');
}
```

### שלב 3: הוסף לתפריט

```html
<a href="./pages/products/products.html" class="nav-link">📦 מוצרים</a>
```

---

## ✅ Check List

- [ ] יצור תיקייה חדשה בתיקיית `pages/`
- [ ] צור `[page-name].html` עם תוכן HTML
- [ ] צור `[page-name].css` עם סטיילים
- [ ] צור `[page-name].js` עם לוגיקה
- [ ] הוסף קישור ב-`index.html`
- [ ] בדוק שהדף טוען בנכון
- [ ] בדוק שה-CSS מוחל בנכון
- [ ] בדוק שה-JS עובד בנכון
- [ ] בדוק responsive design

---

## 💡 טיפים חשובים

### 1. משתנים צבעים משותפים
```css
background: var(--primary-color);  /* צבע ראשי */
color: var(--text-secondary);      /* טקסט משני */
border: 1px solid var(--border-color);
```

### 2. Transitions חלקים
```css
transition: var(--transition);  /* 0.3s ease */
```

### 3. Responsive grid
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 1.5rem;
```

### 4. localStorage
```javascript
// שמור
saveToStorage('key', { data: 'value' });

// קרא
const data = getFromStorage('key');

// מחק
removeFromStorage('key');
```

### 5. בדוק אם רכיב קיים
```javascript
document.getElementById('element')?.addEventListener('click', handler);
```

---

## 🚫 דברים להימנע

❌ **אל תשתמש:**
- `alert()` - בעיצוב קשה
- `console.log()` בקוד יצור
- קוד מחוקי בעמוד שונה
- משתנה גלובלי חדש

✅ **בעיצוב:**
- רכיבי CSS משותפים
- משתנים משותפים
- פונקציות עזר משותפות
- localStorage לשמירת נתונים

---

## 📞 עזרה נפוצה

**Q: הדף לא טוען?**
A: בדוק:`
- שם הקובץ תואם
- שם התיקייה תואם
- סדר ההאזנה בקובץ HTML

**Q: ה-CSS לא מוחל?**
A: בדוק:
- קובץ ה-CSS קיים בתיקייה הנכונה
- שם הקובץ תואם את שם העמוד

**Q: ה-JS לא עובד?**
A: בדוק:
- שם הפונקציה `initPageNamePage`
- בדוק בעקבות הבדיקה (F12)
- בדוק שה-HTML קיים

---

**אתה מוכן להוסיף עמוד חדש!** 🎉
