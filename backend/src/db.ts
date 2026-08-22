import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || './data/prize-incubator.db';

// Ensure the data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: SqlJsDatabase;

/**
 * Initialize the SQLite database (sql.js — pure JS, no native deps).
 * Must be called before any DB operations.
 */
export async function initDb(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();

  // Load existing database file if it exists
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      platform TEXT NOT NULL CHECK (platform IN ('amazon', 'flipkart', 'meesho', 'shopsy')),
      title TEXT,
      pincode TEXT DEFAULT '177001',
      product_group_id TEXT,
      approval_status TEXT DEFAULT 'pending',
      notification_pref TEXT DEFAULT 'instant',
      price_threshold REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      price REAL NOT NULL,
      mrp REAL NOT NULL,
      true_final_price REAL,
      applied_coupon TEXT,
      bank_offer TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS verdicts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      verdict_json TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
      started_at TEXT,
      finished_at TEXT,
      events_json TEXT DEFAULT '[]'
    );
  `);

  // Run dynamic migrations for existing db files (if any)
  try {
    db.run(`ALTER TABLE products ADD COLUMN product_group_id TEXT;`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE products ADD COLUMN approval_status TEXT DEFAULT 'pending';`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE products ADD COLUMN notification_pref TEXT DEFAULT 'instant';`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE products ADD COLUMN price_threshold REAL;`);
  } catch (e) {}

  db.run(`CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id, timestamp)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_verdicts_product ON verdicts(product_id, timestamp)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_agent_runs_product ON agent_runs(product_id)`);

  // Persist to disk
  saveDb();

  return db;
}

/**
 * Save the in-memory database to disk.
 * Call after any write operation.
 */
export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Get the database instance. Throws if initDb() hasn't been called.
 */
export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

/**
 * Helper: run a query and return all matching rows as objects.
 */
export function queryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Helper: run a query and return the first matching row as an object, or null.
 */
export function queryOne(sql: string, params: unknown[] = []): Record<string, unknown> | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Helper: run a write statement (INSERT/UPDATE/DELETE) and return info.
 */
export function runStmt(sql: string, params: unknown[] = []): { changes: number; lastId: number } {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const lastIdRow = queryOne('SELECT last_insert_rowid() as id');
  const lastId = (lastIdRow?.id as number) || 0;
  saveDb();
  return { changes, lastId };
}
