# API Setup Guide for Dashboard

## Problem
The dashboard page is returning a 404 error when fetching data from `/api/usage` because there's no backend server running.

## Solution
I've created a simple Express.js API server that provides the required endpoints with mock data.

## Files Created/Modified

### 1. `server.js` - Main API Server
- Express server running on port 3001
- Provides `/api/usage` endpoints
- Includes mock data for testing
- CORS enabled for frontend communication

### 2. `package.json` - Updated Dependencies
- Added `express` and `cors` dependencies
- Added `concurrently` for running both servers
- Added new scripts: `api` and `dev`

### 3. `src/utils/usageTracker.js` - Updated API URLs
- Changed API calls to use `http://localhost:3001`
- Fixed endpoint URLs for proper communication

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the API Server
```bash
npm run api
```

This will start the API server on `http://localhost:3001`

### Step 3: Start the React App (in a new terminal)
```bash
npm start
```

This will start the React app on `http://localhost:3000`

### Step 4: Test the API
Open your browser and go to:
- `http://localhost:3001/api/health` - Health check
- `http://localhost:3001/api/usage` - Usage statistics
- `http://localhost:3001/api/usage/users` - User data

### Step 5: Test the Dashboard
1. Go to `http://localhost:3000`
2. Login to your account
3. Navigate to the Dashboard page
4. The dashboard should now load with mock data

## Alternative: Run Both Servers Together
```bash
npm run dev
```

This will start both the React app and API server simultaneously.

## API Endpoints

### GET /api/health
Returns server status and timestamp.

### GET /api/usage
Returns usage statistics:
```json
{
  "total_usage": 46,
  "total_users": 3,
  "registered_users": 2,
  "guest_users": 1,
  "recent_activity": 2,
  "topUsers": [...]
}
```

### GET /api/usage/users
Returns detailed user data:
```json
[
  {
    "user_id": "user-abc123def",
    "username": "John Doe",
    "email": "john@example.com",
    "is_registered": true,
    "usage_count": 15,
    "first_used_at": "2023-12-01T10:00:00Z",
    "last_used_at": "2023-12-21T15:30:00Z"
  }
]
```

### POST /api/usage
Tracks new usage:
```json
{
  "userId": "user-xyz789",
  "username": "Jane Doe",
  "email": "jane@example.com",
  "isRegistered": true
}
```

## Mock Data
The API includes sample data for testing:
- 3 sample users (2 registered, 1 guest)
- Realistic usage counts and timestamps
- Proper data structure matching the database schema

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, change the port in `server.js`:
```javascript
const PORT = process.env.API_PORT || 3002; // Change to 3002 or another port
```

### CORS Issues
The server includes CORS middleware, but if you encounter issues, check that the frontend is making requests to the correct port.

### Dashboard Still Shows 404
1. Make sure the API server is running (`npm run api`)
2. Check browser console for network errors
3. Verify the API endpoints are accessible at `http://localhost:3001/api/usage`

## Production Deployment
For production, you would:
1. Replace mock data with real database (SQLite/PostgreSQL)
2. Add authentication middleware
3. Deploy API server to a cloud service
4. Update frontend API URLs to production endpoints

## Testing
Run the test script to verify all endpoints:
```bash
node test-api.js
```

This will test all API endpoints and show the responses.
