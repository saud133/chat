-- Chat Usage Tracking Database Schema
-- This database tracks chat usage activity for both registered and guest users

CREATE TABLE IF NOT EXISTS chat_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE, -- The chatUserId from localStorage
    username TEXT, -- User's name if registered, NULL for guests
    email TEXT, -- User's email if registered, NULL for guests
    is_registered BOOLEAN DEFAULT FALSE, -- Whether user is logged in
    usage_count INTEGER DEFAULT 0, -- Number of chat interactions
    first_used_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- When user first used chat
    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- When user last used chat
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_id ON chat_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_is_registered ON chat_usage(is_registered);
CREATE INDEX IF NOT EXISTS idx_last_used_at ON chat_usage(last_used_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_chat_usage_updated_at 
    AFTER UPDATE ON chat_usage
    FOR EACH ROW
    BEGIN
        UPDATE chat_usage SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
