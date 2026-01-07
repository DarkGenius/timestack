// Task priority levels
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

// Task status
export type TaskStatus = 'open' | 'completed';

// Sync status
export type SyncStatus = 'synced' | 'pending' | 'conflict';

// Task colors (predefined palette)
export const TASK_COLORS = [
  { name: 'gray', value: '#e5e7eb', label: { ru: 'Серый', en: 'Gray' } },
  { name: 'red', value: '#fee2e2', label: { ru: 'Красный', en: 'Red' } },
  { name: 'orange', value: '#fed7aa', label: { ru: 'Оранжевый', en: 'Orange' } },
  { name: 'yellow', value: '#fef3c7', label: { ru: 'Жёлтый', en: 'Yellow' } },
  { name: 'green', value: '#d1fae5', label: { ru: 'Зелёный', en: 'Green' } },
  { name: 'blue', value: '#dbeafe', label: { ru: 'Синий', en: 'Blue' } },
  { name: 'purple', value: '#e9d5ff', label: { ru: 'Фиолетовый', en: 'Purple' } },
  { name: 'pink', value: '#fce7f3', label: { ru: 'Розовый', en: 'Pink' } }
] as const;

// Priority colors for visual indicators
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#10b981',
  normal: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444'
};

// Main Task interface
export interface Task {
  id: string;
  title: string;
  description: string | null;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  priority: TaskPriority;
  color: string; // Hex color
  estimated_time: number | null; // Minutes
  actual_time: number | null; // Minutes
  status: TaskStatus;
  completed_at: string | null; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp (soft delete)
  sync_status: SyncStatus;
  moved_from_date: string | null; // ISO 8601 date (YYYY-MM-DD)
  user_id: string | null; // Firebase UID
}

// Input for creating a new task
export interface CreateTaskInput {
  title: string;
  description?: string;
  date: string;
  priority?: TaskPriority;
  color?: string;
  estimated_time?: number;
  user_id?: string;
}

// Input for updating a task
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  date?: string;
  priority?: TaskPriority;
  color?: string;
  estimated_time?: number | null;
  actual_time?: number | null;
  status?: TaskStatus;
  moved_from_date?: string | null;
  user_id?: string;
}

// Filters for querying tasks
export interface TaskFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  user_id?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
