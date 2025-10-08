// Simple Express server for API endpoints
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for testing
let mockUsers = [
  {
    user_id: 'user-abc123def',
    username: 'John Doe',
    email: 'john@example.com',
    is_registered: true,
    usage_count: 15,
    first_used_at: '2023-12-01T10:00:00Z',
    last_used_at: '2023-12-21T15:30:00Z'
  },
  {
    user_id: 'user-xyz789ghi',
    username: 'Guest',
    email: null,
    is_registered: false,
    usage_count: 8,
    first_used_at: '2023-12-15T14:20:00Z',
    last_used_at: '2023-12-21T12:45:00Z'
  },
  {
    user_id: 'user-mno456pqr',
    username: 'Jane Smith',
    email: 'jane@example.com',
    is_registered: true,
    usage_count: 23,
    first_used_at: '2023-11-28T09:15:00Z',
    last_used_at: '2023-12-21T16:20:00Z'
  }
];

// Calculate statistics from mock data
const calculateStats = () => {
  const totalUsage = mockUsers.reduce((sum, user) => sum + user.usage_count, 0);
  const totalUsers = mockUsers.length;
  const registeredUsers = mockUsers.filter(user => user.is_registered).length;
  const guestUsers = mockUsers.filter(user => !user.is_registered).length;
  
  // Recent activity (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentActivity = mockUsers.filter(user => 
    new Date(user.last_used_at) > oneDayAgo
  ).length;

  return {
    total_usage: totalUsage,
    total_users: totalUsers,
    registered_users: registeredUsers,
    guest_users: guestUsers,
    recent_activity: recentActivity
  };
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'API server is running'
  });
});

// GET /api/usage - Get usage statistics
app.get('/api/usage', (req, res) => {
  try {
    const stats = calculateStats();
    const topUsers = mockUsers
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10);
    
    res.json({
      ...stats,
      topUsers: topUsers
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

// GET /api/usage/users - Get all users with their usage data
app.get('/api/usage/users', (req, res) => {
  try {
    const users = mockUsers.map(user => ({
      user_id: user.user_id,
      username: user.username || 'Guest',
      email: user.email,
      is_registered: user.is_registered,
      usage_count: user.usage_count,
      first_used_at: user.first_used_at,
      last_used_at: user.last_used_at
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/usage - Track chat usage
app.post('/api/usage', (req, res) => {
  try {
    const { userId, username, email, isRegistered } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Find existing user
    const existingUserIndex = mockUsers.findIndex(user => user.user_id === userId);
    
    if (existingUserIndex !== -1) {
      // Update existing user
      mockUsers[existingUserIndex].usage_count += 1;
      mockUsers[existingUserIndex].last_used_at = new Date().toISOString();
      if (username) mockUsers[existingUserIndex].username = username;
      if (email) mockUsers[existingUserIndex].email = email;
      mockUsers[existingUserIndex].is_registered = isRegistered || false;
      
      res.json({ 
        success: true, 
        message: 'Usage updated',
        usageCount: mockUsers[existingUserIndex].usage_count
      });
    } else {
      // Create new user
      const newUser = {
        user_id: userId,
        username: username || 'Guest',
        email: email || null,
        is_registered: isRegistered || false,
        usage_count: 1,
        first_used_at: new Date().toISOString(),
        last_used_at: new Date().toISOString()
      };
      
      mockUsers.push(newUser);
      
      res.json({ 
        success: true, 
        message: 'Usage created',
        usageCount: 1
      });
    }
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Usage API available at http://localhost:${PORT}/api/usage`);
  console.log(`👥 Users API available at http://localhost:${PORT}/api/usage/users`);
  console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
});
