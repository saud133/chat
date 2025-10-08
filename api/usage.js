// Vercel serverless function for usage statistics
// This file handles both GET and POST requests to /api/usage

// Mock data for immediate testing (replace with real database in production)
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
  },
  {
    user_id: 'user-guest999',
    username: 'Guest User',
    email: null,
    is_registered: false,
    usage_count: 5,
    first_used_at: '2023-12-20T11:30:00Z',
    last_used_at: '2023-12-21T09:15:00Z'
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

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // GET /api/usage - Return usage statistics
      const stats = calculateStats();
      const topUsers = mockUsers
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10);
      
      res.status(200).json({
        ...stats,
        topUsers: topUsers
      });
    } else if (req.method === 'POST') {
      // POST /api/usage - Track new usage
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
        
        res.status(200).json({ 
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
        
        res.status(200).json({ 
          success: true, 
          message: 'Usage created',
          usageCount: 1
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}