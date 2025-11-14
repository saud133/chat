/**
 * Express Backend Server for Legal Chat Analytics
 * 
 * This server provides:
 * - User tracking and management
 * - Visit tracking for page navigation
 * - Interaction tracking for chat Q&A pairs
 * - Admin dashboard API endpoints
 * 
 * Port: 4000
 * CORS: Enabled for http://localhost:3000 (React dev server)
 */

const express = require('express');
const cors = require('cors');
const { initDb, query, queryOne, run } = require('./db');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',  // React dev server
  credentials: true
}));
app.use(express.json());

// Initialize database on startup
initDb();

// ============================================
// TRACKING ENDPOINTS
// ============================================

/**
 * POST /api/track/visit
 * Track a page visit
 * 
 * Body: { sessionId, userId (nullable), path }
 * 
 * Creates a visit record with current timestamp.
 * Used to track user navigation and page views.
 */
app.post('/api/track/visit', (req, res) => {
  try {
    const { sessionId, userId, path } = req.body;
    
    if (!sessionId || !path) {
      return res.status(400).json({ error: 'sessionId and path are required' });
    }
    
    const result = run(
      'INSERT INTO visits (session_id, user_id, path, created_at) VALUES (?, ?, ?, datetime("now"))',
      [sessionId, userId || null, path]
    );
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

/**
 * POST /api/track/interaction
 * Track a chat interaction (question + answer pair)
 * 
 * Body: { sessionId, userId (nullable), questionText, answerText, sourcePage }
 * 
 * Creates an interaction record and updates user's last_seen_at if userId is provided.
 * This is called after each successful chat response from the n8n backend.
 */
app.post('/api/track/interaction', (req, res) => {
  try {
    const { sessionId, userId, questionText, answerText, sourcePage } = req.body;
    
    if (!sessionId || !questionText || !sourcePage) {
      return res.status(400).json({ 
        error: 'sessionId, questionText, and sourcePage are required' 
      });
    }
    
    // Insert interaction
    const result = run(
      `INSERT INTO interactions 
       (session_id, user_id, question_text, answer_text, source_page, created_at) 
       VALUES (?, ?, ?, ?, ?, datetime("now"))`,
      [
        sessionId, 
        userId || null, 
        questionText, 
        answerText || null, 
        sourcePage
      ]
    );
    
    // Update user's last_seen_at if userId is provided
    if (userId) {
      run(
        'UPDATE users SET last_seen_at = datetime("now") WHERE id = ?',
        [userId]
      );
    }
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * POST /api/users/upsert
 * Create or update a user
 * 
 * Body: { email, name, isRegistered }
 * 
 * If a user with the same email exists, updates their information.
 * Otherwise creates a new user record.
 * Returns the user object with id.
 * 
 * This is called when a user logs in or registers.
 */
app.post('/api/users/upsert', (req, res) => {
  try {
    const { email, name, isRegistered } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    
    // Check if user exists
    const existing = queryOne('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existing) {
      // Update existing user
      run(
        `UPDATE users 
         SET name = COALESCE(?, name), 
             is_registered = COALESCE(?, is_registered),
             last_seen_at = datetime("now")
         WHERE email = ?`,
        [name || null, isRegistered !== undefined ? isRegistered : null, email]
      );
      
      const updated = queryOne('SELECT * FROM users WHERE email = ?', [email]);
      res.json(updated);
    } else {
      // Insert new user
      const result = run(
        `INSERT INTO users (email, name, is_registered, created_at, last_seen_at) 
         VALUES (?, ?, ?, datetime("now"), datetime("now"))`,
        [email, name || null, isRegistered ? 1 : 0]
      );
      
      const newUser = queryOne('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
      res.json(newUser);
    }
  } catch (error) {
    console.error('Error upserting user:', error);
    res.status(500).json({ error: 'Failed to upsert user' });
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * GET /api/admin/summary
 * Get dashboard summary statistics
 * 
 * Returns aggregated metrics:
 * - totalUsers: All users in the system
 * - totalRegisteredUsers: Users with is_registered = 1
 * - totalVisitors: Distinct session_ids from visits
 * - totalVisits: Total visit records
 * - totalInteractions: Total interaction records
 * - interactionsToday: Interactions created today
 * - last24HoursInteractions: Interactions in last 24 hours
 */
app.get('/api/admin/summary', (req, res) => {
  try {
    const totalUsers = queryOne('SELECT COUNT(*) as count FROM users').count;
    const totalRegisteredUsers = queryOne(
      'SELECT COUNT(*) as count FROM users WHERE is_registered = 1'
    ).count;
    const totalVisitors = queryOne(
      'SELECT COUNT(DISTINCT session_id) as count FROM visits'
    ).count;
    const totalVisits = queryOne('SELECT COUNT(*) as count FROM visits').count;
    const totalInteractions = queryOne('SELECT COUNT(*) as count FROM interactions').count;
    
    // Interactions today (date only, ignoring time)
    const interactionsToday = queryOne(
      `SELECT COUNT(*) as count FROM interactions 
       WHERE DATE(created_at) = DATE('now')`
    ).count;
    
    // Interactions in last 24 hours
    const last24HoursInteractions = queryOne(
      `SELECT COUNT(*) as count FROM interactions 
       WHERE created_at >= datetime('now', '-24 hours')`
    ).count;
    
    res.json({
      totalUsers,
      totalRegisteredUsers,
      totalVisitors,
      totalVisits,
      totalInteractions,
      interactionsToday,
      last24HoursInteractions
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

/**
 * GET /api/admin/interactions
 * Get paginated list of interactions
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20)
 * 
 * Returns: { interactions: [...], total, page, pageSize, totalPages }
 */
app.get('/api/admin/interactions', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const total = queryOne('SELECT COUNT(*) as count FROM interactions').count;
    
    // Get paginated interactions (newest first)
    const interactions = query(
      `SELECT id, session_id, user_id, question_text, answer_text, source_page, created_at
       FROM interactions
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    
    res.json({
      interactions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Analytics server running on http://localhost:${PORT}`);
  console.log(`📊 Admin dashboard API available at http://localhost:${PORT}/api/admin`);
});

