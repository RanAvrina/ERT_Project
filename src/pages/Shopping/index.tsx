import { useMemo, useState, type FormEvent } from 'react'
import { Card } from '../../components/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ShoppingItemStatusChip } from '../../components/StatusChip'
import { useShoppingItemsStore } from '../../data/repositories/shoppingRepository'
import { useApartment } from '../../context/ApartmentContext'
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

function buildFormFromItem(item: ShoppingItem): ShoppingFormState {
  return {
    itemName: item.item_name,
    quantity: item.quantity ?? '',
    category: item.category ?? '',
    status: item.status,
  }
}

export function ShoppingPage() {
  const { current } = useApartment()
  const apartmentId = current?.apartment.id ?? 0
  const defaultActorId = current?.adminUser.id ?? current?.roommates[0]?.id ?? 0
  const [items, setItems] = useShoppingItemsStore()
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null)
  const [shoppingForm, setShoppingForm] = useState<ShoppingFormState>(initialShoppingForm)
  const [formError, setFormError] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<ShoppingFilter>('all')
  const [isCompletedOpen, setIsCompletedOpen] = useState(true)

  const apartmentItems = useMemo(
    () => items.filter((item) => (item.apartment_id ?? apartmentId) === apartmentId),
    [apartmentId, items],
  )
  const openItems = apartmentItems.filter((item) => item.status === 'open')
  const purchasedItems = apartmentItems.filter((item) => item.status === 'purchased')
  const shouldShowOpenItems = selectedFilter === 'all' || selectedFilter === 'open'
  const shouldShowPurchasedItems =
    selectedFilter === 'all' || selectedFilter === 'purchased'

  function updateShoppingForm(field: keyof ShoppingFormState, value: string) {
    setShoppingForm((current) => ({ ...current, [field]: value }))
  }

  function openAddItemModal() {
    setEditingItem(null)
    setShoppingForm(initialShoppingForm)
    setFormError('')
    setIsShoppingModalOpen(true)
  }

  function openEditItemModal(item: ShoppingItem) {
    setSelectedItem(null)
    setEditingItem(item)
    setShoppingForm(buildFormFromItem(item))
    setFormError('')
    setIsShoppingModalOpen(true)
  }

  function closeShoppingModal() {
    setIsShoppingModalOpen(false)
    setEditingItem(null)
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

    if (editingItem) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                item_name: shoppingForm.itemName.trim(),
                quantity: shoppingForm.quantity.trim() || null,
                category: shoppingForm.category.trim() || null,
                status: shoppingForm.status,
                purchased_by:
                  shoppingForm.status === 'purchased'
                    ? item.purchased_by ?? defaultActorId
                    : null,
                purchased_at:
                  shoppingForm.status === 'purchased'
                    ? item.purchased_at ?? new Date().toISOString()
                    : null,
              }
            : item,
        ),
      )
    } else {
      const nextId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
      const isPurchased = shoppingForm.status === 'purchased'

      setItems((current) => [
        {
          id: nextId,
          apartment_id: apartmentId,
          shopping_list_id: apartmentId || nextId,
          item_name: shoppingForm.itemName.trim(),
          quantity: shoppingForm.quantity.trim() || null,
          category: shoppingForm.category.trim() || null,
          status: shoppingForm.status,
          added_by: defaultActorId,
          purchased_by: isPurchased ? defaultActorId : null,
          created_at: new Date().toISOString().slice(0, 10),
          purchased_at: isPurchased ? new Date().toISOString() : null,
        },
        ...current,
      ])
    }

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
            purchased_by: item.purchased_by ?? defaultActorId,
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

  function confirmDeleteItem() {
    if (!itemToDelete) return
    setItems((current) => current.filter((item) => item.id !== itemToDelete.id))
    if (selectedItem?.id === itemToDelete.id) setSelectedItem(null)
    if (editingItem?.id === itemToDelete.id) closeShoppingModal()
    setItemToDelete(null)
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
            <button
              type="button"
              className="expense-item-card__button"
              onClick={() => setSelectedItem(item)}
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
              </div>
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="page shopping-page">
      <div className="page__head shopping-hero">
        <button
          type="button"
          className="btn btn--primary shopping-hero__action"
          onClick={openAddItemModal}
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
            ? renderShoppingItems(purchasedItems, 'עוד אין פריטים שסומנו כנרכשו.')
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
                <p className="shopping-hero__eyebrow">
                  {editingItem ? 'עריכת פריט' : 'פריט חדש'}
                </p>
                <h2 id="add-shopping-item-title">
                  {editingItem ? 'עדכון פריט קנייה' : 'מה צריך לקנות?'}
                </h2>
                <p>
                  {editingItem
                    ? 'אפשר לעדכן כאן את פרטי הפריט.'
                    : 'הפריט יישמר כרגע רק ברשימת הדמו המקומית.'}
                </p>
              </div>
              <button type="button" className="btn-text" onClick={closeShoppingModal}>
                סגירה
              </button>
            </div>

            <form className="shopping-form" onSubmit={handleAddItem} noValidate>
              <label className="field">
                <span className="field__label">שם הפריט</span>
                <input
                  className="field__input"
                  value={shoppingForm.itemName}
                  onChange={(event) => updateShoppingForm('itemName', event.target.value)}
                  placeholder="לדוגמה: ביצים"
                />
              </label>

              <div className="shopping-form__grid">
                <label className="field">
                  <span className="field__label">כמות (אופציונלי)</span>
                  <input
                    className="field__input"
                    value={shoppingForm.quantity}
                    onChange={(event) => updateShoppingForm('quantity', event.target.value)}
                    placeholder="לדוגמה: תבנית אחת"
                  />
                </label>

                <label className="field">
                  <span className="field__label">קטגוריה (אופציונלי)</span>
                  <input
                    className="field__input"
                    value={shoppingForm.category}
                    onChange={(event) => updateShoppingForm('category', event.target.value)}
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
                    updateShoppingForm('status', event.target.value as ShoppingItemStatus)
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
                  {editingItem ? 'שמירת שינויים' : 'שמירת פריט'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {selectedItem ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="shopping-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shopping-details-title"
          >
            <div className="shopping-modal__head">
              <div>
                <p className="shopping-hero__eyebrow">פרטי פריט</p>
                <h2 id="shopping-details-title">{selectedItem.item_name}</h2>
                <p>נוסף בתאריך {selectedItem.created_at}</p>
              </div>
              <button type="button" className="btn-text" onClick={() => setSelectedItem(null)}>
                סגירה
              </button>
            </div>

            <div className="expense-detail">
              <div className="expense-detail__facts">
                <div>
                  <span>כמות</span>
                  <strong>{selectedItem.quantity ?? 'לא צוינה'}</strong>
                </div>
                <div>
                  <span>קטגוריה</span>
                  <strong>{selectedItem.category ?? 'ללא קטגוריה'}</strong>
                </div>
                <div>
                  <span>סטטוס</span>
                  <strong>
                    {shoppingStatusOptions.find((option) => option.value === selectedItem.status)
                      ?.label ?? selectedItem.status}
                  </strong>
                </div>
              </div>

              <label className="shopping-status-control">
                <span>עדכון סטטוס</span>
                <select
                  value={selectedItem.status}
                  onChange={(event) =>
                    updateItemStatus(
                      selectedItem.id,
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

              <div className="expense-form__actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => openEditItemModal(selectedItem)}
                >
                  עריכה
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setItemToDelete(selectedItem)}
                >
                  מחיקה
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {itemToDelete ? (
        <ConfirmDialog
          title="למחוק את הפריט?"
          message="הפריט יוסר מרשימת הקניות ולא יופיע עוד."
          confirmLabel="מחיקה"
          cancelLabel="ביטול"
          onConfirm={confirmDeleteItem}
          onCancel={() => setItemToDelete(null)}
        />
      ) : null}
    </div>
  )
}
