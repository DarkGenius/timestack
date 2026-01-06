import { create } from 'zustand'
import { format } from 'date-fns'
import type { Task, TaskStatus, TaskPriority } from '../../../shared/types'

interface UIState {
  // Current view
  selectedDate: string // ISO date string YYYY-MM-DD

  // Dialog states
  isTaskDialogOpen: boolean
  isActualTimeDialogOpen: boolean
  editingTask: Task | null
  completingTask: Task | null

  // Filters
  statusFilter: TaskStatus | 'all'
  priorityFilter: TaskPriority | 'all'

  // Dragging state
  isTaskDragging: boolean
  draggedTaskId: string | null

  // Actions
  setSelectedDate: (date: string | Date) => void
  goToToday: () => void

  // Dialog actions
  openNewTaskDialog: (date?: string) => void
  openEditTaskDialog: (task: Task) => void
  closeTaskDialog: () => void
  openActualTimeDialog: (task: Task) => void
  closeActualTimeDialog: () => void

  // Filter actions
  setStatusFilter: (status: TaskStatus | 'all') => void
  setPriorityFilter: (priority: TaskPriority | 'all') => void
  resetFilters: () => void

  // Dragging actions
  setIsTaskDragging: (dragging: boolean) => void
  setDraggedTaskId: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  selectedDate: format(new Date(), 'yyyy-MM-dd'),

  isTaskDialogOpen: false,
  isActualTimeDialogOpen: false,
  editingTask: null,
  completingTask: null,

  statusFilter: 'all',
  priorityFilter: 'all',

  isTaskDragging: false,
  draggedTaskId: null,

  // View actions
  setSelectedDate: (date) => {
    if (typeof date === 'string') {
      set({ selectedDate: date })
    } else {
      try {
        set({ selectedDate: format(date, 'yyyy-MM-dd') })
      } catch (e) {
        console.error('Invalid date passed to setSelectedDate:', date, e)
      }
    }
  },
  goToToday: () => set({ selectedDate: format(new Date(), 'yyyy-MM-dd') }),

  // Dialog actions
  openNewTaskDialog: (date) =>
    set({
      isTaskDialogOpen: true,
      editingTask: null,
      selectedDate: date || format(new Date(), 'yyyy-MM-dd')
    }),
  openEditTaskDialog: (task) =>
    set({
      isTaskDialogOpen: true,
      editingTask: task
    }),
  closeTaskDialog: () =>
    set({
      isTaskDialogOpen: false,
      editingTask: null
    }),
  openActualTimeDialog: (task) =>
    set({
      isActualTimeDialogOpen: true,
      completingTask: task
    }),
  closeActualTimeDialog: () =>
    set({
      isActualTimeDialogOpen: false,
      completingTask: null
    }),

  // Filter actions
  setStatusFilter: (status) => set({ statusFilter: status }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  resetFilters: () => set({ statusFilter: 'all', priorityFilter: 'all' }),

  // Dragging actions
  setIsTaskDragging: (dragging) => set({ isTaskDragging: dragging }),
  setDraggedTaskId: (id) => set({ draggedTaskId: id })
}))
