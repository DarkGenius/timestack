import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/uiStore';
import type { TaskStatus, TaskPriority } from '../../../../shared/types';

type StatusFilter = TaskStatus | 'all';
type PriorityFilter = TaskPriority | 'all';

const statusOptions: StatusFilter[] = ['all', 'open', 'completed'];
const priorityOptions: PriorityFilter[] = ['all', 'low', 'normal', 'high', 'critical'];

function FilterPanel(): React.JSX.Element {
  const { t } = useTranslation();
  const { statusFilter, priorityFilter, setStatusFilter, setPriorityFilter, resetFilters } =
    useUIStore();

  const hasFilters = statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Status filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('filter.status')}
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'primary' : 'outline'}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? t('filter.all') : t(`filter.${status}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Priority filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('filter.priority')}
        </label>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((priority) => (
            <Button
              key={priority}
              size="sm"
              variant={priorityFilter === priority ? 'primary' : 'outline'}
              onClick={() => setPriorityFilter(priority)}
            >
              {priority === 'all' ? t('filter.all') : t(`task.priorities.${priority}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Reset button */}
      {hasFilters && (
        <Button size="sm" variant="ghost" onClick={resetFilters}>
          {t('filter.all')} ✕
        </Button>
      )}
    </div>
  );
}

export { FilterPanel };
