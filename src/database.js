const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '../stasha.db'))

// Create users table with security question
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    security_question TEXT,
    security_answer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Add security columns if they don't exist yet
try {
  db.exec(`ALTER TABLE users ADD COLUMN security_question TEXT`)
} catch (e) {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN security_answer TEXT`)
} catch (e) {}

// Create tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Low',
    category TEXT,
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`)

console.log('Database connected and tables created!')

module.exports = db