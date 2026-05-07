/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useTasksStore } from '../data/repositories/tasksRepository'
import type { Task, TaskStatus } from '../types/models'

interface NewTaskInput {
  apartment_id: number
  title: string
  assignee_id: number
  due_date: string
  status: TaskStatus
  created_by: number
}

interface UpdateTaskInput {
  title: string
  assignee_id: number
  due_date: string
  status: TaskStatus
}

interface TasksState {
  tasks: Task[]
  addTask: (task: NewTaskInput) => void
  updateTask: (taskId: number, task: UpdateTaskInput) => Task | null
  updateTaskStatus: (taskId: number, status: TaskStatus) => void
  deleteTask: (taskId: number) => void
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
  const [tasks, setTasks] = useTasksStore()

  const addTask = useCallback((task: NewTaskInput) => {
    setTasks((current) => [
      {
        id: Math.max(...current.map((item) => item.id), 0) + 1,
        apartment_id: task.apartment_id,
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

  const updateTask = useCallback((taskId: number, task: UpdateTaskInput) => {
    let updatedTask: Task | null = null

    setTasks((current) =>
      current.map((item) => {
        if (item.id !== taskId) return item
        updatedTask = {
          ...item,
          title: task.title,
          assignee_id: task.assignee_id,
          due_date: task.due_date,
          status: task.status,
        }
        return updatedTask
      }),
    )

    return updatedTask
  }, [])

  const deleteTask = useCallback((taskId: number) => {
    setTasks((current) => current.filter((task) => task.id !== taskId))
  }, [])

  const value = useMemo(
    () => ({ tasks, addTask, updateTask, updateTaskStatus, deleteTask }),
    [tasks, addTask, updateTask, updateTaskStatus, deleteTask],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) throw new Error('useTasks must be used within TasksProvider')
  return context
}
