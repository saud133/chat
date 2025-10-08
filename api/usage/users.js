// Vercel serverless function for user data
// This file handles GET requests to /api/usage/users

// Mock data (should match the data in api/usage.js)
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

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Return all users sorted by last activity
      const users = mockUsers
        .sort((a, b) => new Date(b.last_used_at) - new Date(a.last_used_at))
        .map(user => ({
          user_id: user.user_id,
          username: user.username || 'Guest',
          email: user.email,
          is_registered: user.is_registered,
          usage_count: user.usage_count,
          first_used_at: user.first_used_at,
          last_used_at: user.last_used_at
        }));

      res.status(200).json(users);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
