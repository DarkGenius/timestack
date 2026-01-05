import { ReactNode } from 'react'
import type { TaskPriority } from '../../../../shared/types'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'priority'
  priority?: TaskPriority
  className?: string
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

function Badge({ children, variant = 'default', priority, className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'

  let colorStyles = 'bg-gray-100 text-gray-800'

  if (variant === 'priority' && priority) {
    colorStyles = priorityColors[priority]
  }

  return <span className={`${baseStyles} ${colorStyles} ${className}`}>{children}</span>
}

export { Badge }
