/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { mockTasks } from '../data/mock'
import type { Task, TaskStatus } from '../types/models'

interface NewTaskInput {
  title: string
  assignee_id: number
  due_date: string
  status: TaskStatus
  created_by: number
}

interface TasksState {
  tasks: Task[]
  addTask: (task: NewTaskInput) => void
  updateTaskStatus: (taskId: number, status: TaskStatus) => void
}

const TasksContext = createContext<TasksState | null>(null)

export function isTaskIncomplete(task: Task) {
  return task.status !== 'done' && task.status !== 'cancelled'
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

export function isTaskOverdue(task: Task, today = getTodayDate()) {
  return Boolean(task.due_date && task.due_date < today && isTaskIncomplete(task))
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)

  const addTask = useCallback((task: NewTaskInput) => {
    setTasks((current) => [
      {
        id: Math.max(...current.map((item) => item.id), 0) + 1,
        apartment_id: 1,
        title: task.title,
        description: null,
        assignee_id: task.assignee_id,
        due_date: task.due_date,
        status: task.status,
        created_by: task.created_by,
      },
      ...current,
    ])
  }, [])

  const updateTaskStatus = useCallback((taskId: number, status: TaskStatus) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task)),
    )
  }, [])

  const value = useMemo(
    () => ({ tasks, addTask, updateTaskStatus }),
    [tasks, addTask, updateTaskStatus],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) throw new Error('useTasks must be used within TasksProvider')
  return context
}
