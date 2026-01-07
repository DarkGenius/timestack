import { Client } from 'pg';
import {
  getPendingTasks,
  markTasksAsSynced,
  markTasksAsConflict,
  upsertTasks
} from '../database/queries';
import { Task, SyncResult, SyncProgress } from '../../shared/types';

export class SyncService {
  private client: Client | null = null;
  private currentUserId: string | null = null;
  private isSyncing = false;
  private stopRequested = false;
  private lastResult?: SyncResult;
  private lastError?: string;

  private static readonly CONNECTION_TIMEOUT_MS = 10000; // 10 seconds
  private static readonly QUERY_TIMEOUT_MS = 30000; // 30 seconds
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_RETRY_DELAY_MS = 1000; // 1 second

  constructor(private connectionString: string) {}

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async connect(connString?: string): Promise<boolean> {
    const finalConnectionString = connString || this.connectionString;
    if (!finalConnectionString) {
      console.error('No connection string provided for SyncService');
      return false;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= SyncService.MAX_RETRIES; attempt++) {
      try {
        this.client = new Client({
          connectionString: finalConnectionString,
          ssl: { rejectUnauthorized: false }, // Required for Neon
          connectionTimeoutMillis: SyncService.CONNECTION_TIMEOUT_MS,
          query_timeout: SyncService.QUERY_TIMEOUT_MS
        });
        await this.client.connect();
        console.log(`Connected to Neon database (attempt ${attempt})`);
        return true;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `Connection attempt ${attempt}/${SyncService.MAX_RETRIES} failed:`,
          lastError.message
        );
        this.client = null;

        if (attempt < SyncService.MAX_RETRIES) {
          const delayMs = SyncService.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delayMs}ms...`);
          await this.delay(delayMs);
        }
      }
    }

    console.error('Failed to connect to Neon after all retries:', lastError?.message);
    return false;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }

  setUserId(userId: string | null): void {
    this.currentUserId = userId;
  }

  getUserId(): string | null {
    return this.currentUserId;
  }

  getSyncProgress(): SyncProgress {
    return {
      isSyncing: this.isSyncing,
      lastResult: this.lastResult,
      error: this.lastError
    };
  }

  cancelSync(): void {
    if (this.isSyncing) {
      this.stopRequested = true;
    }
  }

  async sync(): Promise<SyncResult | null> {
    if (this.isSyncing || !this.currentUserId || !this.client) return null;

    this.isSyncing = true;
    this.stopRequested = false;
    this.lastError = undefined;

    const result: SyncResult = {
      pulledCount: 0,
      pushedCount: 0,
      conflictCount: 0,
      timestamp: new Date().toISOString()
    };

    try {
      console.log('Starting sync for user:', this.currentUserId);

      // 1. Pull changes from Neon
      if (this.stopRequested) throw new Error('Sync cancelled by user');
      result.pulledCount = await this.pull();

      // 2. Push local changes to Neon (with conflict detection)
      if (this.stopRequested) throw new Error('Sync cancelled by user');
      const pushResult = await this.push();
      result.pushedCount = pushResult.pushed;
      result.conflictCount = pushResult.conflicts;

      if (result.conflictCount > 0) {
        console.warn(`Sync completed with ${result.conflictCount} conflict(s)`);
      } else {
        console.log('Sync completed successfully:', result);
      }

      this.lastResult = result;
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown sync error';
      console.error('Sync failed:', errorMsg);
      this.lastError = errorMsg;
      throw error;
    } finally {
      this.isSyncing = false;
      this.stopRequested = false;
    }
  }

  private isValidTask(row: unknown): row is Task {
    if (typeof row !== 'object' || row === null) return false;
    const r = row as Record<string, unknown>;
    return (
      typeof r.id === 'string' &&
      typeof r.title === 'string' &&
      typeof r.date === 'string' &&
      typeof r.created_at === 'string' &&
      typeof r.updated_at === 'string'
    );
  }

  private async pull(): Promise<number> {
    if (!this.client || !this.currentUserId) return 0;

    const res = await this.client.query(
      'SELECT * FROM tasks WHERE user_id = $1 OR user_id IS NULL',
      [this.currentUserId]
    );

    // Validate remote tasks to prevent schema mismatch errors
    const remoteTasks = res.rows.filter((row) => this.isValidTask(row)) as Task[];
    const invalidCount = res.rows.length - remoteTasks.length;
    if (invalidCount > 0) {
      console.warn(`Skipped ${invalidCount} invalid task(s) from remote database`);
    }

    if (remoteTasks.length > 0) {
      upsertTasks(remoteTasks);
    }
    return remoteTasks.length;
  }

  private async push(): Promise<{ pushed: number; conflicts: number }> {
    if (!this.client || !this.currentUserId) return { pushed: 0, conflicts: 0 };

    const pendingTasks = getPendingTasks(this.currentUserId);
    if (pendingTasks.length === 0) return { pushed: 0, conflicts: 0 };

    let pushedCount = 0;
    let conflictCount = 0;
    const successfullyPushedIds: string[] = [];
    const conflictIds: string[] = [];

    // Use transaction for atomicity and better performance
    await this.client.query('BEGIN');
    try {
      for (const task of pendingTasks) {
        if (this.stopRequested) {
          // Rollback on cancellation to maintain consistency
          await this.client.query('ROLLBACK');
          throw new Error('Push cancelled by user');
        }

        // Check if there's a conflict: remote version is newer than our local version
        const remoteCheck = await this.client.query('SELECT updated_at FROM tasks WHERE id = $1', [
          task.id
        ]);

        if (remoteCheck.rows.length > 0) {
          const remoteUpdatedAt = remoteCheck.rows[0].updated_at as string;
          if (remoteUpdatedAt > task.updated_at) {
            // Conflict detected: remote is newer, don't overwrite
            console.warn(`Conflict detected for task ${task.id}: remote is newer`);
            conflictCount++;
            conflictIds.push(task.id);
            continue; // Skip this task, don't push
          }
        }

        // No conflict, safe to push
        const taskWithUser = { ...task, user_id: this.currentUserId };

        await this.client.query(
          `
          INSERT INTO tasks (
            id, title, description, date, priority, color, 
            estimated_time, actual_time, status, completed_at, 
            created_at, updated_at, deleted_at, moved_from_date, user_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
          ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            date = EXCLUDED.date,
            priority = EXCLUDED.priority,
            color = EXCLUDED.color,
            estimated_time = EXCLUDED.estimated_time,
            actual_time = EXCLUDED.actual_time,
            status = EXCLUDED.status,
            completed_at = EXCLUDED.completed_at,
            updated_at = EXCLUDED.updated_at,
            deleted_at = EXCLUDED.deleted_at,
            moved_from_date = EXCLUDED.moved_from_date,
            user_id = EXCLUDED.user_id
        `,
          [
            taskWithUser.id,
            taskWithUser.title,
            taskWithUser.description,
            taskWithUser.date,
            taskWithUser.priority,
            taskWithUser.color,
            taskWithUser.estimated_time,
            taskWithUser.actual_time,
            taskWithUser.status,
            taskWithUser.completed_at,
            taskWithUser.created_at,
            taskWithUser.updated_at,
            taskWithUser.deleted_at,
            taskWithUser.moved_from_date,
            taskWithUser.user_id
          ]
        );
        pushedCount++;
        successfullyPushedIds.push(task.id);
      }

      await this.client.query('COMMIT');
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }

    // Mark successfully pushed tasks as synced
    if (successfullyPushedIds.length > 0) {
      markTasksAsSynced(successfullyPushedIds, this.currentUserId);
    }

    // Mark conflicting tasks with 'conflict' status
    if (conflictIds.length > 0) {
      markTasksAsConflict(conflictIds, this.currentUserId);
    }

    return { pushed: pushedCount, conflicts: conflictCount };
  }
}
