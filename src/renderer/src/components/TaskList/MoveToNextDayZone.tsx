import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addDays, format } from 'date-fns'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'

export const MoveToNextDayZone: React.FC = () => {
  const { t } = useTranslation()
  const { isTaskDragging, draggedTaskId, selectedDate, setIsTaskDragging, setDraggedTaskId } =
    useUIStore()
  const { updateTask, loadTasksByDate } = useTaskStore()
  const [isOver, setIsOver] = useState(false)

  if (!isTaskDragging) return null

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = (): void => {
    setIsOver(false)
  }

  const handleDrop = async (e: React.DragEvent): Promise<void> => {
    e.preventDefault()
    setIsOver(false)

    const taskId = e.dataTransfer.getData('application/timestack-task-id') || draggedTaskId

    if (taskId) {
      const nextDate = format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd')
      await updateTask(taskId, { date: nextDate })
      await loadTasksByDate(selectedDate)
    }

    setIsTaskDragging(false)
    setDraggedTaskId(null)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        mt-6 p-8 border-2 border-dashed rounded-xl
        flex flex-col items-center justify-center gap-3
        transition-all duration-300
        ${
          isOver
            ? 'bg-blue-50 border-blue-500 scale-[1.02] shadow-lg'
            : 'bg-gray-50 border-gray-300 opacity-80'
        }
      `}
    >
      <div
        className={`
        w-12 h-12 rounded-full flex items-center justify-center
        transition-colors duration-300
        ${isOver ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}
      `}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </div>
      <p
        className={`font-medium transition-colors duration-300 ${isOver ? 'text-blue-600' : 'text-gray-500'}`}
      >
        {t('task.moveToNextDay')}
      </p>
    </div>
  )
}
