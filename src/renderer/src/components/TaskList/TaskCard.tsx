import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { useTaskStore } from '../../store/taskStore'
import { useUIStore } from '../../store/uiStore'
import type { Task } from '../../../../shared/types'
import { PRIORITY_COLORS } from '../../../../shared/types'

interface TaskCardProps {
  task: Task
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function TaskCard({ task }: TaskCardProps) {
  const { t } = useTranslation()
  const { toggleTask } = useTaskStore()
  const { openEditTaskDialog } = useUIStore()

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleTask(task.id)
  }

  const handleClick = () => {
    openEditTaskDialog(task)
  }

  return (
    <div
      onClick={handleClick}
      className="p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      style={{
        backgroundColor: task.color,
        borderLeft: `4px solid ${PRIORITY_COLORS[task.priority]}`
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`
            w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5
            transition-colors flex items-center justify-center
            ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-400 hover:border-gray-600'
            }
          `}
        >
          {task.status === 'completed' && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-medium text-gray-900 truncate ${
                task.status === 'completed' ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
            <Badge variant="priority" priority={task.priority}>
              {t(`task.priorities.${task.priority}`)}
            </Badge>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.description}</p>
          )}

          {/* Time info */}
          {(task.estimated_time || task.actual_time) && (
            <div className="flex gap-4 text-xs text-gray-500">
              {task.estimated_time && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatMinutes(task.estimated_time)}
                </span>
              )}
              {task.actual_time && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {formatMinutes(task.actual_time)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { TaskCard }
