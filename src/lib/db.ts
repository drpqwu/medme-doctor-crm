import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_PATH || './data/medme.db'
const dbDir = path.dirname(path.resolve(DB_PATH))

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(path.resolve(DB_PATH))
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initializeSchema(_db)
  }
  return _db
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'member')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT,
      hospital TEXT,
      title TEXT,
      phone TEXT,
      line_id TEXT,
      email TEXT,
      photo_url TEXT,
      surgical_preferences TEXT,
      common_devices TEXT,
      consultation_habits TEXT,
      notes TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL DEFAULT '#1565C0',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctor_tags (
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (doctor_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      visit_date DATE NOT NULL,
      content TEXT NOT NULL,
      next_followup TEXT,
      next_followup_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS satisfactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      visit_id INTEGER REFERENCES visits(id) ON DELETE SET NULL,
      service_type TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      issue_items TEXT,
      reason TEXT,
      recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_doctors_name ON doctors(name);
    CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
    CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital);
    CREATE INDEX IF NOT EXISTS idx_visits_doctor_id ON visits(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
    CREATE INDEX IF NOT EXISTS idx_visits_next_followup_date ON visits(next_followup_date);
  `)

  // Seed admin user if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync('admin123', 10)
    db.prepare(`
      INSERT INTO users (username, password_hash, display_name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hash, '系統管理員', 'admin')

    // Seed some default tags
    const tags = [
      { name: 'VIP', color: '#d32f2f' },
      { name: '重點客戶', color: '#f57c00' },
      { name: '待開發', color: '#388e3c' },
      { name: '需追蹤', color: '#7b1fa2' },
      { name: '新客戶', color: '#0288d1' },
    ]
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)')
    for (const tag of tags) {
      insertTag.run(tag.name, tag.color)
    }
  }
}

export default getDb
