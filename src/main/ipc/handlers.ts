import { ipcMain } from 'electron';
import {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getTasksByDate,
  getTasksByDateRange,
  getTasksWithFilters,
  toggleTaskStatus,
  getAllTasks
} from '../database/queries';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  ApiResponse
} from '../../shared/types';

function wrapResponse<T>(fn: () => T): ApiResponse<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    console.error('IPC Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function registerIpcHandlers(): void {
  // Create task
  ipcMain.handle('tasks:create', (_event, input: CreateTaskInput) => {
    return wrapResponse(() => createTask(input));
  });

  // Update task
  ipcMain.handle('tasks:update', (_event, id: string, updates: UpdateTaskInput) => {
    return wrapResponse(() => {
      const task = updateTask(id, updates);
      if (!task) throw new Error('Task not found');
      return task;
    });
  });

  // Delete task (soft delete)
  ipcMain.handle('tasks:delete', (_event, id: string) => {
    return wrapResponse(() => {
      const deleted = deleteTask(id);
      if (!deleted) throw new Error('Task not found');
      return true;
    });
  });

  // Get task by ID
  ipcMain.handle('tasks:getById', (_event, id: string) => {
    return wrapResponse(() => {
      const task = getTaskById(id);
      if (!task) throw new Error('Task not found');
      return task;
    });
  });

  // Get tasks by date
  ipcMain.handle('tasks:getByDate', (_event, date: string) => {
    return wrapResponse(() => getTasksByDate(date));
  });

  // Get tasks by date range
  ipcMain.handle('tasks:getByRange', (_event, startDate: string, endDate: string) => {
    return wrapResponse(() => getTasksByDateRange(startDate, endDate));
  });

  // Get tasks with filters
  ipcMain.handle('tasks:filter', (_event, filters: TaskFilters) => {
    return wrapResponse(() => getTasksWithFilters(filters));
  });

  // Toggle task status
  ipcMain.handle('tasks:toggle', (_event, id: string) => {
    return wrapResponse(() => {
      const task = toggleTaskStatus(id);
      if (!task) throw new Error('Task not found');
      return task;
    });
  });

  // Get all tasks
  ipcMain.handle('tasks:getAll', () => {
    return wrapResponse(() => getAllTasks());
  });
}
