import { create } from 'zustand'
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../../../shared/types'

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null

  // Actions
  loadTasksByDate: (date: string) => Promise<void>
  loadTasksByRange: (startDate: string, endDate: string) => Promise<void>
  loadTasksWithFilters: (filters: TaskFilters) => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<Task | null>
  updateTask: (id: string, updates: UpdateTaskInput) => Promise<Task | null>
  deleteTask: (id: string) => Promise<boolean>
  toggleTask: (id: string) => Promise<Task | null>
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  loadTasksByDate: async (date: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.tasks.getByDate(date)
      if (response.success && response.data) {
        set({ tasks: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to load tasks', isLoading: false })
      }
    } catch {
      set({ error: 'Failed to load tasks', isLoading: false })
    }
  },

  loadTasksByRange: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.tasks.getByRange(startDate, endDate)
      if (response.success && response.data) {
        set({ tasks: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to load tasks', isLoading: false })
      }
    } catch {
      set({ error: 'Failed to load tasks', isLoading: false })
    }
  },

  loadTasksWithFilters: async (filters: TaskFilters) => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.tasks.filter(filters)
      if (response.success && response.data) {
        set({ tasks: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to load tasks', isLoading: false })
      }
    } catch {
      set({ error: 'Failed to load tasks', isLoading: false })
    }
  },

  createTask: async (input: CreateTaskInput) => {
    set({ error: null })
    try {
      const response = await window.api.tasks.create(input)
      if (response.success && response.data) {
        set((state) => ({ tasks: [...state.tasks, response.data!] }))
        return response.data
      } else {
        set({ error: response.error || 'Failed to create task' })
        return null
      }
    } catch {
      set({ error: 'Failed to create task' })
      return null
    }
  },

  updateTask: async (id: string, updates: UpdateTaskInput) => {
    set({ error: null })
    try {
      const response = await window.api.tasks.update(id, updates)
      if (response.success && response.data) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? response.data! : t))
        }))
        return response.data
      } else {
        set({ error: response.error || 'Failed to update task' })
        return null
      }
    } catch {
      set({ error: 'Failed to update task' })
      return null
    }
  },

  deleteTask: async (id: string) => {
    set({ error: null })
    try {
      const response = await window.api.tasks.delete(id)
      if (response.success) {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id)
        }))
        return true
      } else {
        set({ error: response.error || 'Failed to delete task' })
        return false
      }
    } catch {
      set({ error: 'Failed to delete task' })
      return false
    }
  },

  toggleTask: async (id: string) => {
    set({ error: null })
    try {
      const response = await window.api.tasks.toggle(id)
      if (response.success && response.data) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? response.data! : t))
        }))
        return response.data
      } else {
        set({ error: response.error || 'Failed to toggle task' })
        return null
      }
    } catch {
      set({ error: 'Failed to toggle task' })
      return null
    }
  },

  clearError: () => set({ error: null })
}))
