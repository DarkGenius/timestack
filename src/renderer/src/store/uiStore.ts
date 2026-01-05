import { create } from 'zustand'
import { format } from 'date-fns'
import type { Task, TaskStatus, TaskPriority } from '../../../shared/types'

type ViewMode = 'calendar' | 'list'
type CalendarView = 'month' | 'week' | 'day' | 'agenda'

interface UIState {
  // Current view
  viewMode: ViewMode
  calendarView: CalendarView
  selectedDate: string // ISO date string YYYY-MM-DD

  // Dialog states
  isTaskDialogOpen: boolean
  editingTask: Task | null

  // Filters
  statusFilter: TaskStatus | 'all'
  priorityFilter: TaskPriority | 'all'

  // Actions
  setViewMode: (mode: ViewMode) => void
  setCalendarView: (view: CalendarView) => void
  setSelectedDate: (date: string | Date) => void
  goToToday: () => void

  // Dialog actions
  openNewTaskDialog: (date?: string) => void
  openEditTaskDialog: (task: Task) => void
  closeTaskDialog: () => void

  // Filter actions
  setStatusFilter: (status: TaskStatus | 'all') => void
  setPriorityFilter: (priority: TaskPriority | 'all') => void
  resetFilters: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  viewMode: 'calendar',
  calendarView: 'month',
  selectedDate: format(new Date(), 'yyyy-MM-dd'),

  isTaskDialogOpen: false,
  editingTask: null,

  statusFilter: 'all',
  priorityFilter: 'all',

  // View actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setCalendarView: (view) => set({ calendarView: view }),
  setSelectedDate: (date) =>
    set({
      selectedDate: typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
    }),
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

  // Filter actions
  setStatusFilter: (status) => set({ statusFilter: status }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  resetFilters: () => set({ statusFilter: 'all', priorityFilter: 'all' })
}))
