import { ElectronAPI } from '@electron-toolkit/preload';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  ApiResponse,
  Task
} from '../shared/types';

interface TasksAPI {
  create: (input: CreateTaskInput) => Promise<ApiResponse<Task>>;
  update: (id: string, updates: UpdateTaskInput) => Promise<ApiResponse<Task>>;
  delete: (id: string) => Promise<ApiResponse<boolean>>;
  getById: (id: string) => Promise<ApiResponse<Task>>;
  getByDate: (date: string) => Promise<ApiResponse<Task[]>>;
  getByRange: (startDate: string, endDate: string) => Promise<ApiResponse<Task[]>>;
  filter: (filters: TaskFilters) => Promise<ApiResponse<Task[]>>;
  toggle: (id: string) => Promise<ApiResponse<Task>>;
  getAll: () => Promise<ApiResponse<Task[]>>;
}

interface API {
  tasks: TasksAPI;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
