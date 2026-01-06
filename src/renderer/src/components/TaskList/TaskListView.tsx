import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import { TaskCard } from './TaskCard'
import { Button } from '../ui/Button'
import { useTaskStore } from '../../store/taskStore'
import { useUIStore } from '../../store/uiStore'

function TaskListView(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const { tasks, isLoading, loadTasksByDate } = useTaskStore()
  const { selectedDate, statusFilter, priorityFilter, openNewTaskDialog, goToToday } = useUIStore()

  const dateLocale = i18n.language === 'ru' ? ru : enUS

  // Load tasks when date changes
  useEffect(() => {
    loadTasksByDate(selectedDate)
  }, [selectedDate, loadTasksByDate])

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
      return true
    })
  }, [tasks, statusFilter, priorityFilter])

  // Sort tasks: open first (by priority), then completed
  const sortedTasks = useMemo(() => {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 }
    return [...filteredTasks].sort((a, b) => {
      // Completed tasks go last
      if (a.status !== b.status) {
        return a.status === 'completed' ? 1 : -1
      }
      // Sort by priority
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [filteredTasks])

  const dateObj = new Date(selectedDate)
  const isValidDate = !isNaN(dateObj.getTime())
  const formattedDate = isValidDate
    ? format(dateObj, 'EEEE, d MMMM yyyy', { locale: dateLocale })
    : selectedDate

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd')

  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">{formattedDate}</h2>
          <p className="text-sm text-gray-500">
            {t('task.tasksCount', { count: filteredTasks.length })}
            {completedCount > 0 && (
              <span> ({t('task.completedCount', { count: completedCount })})</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {!isToday && (
            <Button variant="outline" onClick={goToToday}>
              {t('nav.today')}
            </Button>
          )}
          <Button onClick={() => openNewTaskDialog(selectedDate)}>+ {t('task.new')}</Button>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-auto mt-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <svg
              className="w-12 h-12 mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>{t('task.empty')}</p>
            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => openNewTaskDialog(selectedDate)}
            >
              {t('task.addFirst')}
            </Button>
          </div>
        ) : (
          sortedTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}

export { TaskListView }
