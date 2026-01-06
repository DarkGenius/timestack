import React from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskPriority } from '../../../../shared/types'
import { PRIORITY_COLORS } from '../../../../shared/types'

interface PrioritySelectProps {
  value: TaskPriority
  onChange: (priority: TaskPriority) => void
}

const priorities: TaskPriority[] = ['low', 'normal', 'high', 'critical']

function PrioritySelect({ value, onChange }: PrioritySelectProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{t('task.priority')}</label>
      <div className="flex gap-2">
        {priorities.map((priority) => (
          <button
            key={priority}
            type="button"
            onClick={() => onChange(priority)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              border-2
              ${value === priority ? 'border-current' : 'border-transparent hover:border-gray-200'}
            `}
            style={{
              backgroundColor:
                value === priority ? PRIORITY_COLORS[priority] + '20' : 'transparent',
              color: PRIORITY_COLORS[priority]
            }}
          >
            {t(`task.priorities.${priority}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

export { PrioritySelect }
