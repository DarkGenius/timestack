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
import { SyncService } from '../services/SyncService';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  ApiResponse
} from '../../shared/types';

async function wrapResponse<T>(fn: () => T | Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    console.error('IPC Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function registerIpcHandlers(syncService: SyncService): void {
  // Auth handlers
  ipcMain.handle('auth:setSession', (_event, userId: string | null) => {
    return wrapResponse(async () => {
      syncService.setUserId(userId);
      if (userId) {
        // Use internal connection string loaded in Main process
        await syncService.connect();
        await syncService.sync();
      } else {
        await syncService.disconnect();
      }
      return true;
    });
  });

  ipcMain.handle('auth:getSession', () => {
    // This is simplified; you might want to store this in a more persistent way
    return wrapResponse(() => ({ userId: syncService.getUserId() }));
  });

  // Sync handlers
  ipcMain.handle('sync:now', () => {
    return wrapResponse(() => syncService.sync());
  });

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
