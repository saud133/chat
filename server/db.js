/**
 * Database connection and helper functions for SQLite
 * Uses better-sqlite3 for synchronous SQLite operations
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let db = null;

/**
 * Initialize the database connection and run migrations
 * Creates the database file if it doesn't exist and sets up all tables
 */
function initDb() {
  const dbPath = path.join(__dirname, 'analytics.db');
  
  // Create database connection
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Read and execute migrations
  const migrationsPath = path.join(__dirname, 'migrations.sql');
  const migrationsSQL = fs.readFileSync(migrationsPath, 'utf8');
  
  // Execute all statements in migrations.sql
  db.exec(migrationsSQL);
  
  console.log('✅ Database initialized successfully');
  console.log(`📁 Database file: ${dbPath}`);
  
  return db;
}

/**
 * Get the database instance (must call initDb first)
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

/**
 * Helper to run a SELECT query and return all results
 */
function query(sql, params = []) {
  const stmt = getDb().prepare(sql);
  return stmt.all(params);
}

/**
 * Helper to run a SELECT query and return the first result
 */
function queryOne(sql, params = []) {
  const stmt = getDb().prepare(sql);
  return stmt.get(params);
}

/**
 * Helper to run an INSERT/UPDATE/DELETE query
 * Returns the last inserted row ID for INSERT statements
 */
function run(sql, params = []) {
  const stmt = getDb().prepare(sql);
  const result = stmt.run(params);
  return {
    lastInsertRowid: result.lastInsertRowid,
    changes: result.changes
  };
}

module.exports = {
  initDb,
  getDb,
  query,
  queryOne,
  run
};

