import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './db'
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../../shared/types'

export function createTask(input: CreateTaskInput): Task {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const task: Task = {
    id,
    title: input.title,
    description: input.description || null,
    date: input.date,
    priority: input.priority || 'normal',
    color: input.color || '#e5e7eb',
    estimated_time: input.estimated_time || null,
    actual_time: null,
    status: 'open',
    completed_at: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    sync_status: 'pending'
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, date, priority, color, estimated_time, actual_time, status, completed_at, created_at, updated_at, deleted_at, sync_status)
    VALUES (@id, @title, @description, @date, @priority, @color, @estimated_time, @actual_time, @status, @completed_at, @created_at, @updated_at, @deleted_at, @sync_status)
  `)

  stmt.run(task)
  return task
}

export function updateTask(id: string, updates: UpdateTaskInput): Task | null {
  const db = getDatabase()
  const now = new Date().toISOString()

  // Get current task
  const current = db.prepare('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL').get(id) as
    | Task
    | undefined
  if (!current) return null

  const updated: Task = {
    ...current,
    ...updates,
    updated_at: now,
    sync_status: 'pending'
  }

  // If completing task, set completed_at
  if (updates.status === 'completed' && current.status !== 'completed') {
    updated.completed_at = now
  } else if (updates.status === 'open' && current.status === 'completed') {
    updated.completed_at = null
  }

  const stmt = db.prepare(`
    UPDATE tasks SET
      title = @title,
      description = @description,
      date = @date,
      priority = @priority,
      color = @color,
      estimated_time = @estimated_time,
      actual_time = @actual_time,
      status = @status,
      completed_at = @completed_at,
      updated_at = @updated_at,
      sync_status = @sync_status
    WHERE id = @id
  `)

  stmt.run(updated)
  return updated
}

export function deleteTask(id: string): boolean {
  const db = getDatabase()
  const now = new Date().toISOString()

  // Soft delete
  const result = db
    .prepare(
      `
    UPDATE tasks SET deleted_at = ?, updated_at = ?, sync_status = 'pending'
    WHERE id = ? AND deleted_at IS NULL
  `
    )
    .run(now, now, id)

  return result.changes > 0
}

export function getTaskById(id: string): Task | null {
  const db = getDatabase()
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL').get(id) as
    | Task
    | undefined
  return task || null
}

export function getTasksByDate(date: string): Task[] {
  const db = getDatabase()
  return db
    .prepare(
      `
    SELECT * FROM tasks
    WHERE date = ? AND deleted_at IS NULL
    ORDER BY priority DESC, created_at ASC
  `
    )
    .all(date) as Task[]
}

export function getTasksByDateRange(startDate: string, endDate: string): Task[] {
  const db = getDatabase()
  return db
    .prepare(
      `
    SELECT * FROM tasks
    WHERE date >= ? AND date <= ? AND deleted_at IS NULL
    ORDER BY date ASC, priority DESC, created_at ASC
  `
    )
    .all(startDate, endDate) as Task[]
}

export function getTasksWithFilters(filters: TaskFilters): Task[] {
  const db = getDatabase()

  let query = 'SELECT * FROM tasks WHERE deleted_at IS NULL'
  const params: Record<string, string> = {}

  if (filters.date) {
    query += ' AND date = @date'
    params.date = filters.date
  }

  if (filters.startDate && filters.endDate) {
    query += ' AND date >= @startDate AND date <= @endDate'
    params.startDate = filters.startDate
    params.endDate = filters.endDate
  }

  if (filters.status && filters.status !== 'all') {
    query += ' AND status = @status'
    params.status = filters.status
  }

  if (filters.priority && filters.priority !== 'all') {
    query += ' AND priority = @priority'
    params.priority = filters.priority
  }

  query += ' ORDER BY date ASC, priority DESC, created_at ASC'

  return db.prepare(query).all(params) as Task[]
}

export function toggleTaskStatus(id: string): Task | null {
  const db = getDatabase()
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL').get(id) as
    | Task
    | undefined

  if (!task) return null

  const newStatus = task.status === 'completed' ? 'open' : 'completed'
  return updateTask(id, { status: newStatus })
}

export function getAllTasks(): Task[] {
  const db = getDatabase()
  return db
    .prepare(
      `
    SELECT * FROM tasks
    WHERE deleted_at IS NULL
    ORDER BY date ASC, priority DESC, created_at ASC
  `
    )
    .all() as Task[]
}
