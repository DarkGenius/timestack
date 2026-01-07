import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  ApiResponse,
  Task
} from '../shared/types';

// Tasks API for renderer
const tasksAPI = {
  create: (input: CreateTaskInput): Promise<ApiResponse<Task>> =>
    ipcRenderer.invoke('tasks:create', input),

  update: (id: string, updates: UpdateTaskInput): Promise<ApiResponse<Task>> =>
    ipcRenderer.invoke('tasks:update', id, updates),

  delete: (id: string): Promise<ApiResponse<boolean>> => ipcRenderer.invoke('tasks:delete', id),

  getById: (id: string): Promise<ApiResponse<Task>> => ipcRenderer.invoke('tasks:getById', id),

  getByDate: (date: string): Promise<ApiResponse<Task[]>> =>
    ipcRenderer.invoke('tasks:getByDate', date),

  getByRange: (startDate: string, endDate: string): Promise<ApiResponse<Task[]>> =>
    ipcRenderer.invoke('tasks:getByRange', startDate, endDate),

  filter: (filters: TaskFilters): Promise<ApiResponse<Task[]>> =>
    ipcRenderer.invoke('tasks:filter', filters),

  toggle: (id: string): Promise<ApiResponse<Task>> => ipcRenderer.invoke('tasks:toggle', id),

  getAll: (): Promise<ApiResponse<Task[]>> => ipcRenderer.invoke('tasks:getAll')
};

const authAPI = {
  setSession: (userId: string | null): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke('auth:setSession', userId),
  getSession: (): Promise<ApiResponse<{ userId: string | null }>> =>
    ipcRenderer.invoke('auth:getSession')
};

const syncAPI = {
  syncNow: (): Promise<ApiResponse<void>> => ipcRenderer.invoke('sync:now')
};

// Custom APIs for renderer
const api = {
  tasks: tasksAPI,
  auth: authAPI,
  sync: syncAPI
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
