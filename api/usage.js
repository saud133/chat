// API endpoint for chat usage tracking
// This file should be deployed to your backend/server

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Initialize database
const dbPath = path.join(__dirname, '../database/chat_usage.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      username TEXT,
      email TEXT,
      is_registered BOOLEAN DEFAULT FALSE,
      usage_count INTEGER DEFAULT 0,
      first_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_id ON chat_usage(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_is_registered ON chat_usage(is_registered)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_last_used_at ON chat_usage(last_used_at)`);
});

// POST /api/usage - Track chat usage
router.post('/', (req, res) => {
  const { userId, username, email, isRegistered } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const now = new Date().toISOString();
  
  // Check if user exists
  db.get('SELECT * FROM chat_usage WHERE user_id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      // Update existing user
      const updateQuery = `
        UPDATE chat_usage 
        SET usage_count = usage_count + 1,
            last_used_at = ?,
            username = COALESCE(?, username),
            email = COALESCE(?, email),
            is_registered = ?
        WHERE user_id = ?
      `;
      
      db.run(updateQuery, [now, username, email, isRegistered, userId], function(err) {
        if (err) {
          console.error('Update error:', err);
          return res.status(500).json({ error: 'Failed to update usage' });
        }
        
        res.json({ 
          success: true, 
          message: 'Usage updated',
          usageCount: row.usage_count + 1
        });
      });
    } else {
      // Create new user
      const insertQuery = `
        INSERT INTO chat_usage (user_id, username, email, is_registered, usage_count, first_used_at, last_used_at)
        VALUES (?, ?, ?, ?, 1, ?, ?)
      `;
      
      db.run(insertQuery, [userId, username, email, isRegistered, now, now], function(err) {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: 'Failed to create usage record' });
        }
        
        res.json({ 
          success: true, 
          message: 'Usage created',
          usageCount: 1
        });
      });
    }
  });
});

// GET /api/usage - Get usage statistics
router.get('/', (req, res) => {
  const queries = [
    // Total usage count
    'SELECT SUM(usage_count) as total_usage FROM chat_usage',
    // Total users
    'SELECT COUNT(*) as total_users FROM chat_usage',
    // Registered users
    'SELECT COUNT(*) as registered_users FROM chat_usage WHERE is_registered = TRUE',
    // Guest users
    'SELECT COUNT(*) as guest_users FROM chat_usage WHERE is_registered = FALSE',
    // Recent activity (last 24 hours)
    'SELECT COUNT(*) as recent_activity FROM chat_usage WHERE last_used_at > datetime("now", "-1 day")',
    // Top users by usage
    'SELECT user_id, username, email, is_registered, usage_count, last_used_at FROM chat_usage ORDER BY usage_count DESC LIMIT 10'
  ];

  let completed = 0;
  const results = {};

  queries.forEach((query, index) => {
    if (index < 5) {
      // Statistics queries
      db.get(query, (err, row) => {
        if (err) {
          console.error('Query error:', err);
          return res.status(500).json({ error: 'Database query error' });
        }
        
        const key = Object.keys(row)[0];
        results[key] = row[key];
        
        completed++;
        if (completed === 5) {
          // Get top users
          db.all(queries[5], (err, rows) => {
            if (err) {
              console.error('Top users query error:', err);
              return res.status(500).json({ error: 'Database query error' });
            }
            
            results.topUsers = rows;
            res.json(results);
          });
        }
      });
    }
  });
});

// GET /api/usage/users - Get all users with their usage data
router.get('/users', (req, res) => {
  const query = `
    SELECT 
      user_id,
      COALESCE(username, 'Guest') as username,
      email,
      is_registered,
      usage_count,
      first_used_at,
      last_used_at
    FROM chat_usage 
    ORDER BY last_used_at DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    
    res.json(rows);
  });
});

module.exports = router;
