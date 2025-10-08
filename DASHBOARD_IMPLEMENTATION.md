# Chat Usage Dashboard Implementation

## Overview
This implementation adds a comprehensive chat usage tracking system with a dashboard to monitor user activity and engagement.

## Analysis of Current userId Logic

### How userId is Currently Generated:
1. **Guest Users**: Generated using `"user-" + Math.random().toString(36).substr(2, 9)` and stored in localStorage as `"chatUserId"`
2. **Registered Users**: When logged in, they get a `chatUserId` generated the same way, but their actual user data (name, email) is stored separately in localStorage as `"user"`
3. **Persistence**: Both guest and registered users have their `chatUserId` persisted in localStorage
4. **Auth Integration**: The `AuthContext` clears `chatUserId` on logout, but generates a new one on next chat usage

## Implementation Details

### 1. Database Schema (`database/schema.sql`)
- **Table**: `chat_usage`
- **Fields**:
  - `user_id`: The chatUserId from localStorage (unique)
  - `username`: User's name if registered, NULL for guests
  - `email`: User's email if registered, NULL for guests
  - `is_registered`: Boolean indicating if user is logged in
  - `usage_count`: Number of chat interactions
  - `first_used_at`: When user first used chat
  - `last_used_at`: When user last used chat
  - Timestamps for tracking

### 2. API Endpoints (`api/usage.js`)
- **POST /api/usage**: Track chat usage (creates or updates user record)
- **GET /api/usage**: Get overall usage statistics
- **GET /api/usage/users**: Get all users with their usage data

### 3. Dashboard Page (`src/pages/DashboardPage.js`)
- **Statistics Cards**:
  - Total Messages
  - Total Users
  - Registered Users
  - Guest Users
  - Recent Activity (last 24 hours)
- **Users Table**:
  - Username (or "Guest")
  - User ID
  - Type (Registered/Guest)
  - Message Count
  - Last Activity Time

### 4. Usage Tracking Integration
- **Utility**: `src/utils/usageTracker.js` - Handles API calls
- **Integration**: Added to `ChatPage.js` - Tracks usage on every message send
- **Data**: Sends userId, username, email, and registration status

### 5. Navigation Integration
- **Route**: Added `/dashboard` route to `App.js` (protected)
- **Link**: Added "Dashboard" link to Header navigation (for authenticated users)

## File Structure
```
├── database/
│   └── schema.sql                 # Database schema
├── api/
│   ├── usage.js                   # API endpoints
│   ├── server.js                  # Main server file
│   └── package.json               # API dependencies
├── src/
│   ├── pages/
│   │   ├── DashboardPage.js       # Dashboard component
│   │   └── DashboardPage.css      # Dashboard styles
│   ├── utils/
│   │   └── usageTracker.js        # Usage tracking utility
│   ├── components/
│   │   └── Header.js              # Updated with dashboard link
│   └── App.js                     # Updated with dashboard route
```

## Setup Instructions

### 1. Database Setup
```bash
# Navigate to database directory
cd database

# Create SQLite database
sqlite3 chat_usage.db < schema.sql
```

### 2. API Setup
```bash
# Navigate to API directory
cd api

# Install dependencies
npm install

# Start the API server
npm start
# or for development
npm run dev
```

### 3. Frontend Integration
The frontend changes are already integrated:
- Dashboard page is accessible at `/dashboard` (requires authentication)
- Usage tracking is automatically enabled in the chat
- Dashboard link appears in the header for authenticated users

## Features

### Dashboard Statistics
- **Real-time Data**: Statistics update when users interact with chat
- **User Classification**: Distinguishes between registered and guest users
- **Activity Tracking**: Shows recent activity and usage patterns
- **Responsive Design**: Works on desktop and mobile devices

### Usage Tracking
- **Automatic Tracking**: Every message send is tracked
- **User Identification**: Links chat activity to user accounts
- **Persistent Data**: Usage data persists across sessions
- **Error Handling**: Graceful handling of API failures

### Security
- **Protected Route**: Dashboard only accessible to authenticated users
- **Data Privacy**: Only tracks usage counts, not message content
- **User Consent**: Uses existing userId logic, no additional tracking

## API Endpoints

### POST /api/usage
**Body**:
```json
{
  "userId": "user-abc123def",
  "username": "John Doe",
  "email": "john@example.com",
  "isRegistered": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Usage updated",
  "usageCount": 15
}
```

### GET /api/usage
**Response**:
```json
{
  "total_usage": 1250,
  "total_users": 45,
  "registered_users": 20,
  "guest_users": 25,
  "recent_activity": 8,
  "topUsers": [...]
}
```

### GET /api/usage/users
**Response**:
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

## Integration with Existing System

The implementation seamlessly integrates with the existing chat system:
- **No Breaking Changes**: All existing functionality preserved
- **Same userId Logic**: Uses the existing userId generation method
- **Auth Integration**: Works with existing authentication system
- **Consistent Design**: Matches existing page styles and layout
- **RTL Support**: Supports right-to-left languages like Arabic

## Monitoring and Analytics

The dashboard provides insights into:
- **User Engagement**: How often users interact with the chat
- **User Distribution**: Ratio of registered vs guest users
- **Activity Patterns**: Recent usage trends
- **Top Users**: Most active users in the system

This implementation provides a comprehensive solution for tracking and monitoring chat usage while maintaining the existing system's functionality and design consistency.
