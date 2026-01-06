import Database from 'better-sqlite3'

export function runMigrations(db: Database.Database): void {
  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
      color TEXT DEFAULT '#e5e7eb',
      estimated_time INTEGER,
      actual_time INTEGER,
      status TEXT CHECK(status IN ('open', 'completed')) DEFAULT 'open',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      moved_from_date TEXT
    )
  `)

  // Add moved_from_date column if it doesn't exist
  try {
    const tableInfo = db.prepare('PRAGMA table_info(tasks)').all() as { name: string }[]
    const hasMovedFromDate = tableInfo.some((col) => col.name === 'moved_from_date')
    if (!hasMovedFromDate) {
      db.exec('ALTER TABLE tasks ADD COLUMN moved_from_date TEXT')
    }
  } catch (error) {
    console.error('Failed to add moved_from_date column:', error)
  }

  // Create indexes for fast queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_updated ON tasks(updated_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(deleted_at);
  `)

  // Create sync_log table for future S3 sync
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      s3_version TEXT
    )
  `)

  // Create settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)
}
