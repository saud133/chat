# Dashboard API Deployment Guide

## Problem
The Dashboard page shows "Failed to load user data" because there's no backend API server running to handle the `/api/usage` requests.

## Solution
I've created a production-ready backend server that serves both the React app and the API endpoints.

## Files Created

### 1. `backend-server.js` - Production Server
- Serves React app from `build/` directory
- Provides API endpoints at `/api/*`
- Includes mock data for immediate testing
- Handles all routing for SPA

### 2. `test-api.html` - API Testing Page
- Browser-based API testing
- Visual feedback for endpoint status
- JSON response display

### 3. `test-dashboard-api.js` - Node.js Test Script
- Command-line API testing
- Automated endpoint verification

## Quick Start

### Option 1: Development Mode (Recommended)
```bash
# Install dependencies
npm install

# Start both React app and API server
npm run dev
```
- React app: http://localhost:3000
- API server: http://localhost:3001

### Option 2: Production Mode
```bash
# Install dependencies
npm install

# Build React app
npm run build

# Start production server
npm run server
```
- Full app with API: http://localhost:3000

### Option 3: One-Command Deploy
```bash
# Install, build, and start in one command
npm run deploy
```

## API Endpoints

### GET /api/health
```json
{
  "status": "OK",
  "timestamp": "2023-12-21T10:30:00Z",
  "message": "API server is running"
}
```

### GET /api/usage
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
Tracks new chat usage and updates user statistics.

## Testing

### 1. Browser Testing
1. Start the server: `npm run server`
2. Open: http://localhost:3000/test-api.html
3. Click "Test All Endpoints"
4. Verify all endpoints return 200 OK

### 2. Command Line Testing
```bash
# Start server
npm run server

# In another terminal
node test-dashboard-api.js
```

### 3. Manual Testing
1. Go to http://localhost:3000
2. Login to your account
3. Navigate to Dashboard
4. Should load with mock data (no errors)

## Verification Steps

### ✅ Check API Endpoints
- [ ] http://localhost:3000/api/health returns 200 OK
- [ ] http://localhost:3000/api/usage returns JSON data
- [ ] http://localhost:3000/api/usage/users returns user array

### ✅ Check Dashboard Page
- [ ] Dashboard loads without "Failed to load user data" error
- [ ] Statistics cards show mock data
- [ ] Users table displays sample users
- [ ] No 404 errors in browser console

### ✅ Check Browser Console
Before fix:
```
GET http://localhost:3000/api/usage 404 (Not Found)
```

After fix:
```
GET http://localhost:3000/api/usage 200 (OK)
```

## Troubleshooting

### Dashboard Still Shows Error
1. **Check server is running**: `npm run server`
2. **Check API endpoints**: Visit http://localhost:3000/api/health
3. **Check browser console**: Look for network errors
4. **Clear browser cache**: Hard refresh (Ctrl+F5)

### Port Already in Use
```bash
# Change port in backend-server.js
const PORT = process.env.PORT || 3001;
```

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Production Deployment

### Heroku
```bash
# Add to package.json
"engines": {
  "node": "16.x"
}

# Deploy
git add .
git commit -m "Add dashboard API"
git push heroku main
```

### Vercel
```bash
# Add vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "backend-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend-server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/backend-server.js"
    }
  ]
}
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "server"]
```

## Mock Data

The server includes realistic mock data:
- **3 Sample Users**: 2 registered, 1 guest
- **Usage Counts**: 8-23 messages per user
- **Recent Activity**: Last 24 hours data
- **Complete Profiles**: Names, emails, timestamps

## Next Steps

1. **Replace Mock Data**: Connect to real database
2. **Add Authentication**: Secure API endpoints
3. **Add Real-time Updates**: WebSocket integration
4. **Add Analytics**: More detailed statistics
5. **Add Export**: CSV/PDF export functionality

## Support

If you encounter issues:
1. Check the server logs for errors
2. Verify all dependencies are installed
3. Test API endpoints individually
4. Check browser console for errors
5. Ensure port 3000 is available

The dashboard should now load successfully with mock data and no 404 errors!
