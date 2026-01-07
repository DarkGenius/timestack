import { Client } from 'pg';
import { getPendingTasks, markTasksAsSynced, upsertTasks } from '../database/queries';
import { Task } from '../../shared/types';

export class SyncService {
  private client: Client | null = null;
  private currentUserId: string | null = null;
  private isSyncing = false;

  constructor(private connectionString: string) {}

  async connect(connString?: string): Promise<boolean> {
    const finalConnectionString = connString || this.connectionString;
    if (!finalConnectionString) {
      console.error('No connection string provided for SyncService');
      return false;
    }
    try {
      this.client = new Client({
        connectionString: finalConnectionString,
        ssl: { rejectUnauthorized: false } // Required for Neon
      });
      await this.client.connect();
      return true;
    } catch (error) {
      console.error('Failed to connect to Neon:', error);
      this.client = null;
      return false;
    }
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

  async sync(): Promise<void> {
    if (this.isSyncing || !this.currentUserId || !this.client) return;
    this.isSyncing = true;

    try {
      console.log('Starting sync for user:', this.currentUserId);

      // 1. Pull changes from Neon
      await this.pull();

      // 2. Push local changes to Neon
      await this.push();

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async pull(): Promise<void> {
    if (!this.client || !this.currentUserId) return;

    // Get the last sync timestamp for this user from SQLite
    // (Implementation detail: we can use a dedicated table or just query the max updated_at)
    // For simplicity, let's just pull everything and let upsertTasks handle the timestamp logic (LWW)
    const res = await this.client.query(
      'SELECT * FROM tasks WHERE user_id = $1 OR user_id IS NULL',
      [this.currentUserId]
    );

    const remoteTasks = res.rows as Task[];
    if (remoteTasks.length > 0) {
      upsertTasks(remoteTasks);
    }
  }

  private async push(): Promise<void> {
    if (!this.client || !this.currentUserId) return;

    const pendingTasks = getPendingTasks(this.currentUserId);
    if (pendingTasks.length === 0) return;

    for (const task of pendingTasks) {
      // Ensure user_id is set for the remote record
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
        WHERE EXCLUDED.updated_at > tasks.updated_at
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
    }

    markTasksAsSynced(pendingTasks.map((t) => t.id));
  }
}
