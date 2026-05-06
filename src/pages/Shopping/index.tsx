import { useState, type FormEvent } from 'react'
import { Card } from '../../components/Card'
import { ShoppingItemStatusChip } from '../../components/StatusChip'
import { mockShoppingItems, mockShoppingList } from '../../data/mock'
import type { ShoppingItem, ShoppingItemStatus } from '../../types/models'

interface ShoppingFormState {
  itemName: string
  quantity: string
  category: string
  status: ShoppingItemStatus
}

type ShoppingFilter = 'all' | 'open' | 'purchased'

const shoppingStatusOptions: { value: ShoppingItemStatus; label: string }[] = [
  { value: 'open', label: 'פתוח' },
  { value: 'purchased', label: 'נרכש' },
]

const shoppingFilterOptions: { value: ShoppingFilter; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'open', label: 'לקנייה' },
  { value: 'purchased', label: 'נרכש' },
]

const initialShoppingForm: ShoppingFormState = {
  itemName: '',
  quantity: '',
  category: '',
  status: 'open',
}

export function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>(mockShoppingItems)
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false)
  const [shoppingForm, setShoppingForm] =
    useState<ShoppingFormState>(initialShoppingForm)
  const [formError, setFormError] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<ShoppingFilter>('all')
  const [isCompletedOpen, setIsCompletedOpen] = useState(true)
  const openItems = items.filter((item) => item.status === 'open')
  const purchasedItems = items.filter(
    (item) => item.status === 'purchased',
  )
  const shouldShowOpenItems = selectedFilter === 'all' || selectedFilter === 'open'
  const shouldShowPurchasedItems =
    selectedFilter === 'all' || selectedFilter === 'purchased'

  function updateShoppingForm(field: keyof ShoppingFormState, value: string) {
    setShoppingForm((current) => ({ ...current, [field]: value }))
  }

  function closeShoppingModal() {
    setIsShoppingModalOpen(false)
    setShoppingForm(initialShoppingForm)
    setFormError('')
  }

  function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!shoppingForm.itemName.trim()) {
      setFormError('צריך לתת לפריט שם קצר וברור.')
      return
    }

    const nextId =
      items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
    const isPurchased = shoppingForm.status === 'purchased'

    setItems((current) => [
      {
        id: nextId,
        shopping_list_id: mockShoppingList.id,
        item_name: shoppingForm.itemName.trim(),
        quantity: shoppingForm.quantity.trim() || null,
        category: shoppingForm.category.trim() || null,
        status: shoppingForm.status,
        added_by: 1,
        purchased_by: isPurchased ? 1 : null,
        created_at: new Date().toISOString().slice(0, 10),
        purchased_at: isPurchased ? new Date().toISOString() : null,
      },
      ...current,
    ])
    closeShoppingModal()
  }

  function updateItemStatus(itemId: number, status: ShoppingItemStatus) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item

        if (status === 'purchased') {
          return {
            ...item,
            status,
            purchased_by: item.purchased_by ?? 1,
            purchased_at: item.purchased_at ?? new Date().toISOString(),
          }
        }

        if (status === 'open') {
          return {
            ...item,
            status,
            purchased_by: null,
            purchased_at: null,
          }
        }

        return {
          ...item,
          status,
        }
      }),
    )
  }

  function renderShoppingItems(sectionItems: ShoppingItem[], emptyText: string) {
    if (sectionItems.length === 0) {
      return <p className="muted shopping-empty">{emptyText}</p>
    }

    return (
      <ul className="shop-list shop-list--cards">
        {sectionItems.map((item) => (
          <li
            key={item.id}
            className={`shop-list__item shop-item-card${
              item.status !== 'open' ? ' shop-item-card--muted' : ''
            }`}
          >
            <div className="shop-item-card__main">
              <div className="shop-list__title">{item.item_name}</div>
              <div className="shop-list__meta shop-item-card__details">
                <span>כמות: {item.quantity ?? 'לא צוינה'}</span>
                <span>קטגוריה: {item.category ?? 'ללא קטגוריה'}</span>
              </div>
            </div>
            <div className="shop-item-card__status">
              <ShoppingItemStatusChip status={item.status} />
              <label className="shopping-status-control">
                <span>עדכון סטטוס</span>
                <select
                  value={item.status}
                  onChange={(event) =>
                    updateItemStatus(
                      item.id,
                      event.target.value as ShoppingItemStatus,
                    )
                  }
                >
                  {shoppingStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="page shopping-page">
      <div className="page__head shopping-hero">
        <div>
          <p className="shopping-hero__eyebrow">קניות</p>
          <h1 className="page__title">רשימת קניות</h1>
        </div>
        <button
          type="button"
          className="btn btn--primary shopping-hero__action"
          onClick={() => setIsShoppingModalOpen(true)}
        >
          + פריט חדש
        </button>
      </div>

      <section className="shopping-summary" aria-label="סיכום רשימת הקניות">
        <Card>
          <p className="shopping-summary__label">עדיין צריך לקנות</p>
          <p className="shopping-summary__value">{openItems.length}</p>
        </Card>
        <Card>
          <p className="shopping-summary__label">כבר נרכשו</p>
          <p className="shopping-summary__value">{purchasedItems.length}</p>
        </Card>
      </section>

      <div className="shopping-filter-tabs" aria-label="סינון רשימת קניות">
        {shoppingFilterOptions.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`shopping-filter-tabs__button${
              selectedFilter === filter.value
                ? ' shopping-filter-tabs__button--active'
                : ''
            }`}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {shouldShowOpenItems ? (
        <Card className="shopping-active-card" title="לקנייה עכשיו">
          <p className="shopping-section-note">
            הפריטים הפתוחים ברשימה הפעילה של הדירה.
          </p>
          {renderShoppingItems(openItems, 'אין כרגע פריטים פתוחים לקנייה.')}
        </Card>
      ) : null}

      {shouldShowPurchasedItems ? (
        <Card>
          <button
            type="button"
            className="shopping-completed-toggle"
            onClick={() => setIsCompletedOpen((current) => !current)}
            aria-expanded={isCompletedOpen}
          >
            <span>
              <strong>נרכשו לאחרונה</strong>
              <small>{purchasedItems.length} פריטים שנרכשו</small>
            </span>
            <span aria-hidden="true">{isCompletedOpen ? '−' : '+'}</span>
          </button>
          {isCompletedOpen
            ? renderShoppingItems(
                purchasedItems,
                'עוד אין פריטים שסומנו כנרכשו.',
              )
            : null}
        </Card>
      ) : null}

      {isShoppingModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="shopping-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-shopping-item-title"
          >
            <div className="shopping-modal__head">
              <div>
                <p className="shopping-hero__eyebrow">פריט חדש</p>
                <h2 id="add-shopping-item-title">מה צריך לקנות?</h2>
                <p>הפריט יישמר כרגע רק ברשימת הדמו המקומית.</p>
              </div>
              <button
                type="button"
                className="btn-text"
                onClick={closeShoppingModal}
              >
                סגירה
              </button>
            </div>

            <form className="shopping-form" onSubmit={handleAddItem} noValidate>
              <label className="field">
                <span className="field__label">שם הפריט</span>
                <input
                  className="field__input"
                  value={shoppingForm.itemName}
                  onChange={(event) =>
                    updateShoppingForm('itemName', event.target.value)
                  }
                  placeholder="לדוגמה: ביצים"
                />
              </label>

              <div className="shopping-form__grid">
                <label className="field">
                  <span className="field__label">כמות (אופציונלי)</span>
                  <input
                    className="field__input"
                    value={shoppingForm.quantity}
                    onChange={(event) =>
                      updateShoppingForm('quantity', event.target.value)
                    }
                    placeholder="לדוגמה: תבנית אחת"
                  />
                </label>

                <label className="field">
                  <span className="field__label">קטגוריה (אופציונלי)</span>
                  <input
                    className="field__input"
                    value={shoppingForm.category}
                    onChange={(event) =>
                      updateShoppingForm('category', event.target.value)
                    }
                    placeholder="לדוגמה: מזון"
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">סטטוס</span>
                <select
                  className="field__input"
                  value={shoppingForm.status}
                  onChange={(event) =>
                    updateShoppingForm(
                      'status',
                      event.target.value as ShoppingItemStatus,
                    )
                  }
                >
                  {shoppingStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              {formError ? (
                <p className="form-message form-message--error">{formError}</p>
              ) : null}

              <div className="shopping-form__actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={closeShoppingModal}
                >
                  ביטול
                </button>
                <button type="submit" className="btn btn--primary">
                  שמירת פריט
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}
