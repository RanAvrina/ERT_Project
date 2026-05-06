/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { mockExpenses, mockPayments } from '../data/mock'
import type { Expense, Payment } from '../types/models'

interface NewExpenseInput {
  apartment_id: number
  paid_by: number
  amount: string
  description: string
  category: string | null
  date: string
  participant_ids: number[]
}

interface NewPaymentInput {
  apartment_id: number
  payer_id: number
  payee_id: number
  amount: string
  created_at: string
  note?: string | null
}

export interface BalanceSettlement {
  id: string
  payer_id: number
  payee_id: number
  amount: string
}

interface ExpensesState {
  expenses: Expense[]
  payments: Payment[]
  addExpense: (expense: NewExpenseInput) => Expense
  addPayment: (payment: NewPaymentInput) => Payment
  settlements: BalanceSettlement[]
  netBalanceByUser: Record<number, number>
}

const ExpensesContext = createContext<ExpensesState | null>(null)

function calculateBalances(expenses: Expense[], payments: Payment[]) {
  const netBalanceByUser: Record<number, number> = {}

  expenses
    .filter((expense) => expense.status === 'active')
    .forEach((expense) => {
      const amount = Number(expense.amount)
      const participants = expense.participant_ids
      if (!Number.isFinite(amount) || amount <= 0 || participants.length === 0) return

      const share = amount / participants.length
      netBalanceByUser[expense.paid_by] =
        (netBalanceByUser[expense.paid_by] ?? 0) + amount

      participants.forEach((participantId) => {
        netBalanceByUser[participantId] =
          (netBalanceByUser[participantId] ?? 0) - share
      })
    })

  payments
    .filter((payment) => payment.status === 'recorded')
    .forEach((payment) => {
      const amount = Number(payment.amount)
      if (!Number.isFinite(amount) || amount <= 0) return

      netBalanceByUser[payment.payer_id] =
        (netBalanceByUser[payment.payer_id] ?? 0) + amount
      netBalanceByUser[payment.payee_id] =
        (netBalanceByUser[payment.payee_id] ?? 0) - amount
    })

  const debtors = Object.entries(netBalanceByUser)
    .map(([userId, balance]) => ({ userId: Number(userId), amount: -balance }))
    .filter((entry) => entry.amount > 0.005)
    .sort((a, b) => b.amount - a.amount)
  const creditors = Object.entries(netBalanceByUser)
    .map(([userId, balance]) => ({ userId: Number(userId), amount: balance }))
    .filter((entry) => entry.amount > 0.005)
    .sort((a, b) => b.amount - a.amount)
  const settlements: BalanceSettlement[] = []

  let debtorIndex = 0
  let creditorIndex = 0

  while (debtors[debtorIndex] && creditors[creditorIndex]) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0.005) {
      settlements.push({
        id: `balance-${debtor.userId}-${creditor.userId}-${settlements.length}`,
        payer_id: debtor.userId,
        payee_id: creditor.userId,
        amount: amount.toFixed(2),
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount
    if (debtor.amount <= 0.005) debtorIndex += 1
    if (creditor.amount <= 0.005) creditorIndex += 1
  }

  return { netBalanceByUser, settlements }
}

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const nextExpenseId = useRef(Math.max(...mockExpenses.map((expense) => expense.id), 0) + 1)
  const nextPaymentId = useRef(Math.max(...mockPayments.map((payment) => payment.id), 0) + 1)

  const addExpense = useCallback((expense: NewExpenseInput) => {
    const nextExpense: Expense = {
      id: nextExpenseId.current,
      status: 'active',
      ...expense,
    }
    nextExpenseId.current += 1

    setExpenses((current) => [nextExpense, ...current])
    return nextExpense
  }, [])

  const addPayment = useCallback((payment: NewPaymentInput) => {
    const nextPayment: Payment = {
      id: nextPaymentId.current,
      status: 'recorded',
      ...payment,
    }
    nextPaymentId.current += 1

    setPayments((current) => [nextPayment, ...current])
    return nextPayment
  }, [])

  const { netBalanceByUser, settlements } = useMemo(
    () => calculateBalances(expenses, payments),
    [expenses, payments],
  )
  const value = useMemo(
    () => ({
      expenses,
      payments,
      addExpense,
      addPayment,
      settlements,
      netBalanceByUser,
    }),
    [expenses, payments, addExpense, addPayment, settlements, netBalanceByUser],
  )

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
}

export function useExpenses() {
  const context = useContext(ExpensesContext)
  if (!context) throw new Error('useExpenses must be used within ExpensesProvider')
  return context
}
