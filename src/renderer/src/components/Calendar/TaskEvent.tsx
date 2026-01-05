import type { Task } from '../../../../shared/types'

interface TaskEventProps {
  event: {
    id: string
    title: string
    resource: Task
  }
}

function TaskEvent({ event }: TaskEventProps) {
  const task = event.resource
  const isCompleted = task.status === 'completed'

  return (
    <div className="flex items-center gap-1 px-1 py-0.5 text-xs overflow-hidden">
      {/* Status indicator */}
      {isCompleted && (
        <svg className="w-3 h-3 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}

      {/* Title */}
      <span className={`truncate ${isCompleted ? 'line-through opacity-70' : ''}`}>
        {event.title}
      </span>

      {/* Time indicator */}
      {task.estimated_time && (
        <span className="ml-auto text-gray-500 flex-shrink-0">
          {task.estimated_time < 60 ? `${task.estimated_time}m` : `${Math.round(task.estimated_time / 60)}h`}
        </span>
      )}
    </div>
  )
}

export { TaskEvent }
